import { Tooltip,Button, Popconfirm, notification,Modal } from "antd";
import {TwitchOutlined,DeleteOutlined,MenuUnfoldOutlined,PlusCircleOutlined} from "@ant-design/icons"
import { Link ,Navigate, useNavigate, useParams} from "react-router-dom";
import { reduceString } from "../../helpers/String.helpers";
import { createChat, getAllMessage,delMessage } from "../../utils/api";
import { useState } from "react";

function Sibar(props) {
    const navigate = useNavigate()
    
    const {menuToggle,handleSetMenuToggle,message,handleSetMessage} = props
    const {id} = useParams()
    const handleAdd = async()=>{
        const newMess = await createChat()
        
        const mess = [...message,newMess.data]
        handleSetMessage(mess)
        navigate(`/api/chat/${newMess.data._id}`)
        
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
    setIsModalOpen(true);
    };
    const handleOk =async (idChat) => {
        const rs = await delMessage(idChat);
        if(rs){
            const newMess = await getAllMessage()
            handleSetMessage(newMess)
            setIsModalOpen(false);
            navigate("/api/chat/info")
        }
        

    };
    const handleCancel = () => {
    setIsModalOpen(false);
    };
    const handleDelete = async(idChat)=>{
        if(id == idChat){
            showModal()
            
        }
        else{
            const rs = await delMessage(idChat);
            if(rs){
                notification.success({
                    message:"Xóa đoạn chat thành công",
                    description:"Success"
                })
            }
            const newMess = await getAllMessage()
            handleSetMessage(newMess)
            
        }
    }
  
   
    return (
        <>
            {menuToggle &&(
                <div className="bg-primaryBg-sibar w-[280px] h-screen font-light text-primaryText-default  text-xl">
                <div className="mt-1">
                    <div className="flex px-3 py-1 items-center mb-2 justify-between">
                        <div>
                            <Tooltip title="Đóng sidebar">
                                <Button onClick={()=>{handleSetMenuToggle()}} size="large"   type="text" icon={<MenuUnfoldOutlined style={{ fontSize: '22px' }}  />} />
                            </Tooltip>
                    
                        </div>
                        <div >
                            <Tooltip title="Thêm đoạn chat">
                                <Button size="large" onClick={()=>{handleAdd()}}   type="text" icon={<PlusCircleOutlined style={{ fontSize: '22px' }} />} />
                            </Tooltip>
                        
                        </div>

                        
                    </div>
                    <Link to={`/api/chat/info`} className="hover:bg-primaryBg-hover m-1 rounded-lg pl-5 pr-5 m-1 py-1 flex mb-4 space-x-4 items-center w-[96.5%] ">
                        <TwitchOutlined  style={{ fontSize: '22px' }} />
                        <p>Nike Bot</p>
                    </Link>
                    <div className="px-3 mb-2 text-primaryText-second">
                        Gần đây
                    </div>
                  
                                 
                    <div className="flex flex-col h-[660px] overflow-x-hidden overflow-y-auto">
                        {message.map((chat)=>{
                            return(
                                <>
                                    <Modal title="Xóa đoạn chat?" okText="Xóa" cancelText="Hủy bỏ" okButtonProps={{danger:true}} open={isModalOpen} onOk={()=>{handleOk(chat._id)}} onCancel={handleCancel}>
            
                                        <p>Hành động này sẽ xóa {chat.chatUser.length>0?`${reduceString(chat.chatUser[0])}`:"New Chat"}</p>
                                    </Modal>
                                    
                                    <div key={chat._id} className={"hover:bg-primaryBg-hover m-1 rounded-lg pl-6 pr-1 py-2 flex justify-start text-base space-x-4 items-center " + (chat._id==id ?"bg-primaryBg-hover":"")}>
                                        <div >
                                            <Tooltip title="Xóa đoạn chat">
                                                <Popconfirm title="Bạn có chắc chắn muốn xóa"  onConfirm={()=>handleDelete(chat._id)}>
                                                        <Button type="text" icon={<DeleteOutlined  style={{ fontSize: '22px',color:"0D0D0D" }} />} />
                                                </Popconfirm>
                                            </Tooltip>
                                            {chat.chatUser.length>0? (
                                                <Link  to={`/api/chat/${chat._id}`}>
                                                    <span className="px-2">{reduceString(chat.chatUser[0])}</span>
                                                </Link>
                                                
                                                 
                                            ):(
                                                <Link className="" to={`/api/chat/${chat._id}`}>
                                                    <span className="px-2">New chat</span>
                                                </Link>
                                            )}
                                            
                                        </div>                               
                                    </div>
                                </>
                            )
                            
                        })}     
                        
                    </div>
                    
                    
                


                </div>


            </div>
            
            )}

        
            
        </>
     
    );
}

export default Sibar;