function User(props) {
    const {data} = props
    return (
        <>
            
                <div className="w-full px-2 py-2 flex  flex-col items-end">
                    <div className="rounded-lg bg-primaryBg-hover px-2 py-2 text-lg">{data}</div>
                </div>
          
        
        </>
     
    );
}

export default User;