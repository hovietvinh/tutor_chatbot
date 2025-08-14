import ChatBox from "../ChatBox";


function MessageRemind(props) {
    const {id,handleReLoadAll,handleSetMessage,message}= props
    

    return (
        <>
           <div className='flex flex-col space-y-4 h-[600px]'>
                <div className='space-y-2 mt-20 text-[35px] mx-auto max-w-[65%] w-full'>
                    <h1 className='bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text font-bold'>Xin Chào</h1>
                    <p className='text-3xl text-primaryText-third'>Hôm nay tôi có thể giúp gì cho bạn</p>
                </div>

                <div className='flex items-center justify-around px-15'>
                    
                    <ChatBox message={message} handleSetMessage={handleSetMessage} handleReLoadAll={handleReLoadAll} id={id} mess="Cá mập đánh răng bằng gì"/>
                    <ChatBox message={message} handleSetMessage={handleSetMessage} handleReLoadAll={handleReLoadAll} id={id} mess="Những tính chất của môn HCI"/>
                    <ChatBox message={message} handleSetMessage={handleSetMessage} handleReLoadAll={handleReLoadAll} id={id} mess="Mật khẩu môn học là gì"/>
                    <ChatBox message={message} handleSetMessage={handleSetMessage} handleReLoadAll={handleReLoadAll} id={id} mess="Giới thiệu về Bot này"/>
                </div>
            </div>  
        
        </>
     
    );
}

export default MessageRemind;