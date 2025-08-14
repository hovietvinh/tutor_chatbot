import { Dropdown,Button,Tooltip } from 'antd';
import "./index.scss"
import MessageRemind from '../components/MessageRemind';
import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import {DownOutlined,MenuUnfoldOutlined,PlusCircleOutlined} from "@ant-design/icons"
import { addMessage, createChat, getMessageById } from '../utils/api';
import { useEffect,useState } from 'react';
import ShowMessage from '../components/ShowMessage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const items = [
    {
      label: <a href="https://www.antgroup.com">Đăng nhập</a>,
      key: '0',
    },
    {
      label: <a href="https://www.aliyun.com">Đăng ký</a>,
      key: '1',
    },
    
  ];
function ChatDetail() {
    const {id} = useParams();
    const navigate = useNavigate()
    
    const {menuToggle,handleSetMenuToggle,message,handleSetMessage} = useOutletContext();
    const [inputChat,setInputChat] = useState("")
    

    const handleAdd = async()=>{
        const newMess = await createChat() 
        const mess = [...message,newMess.data]
        handleSetMessage(mess)
        navigate(`/api/chat/${newMess.data._id}`)
    }

    const [dataDetail,setDataDetail] = useState({});
    const [arrayMessage,setArrayMessage] = useState([]);
    const [reLoadAll,setReLoadAll] = useState(true);
    const handleReLoadAll=()=>{
        setReLoadAll(!reLoadAll)
    }
    useEffect(()=>{
        const getDetail = async()=>{
            try{
                if(id){
                    const data = await getMessageById(id);
                    setDataDetail(data)
                }
                else setDataDetail({})
            }catch(e){
                console.log("error fe get data detail");
                setDataDetail({})
            }            
        } 
        getDetail()
        // array mess user and bot
        
    },[id,reLoadAll])

    useEffect(()=>{
        const getArrayMessage = ()=>{
          

            if("chatUser" in dataDetail){
               
                if(dataDetail.chatUser.length>0){
                    let rs = [];
                    for(let i=0;i<dataDetail.chatUser.length;i++){
                        rs.push({
                            text:dataDetail.chatUser[i],
                            isBot:false
                        }),
                        rs.push({
                            text:DOMPurify.sanitize( marked.parse( dataDetail.chatMachine[i])) ,
                            isBot:true
                        })
                    }
                     setArrayMessage(rs);
                }
                else  setArrayMessage([]);
            }
            else{
                setArrayMessage([]);
            }
        }
        getArrayMessage()
    },[dataDetail])
    

   
    
    
   const handleChatDetail = async()=>{
        if(inputChat){
            if(id){
                
                const chatText = await addMessage(id,inputChat)
                console.log(chatText);
                
                setArrayMessage((prevArrayMessage) => [
                    ...prevArrayMessage,
                    { text: inputChat, isBot: false },
                    { text: DOMPurify.sanitize(marked.parse(chatText.result)), isBot: true },
                ]);
                
                setInputChat("")
            }
            else{
                const newMess = await createChat() 
                const chatText = await addMessage(newMess.data._id,inputChat)
                const mess = [...message,newMess.data]
                handleSetMessage(mess)
                navigate(`/api/chat/${newMess.data._id}`)

            }
        }
        
   }
   
    return (
        <>
            <div className="text-primaryText-default mt-2 px-4 w-full">
                <div className='flex items-center justify-between'>
                   <div className='flex space-x-3'>
                        {!menuToggle && (
                            <div className="flex px-2 py-1  mb-2 justify-between">
                                <div>
                                    <Tooltip title="Đóng sidebar">
                                        <Button onClick={()=>{handleSetMenuToggle()}} size="large"   type="text" icon={<MenuUnfoldOutlined style={{ fontSize: '22px' }}  />} />
                                    </Tooltip>
                            
                                </div>
                                <div >
                                    <Tooltip title="Thêm đoạn chat">
                                        <Button size="large" onClick={()=>{handleAdd()}}  type="text" icon={<PlusCircleOutlined style={{ fontSize: '22px' }} />} />
                                    </Tooltip>
                                
                                </div>
        
                                
                            </div>
                        )}
                        <Dropdown
                                menu={{
                                    items,
                                }}
                                trigger={['click']}
                            >
                                
                                <Button className='text-xl pt-3 font-light ' size='large' type="text">
                            
                                        Niko Bot
                                        <DownOutlined />
                                </Button>
                        </Dropdown>
                   </div>
            
                    <div className="flex gap-3 pr-1 avatar">
                        NB
                    </div>
                </div>
                
                <div className='max-w-[80%] w-full mx-auto mt-10 space-y-10'>
                    {arrayMessage.length>0?(
                        <ShowMessage  arrayMessage={arrayMessage}/>
                    ):(
                        <MessageRemind message={message} handleSetMessage={handleSetMessage} handleReLoadAll={handleReLoadAll} id={id} />
                    )}
                    
                    <div className='flex items-center space-x-2 w-full'>
                        <input value={inputChat} onChange={(e)=>setInputChat(e.target.value)} className='focus:outline-none p-2 pl-3 rounded-2xl bg-primaryBg-sibar w-[96%] border-white' type="text" placeholder='nhập tin nhắn'/>
                        <button onClick={handleChatDetail} className='p-2 rounded-lg  bg-[#D7D7D7] text-[#F4F4F4]'>Gửi</button>
                    </div>

                </div>

                
                
            
            </div>
        </>
     
    );
}

export default ChatDetail;