import os
import logging
import warnings
import re
import time
import numpy as np

from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from fuzzywuzzy import fuzz

from langchain_community.document_loaders import PyPDFium2Loader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores.utils import filter_complex_metadata

from sentence_transformers import SentenceTransformer, util

# --- CONFIGURATION & LOGGING ---
warnings.filterwarnings("ignore", category=UserWarning, module="pypdfium2")
logging.basicConfig(
    filename="chatbot.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
load_dotenv()
PDF_DIRECTORY = "./resources"
PERSIST_DIRECTORY = "./chroma_db"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TOP_K = 7

# --- FLASK APP INIT ---
app = Flask(__name__)
CORS(app)

# --- EMBEDDINGS & MODEL INIT ---
embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L12-v2')
sbert_model = SentenceTransformer('all-MiniLM-L12-v2')
logging.info("Embeddings and SentenceTransformer initialized")

model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.7,
    top_p=0.9,
    max_tokens=300
)
logging.info("Gemini 1.5 Flash model initialized")

def local_llm(prompt):
    logging.info(f"Prompt sent to Gemini: {prompt[:200]}...")
    response = model.invoke(prompt)
    if not response.content:
        logging.warning("No content in Gemini response")
        return "Error: No response from Gemini."
    logging.info(f"Raw Gemini response: {response.content[:200]}...")
    return response.content.strip()

# --- PROMPT TEMPLATE WITH MARKDOWN INSTRUCTIONS ---
rephrase_template = """
You are Niko, an expert HCI course tutor. Using only the provided lecture note context, answer the question with a clear, concise, and professional explanation, focusing on Human-Computer Interaction (HCI) topics.

**Formatting instructions:**
- Format your answer using Markdown.
- Start with a one-sentence summary.
- Use bullet points for principles, steps, or key aspects.
- Bold principle names or important terms.
- Use italics for definitions or emphasis.
- Use short paragraphs for explanations.
- Do not include any text outside your answer (no "Answer:" label).

Context:
{context}

Question:
{question}
"""
rephrase_prompt = PromptTemplate(template=rephrase_template, input_variables=["context", "question"])

# --- SECTION HEADER CHUNKING (ROBUST) ---
def assign_section_headers(documents):
    section_pattern = re.compile(r"^\s*(Topic \d+:\s+[A-Za-z\s]+|\d+\.\s+[A-Za-z\s]+)", re.IGNORECASE)
    current_section = "LECTURE HEADER"
    for i, doc in enumerate(documents):
        lines = [l.strip() for l in doc.page_content.split('\n') if l.strip()]
        for line in lines:
            if section_pattern.match(line):
                current_section = line.strip()
                break
        doc.metadata['section'] = current_section
        logging.info(f"Doc {i}: Assigned section '{current_section}' to chunk from {doc.metadata.get('source_file', 'unknown')}")
    return documents

def preprocess_documents(documents):
    section_pattern = re.compile(r"^\s*(Topic \d+:\s+[A-Za-z\s]+|\d+\.\s+[A-Za-z\s]+)", re.IGNORECASE)
    for doc in documents:
        content = doc.page_content
        lines = content.split('\n')
        new_content = []
        current_section = None
        for line in lines:
            if section_pattern.match(line.strip()):
                current_section = line.strip()
                new_content.append(f"[SECTION: {current_section}]\n{line}")
            else:
                if current_section:
                    new_content.append(f"[SECTION: {current_section}]\n{line}")
                else:
                    new_content.append(line)
        doc.page_content = '\n'.join(new_content)
        logging.info(f"Preprocessed doc from {doc.metadata.get('source_file', 'unknown')}, Content: {doc.page_content[:200]}")
    return documents

def load_pdfs(directory_path):
    all_documents = []
    pdf_files = [
        f for f in os.listdir(directory_path)
        if f.lower().endswith(".pdf") and "topic" in f.lower() and "course detail" not in f.lower()
    ]
    logging.info(f"Found lecture note PDF files: {pdf_files}")
    for filename in pdf_files:
        pdf_path = os.path.join(directory_path, filename)
        loader = PyPDFium2Loader(pdf_path)
        documents = loader.load()
        for doc in documents:
            doc.metadata["source_file"] = filename
            doc.page_content = f"[Source: {filename}] " + doc.page_content
            all_documents.append(doc)
    logging.info(f"Loaded {len(all_documents)} page-level documents from {len(pdf_files)} PDFs")
    return all_documents

