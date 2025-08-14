import { Outlet } from "react-router-dom";
import Sibar from "../Sibar";
import { useEffect, useState } from "react";
import { getAllMessage } from "../../utils/api";


 function  LayoutDefault() {
    const [menuToggle,setMenuToggle] = useState(true)
    const handleSetMenuToggle = ()=>{
        setMenuToggle(!menuToggle);
    }
    const [message,setMessage] = useState([]);
    const handleSetMessage = (mess)=>{
        setMessage(mess)
    }
   
    useEffect(()=>{
        const fetchApi = async()=>{
            const rs = await getAllMessage();
            setMessage(rs)
        }
        fetchApi()
    },[])
    
    const dataOutlet = {
        menuToggle:menuToggle,
        handleSetMenuToggle:handleSetMenuToggle,
        message:message,
        handleSetMessage:handleSetMessage,
       
    }
    

    
//    console.log(data);

    return (
        <>
            <div className="bg-primaryBg-default h-screen text-primaryText-text  flex">
                <Sibar handleSetMessage={handleSetMessage} message={message} handleSetMenuToggle={handleSetMenuToggle} menuToggle={menuToggle}/>
                <Outlet context={dataOutlet}/>
            </div>
            
        
        </>
     
    );
}

export default LayoutDefault;