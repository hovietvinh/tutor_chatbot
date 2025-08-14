import User from "./User";
import  Machine from "./Machine";
import { useEffect,useRef } from 'react';

function ShowMessage(props) {
    const myRef = useRef(null);
    const {arrayMessage} = props
    useEffect(() => {
        if (myRef.current) {
          myRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    },[arrayMessage]);
    
    return (
        <>
            <div className="flex scroll flex-col space-y-2 p-4 h-[600px] overflow-x-hidden overflow-y-auto ">
                {arrayMessage.map((data)=>{
                    if(!data.isBot){
                        // la nguoi
                        return(
                            <User data={data.text}/>
                        )
                    
                    }
                    else{
                        return(
                            <Machine data={data.text}/>
                        )
                    }
                })}

                <div ref={myRef}/>
                
            </div>
            
        
        </>
     
    );
}

export default ShowMessage;