all_documents = load_pdfs(PDF_DIRECTORY)
all_documents = preprocess_documents(all_documents)
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=800, chunk_overlap=200)
split_docs = text_splitter.split_documents(all_documents)
split_docs = assign_section_headers(split_docs)
split_docs = filter_complex_metadata(split_docs)

# Debug all chunks for headers and flexibility
for doc in split_docs:
    logging.info(f"Chunk: {doc.metadata}, Content: {doc.page_content[:200]}")
    if "flexibility" in doc.page_content.lower():
        logging.info(f"Flexibility chunk: {doc.metadata}, Content: {doc.page_content[:200]}")

# --- VECTOR STORE & HYBRID RETRIEVER ---
vectordb = Chroma.from_documents(split_docs, embedding=embeddings, persist_directory=PERSIST_DIRECTORY)
vector_retriever = vectordb.as_retriever(search_kwargs={"k": TOP_K})
bm25_retriever = BM25Retriever.from_documents(split_docs)
bm25_retriever.k = TOP_K
ensemble_retriever = EnsembleRetriever(retrievers=[vector_retriever, bm25_retriever], weights=[0.5, 0.5])
logging.info("Hybrid retriever initialized with balanced weights")

# --- RERANKING (CASE-INSENSITIVE) ---
def rerank(query, candidate_chunks, top_n=3, query_type="conceptual"):
    query = query.lower()
    query_emb = sbert_model.encode(query, convert_to_tensor=True)
    chunk_embs = sbert_model.encode([chunk.lower() for chunk in candidate_chunks], convert_to_tensor=True)
    scores = util.cos_sim(query_emb, chunk_embs)[0].cpu().numpy()
    ranked = sorted(zip(candidate_chunks, scores), key=lambda x: -x[1])
    logging.info(f"Reranking scores: {[(c[:50], float(s)) for c, s in ranked]}")
    threshold = 0.05  # Lowered for debugging
    return [c for c, s in ranked[:top_n] if s >= threshold], [float(s) for c, s in ranked[:top_n]]

# --- QUERY CLASSIFICATION ---
def classify_query(query):
    # Core HCI-related keywords from lecture notes
    hci_keywords = [
        "hci", "human-computer interaction", "design principle", "design principles",
        "learnability", "flexibility", "robustness", "simplicity", "predictability",
        "familiarity", "generalizability", "cultural factors", "adaptive interface",
        "personalized interface", "psychology in design", "augmented reality"
    ]
    # Metadata-related keywords
    metadata_keywords = ["course code", "title", "password", "syllabus"]
    
    query_lower = query.lower()
    
    # Check for metadata queries
    if any(kw in query_lower for kw in metadata_keywords):
        return "metadata"
    # Check for HCI-related queries
    elif any(kw in query_lower for kw in hci_keywords):
        return "hci-related"
    # Default to non-HCI
    else:
        return "non-hci"

# --- SECTION AGGREGATION (HEADER-PRIORITIZED) ---
def aggregate_section_context(docs, all_docs, query, top_k=5):
    """
    Aggregate context from retrieved documents, prioritizing chunks with query keywords.
    """
    query_keywords = [kw for kw in query.lower().split() if kw in hci_keywords]
    relevant_chunks = []
    
    # Prioritize docs containing query keywords
    for doc in docs:
        doc_content = doc.page_content.lower()
        if any(kw in doc_content for kw in query_keywords):
            relevant_chunks.append(doc.page_content)
    
    # Add other relevant chunks if needed
    for doc in docs:
        if doc.page_content not in relevant_chunks and len(relevant_chunks) < top_k:
            relevant_chunks.append(doc.page_content)
    
    # Combine chunks into context
    context = "\n".join(relevant_chunks[:top_k])
    logging.info(f"Aggregated {len(relevant_chunks)} chunks for query: {query}, top section: {context[:100]}")
    return context

# Global HCI keywords
hci_keywords = [
    "hci", "human-computer interaction", "design principle", "design principles",
    "learnability", "flexibility", "robustness", "simplicity", "predictability",
    "familiarity", "generalizability", "cultural factors", "adaptive interface",
    "adaptive interfaces", "personalized interface", "personalized interfaces",
    "psychology in design", "augmented reality", "hick's law", "miller's law",
    "jakob's law", "computer revolution", "cognitive load", "chunking",
    "fitts' law", "mental models", "personalized usability", "adaptability"
]

