import { addMessage, createChat } from '../../utils/api';
import {useNavigate} from "react-router-dom";


function ChatBox(props) {
    const {message,mess,handleReLoadAll,id,handleSetMessage} = props
    const navigate = useNavigate()
    const handleClick =async ()=>{
        if(id){
            const chatText = await addMessage(id,mess)
            
            handleReLoadAll();
            
        }
        else{
            const newMess = await createChat() 
            const chatText = await addMessage(newMess.data._id,mess)
            const messArray = [...message,newMess.data]
            handleSetMessage(messArray)
            navigate(`/api/chat/${newMess.data._id}`)
            
        }
    }
    
    
   
    return (
        <>
            <div onClick={handleClick} className="cursor-pointer w-[200px] rounded-lg border-red-400 flex  justify-center h-[100px] bg-primaryBg-sibar">
                <p className="px-2 py-2 text-primaryText-second">{mess}</p>
            </div>
        </>
     
    );
}

export default ChatBox;