# --- MAIN CHAT ENDPOINT ---
@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """
    Handle chat requests, classify queries, and respond based on type.
    """
    # Get JSON data from request
    data = request.get_json(silent=True)
    if not data or not isinstance(data.get('message'), str) or not data['message'].strip():
        return jsonify({'response': 'Please send a valid question!', 'retrieved_text': '', 'context': ''}), 400

    user_message = data['message'].strip()
    start_time = time.time()
    logging.info(f"Processing query: {user_message}")

    try:
        query_type = classify_query(user_message)
        logging.info(f"Query classified as: {query_type}")

        # Handle metadata queries
        if query_type == "metadata":
            bot_answer = (
                "This chatbot answers HCI topic questions based on lecture notes. "
                "Please check the course syllabus for details like course code, title, or password."
            )
            logging.info(f"Metadata query rejected in {time.time() - start_time:.2f} seconds: {bot_answer[:100]}")
            return jsonify({'response': bot_answer, 'retrieved_text': '', 'context': '', 'max_score': 0.0})

        # Handle HCI-related queries
        elif query_type == "hci-related":
            # Retrieve documents using hybrid retriever
            retrieved_docs = ensemble_retriever.invoke(user_message.lower())[:TOP_K*2]
            logging.info(f"Hybrid retrieved {len(retrieved_docs)} docs: {[d.metadata for d in retrieved_docs]}")
            
            # Case: No relevant documents found
            if not retrieved_docs:
                bot_answer = "No relevant information found in the lecture notes. Please try another HCI-related question."
                logging.info(f"No docs retrieved in {time.time() - start_time:.2f} seconds")
                return jsonify({'response': bot_answer, 'retrieved_text': '', 'context': '', 'max_score': 0.0})

            # Aggregate context from retrieved documents
            context = aggregate_section_context(retrieved_docs, split_docs, user_message, top_k=5)
            candidate_chunks = [context]
            # Rerank context
            top_chunks, top_scores = rerank(user_message, candidate_chunks, top_n=1, query_type=query_type)
            max_score = top_scores[0] if top_scores else 0.0

            # Case: Low relevance score
            if max_score < 0.15:  # Lowered threshold for better recall
                bot_answer = "No relevant information found in the lecture notes. Please try another HCI-related question."
                logging.info(f"Low rerank score ({max_score:.2f}). No relevant context.")
                return jsonify({'response': bot_answer, 'retrieved_text': '', 'context': '', 'max_score': max_score})

            # Check if context contains relevant keywords
            context_lower = context.lower()
            query_keywords = [kw for kw in user_message.lower().split() if kw in hci_keywords]
            if not query_keywords or not any(kw in context_lower for kw in query_keywords):
                bot_answer = "No relevant information found in the lecture notes. Please try another HCI-related question."
                logging.info(f"No relevant keywords in context for query: {user_message}")
                return jsonify({'response': bot_answer, 'retrieved_text': '', 'context': '', 'max_score': max_score})

            # Case: Relevant context found, paraphrase using Gemini
            prompt = rephrase_prompt.format(context=context, question=user_message)
            bot_answer = local_llm(prompt)
            logging.info(f"Response prepared in {time.time() - start_time:.2f} seconds: {bot_answer[:100]}")
            return jsonify({
                'response': bot_answer.replace('\n', '').strip(),
                'retrieved_text': context.replace('\n', '').strip(),
                'context': context.replace('\n', '').strip(),
                'max_score': max_score,
                'rerank_scores': top_scores
            })

        # Handle non-HCI queries
        else:
            # Use Gemini to answer freely without lecture notes
            non_hci_prompt = f"""
            You are Niko, a friendly AI assistant for the HANU HCI course. Answer the following question clearly, concisely, and in Markdown format:
            - Start with a one-sentence summary.
            - Use bullet points for key points if applicable.
            - Do not use information from HCI lecture notes.

            Question: {user_message}
            """
            bot_answer = local_llm(non_hci_prompt)
            logging.info(f"Non-HCI response prepared in {time.time() - start_time:.2f} seconds: {bot_answer[:100]}")
            return jsonify({
                'response': bot_answer.replace('\n', '').strip(),
                'retrieved_text': '',
                'context': '',
                'max_score': 0.0,
                'rerank_scores': []
            })

    except Exception as e:
        logging.error(f"Request error: {e}")
        return jsonify({'response': 'Internal error.', 'retrieved_text': '', 'context': ''}), 500
    
if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)