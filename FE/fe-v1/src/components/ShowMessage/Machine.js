import {TwitchOutlined} from "@ant-design/icons"
function Machine(props) {
    const {data} = props
    return (
        <>
            <div className="w-full px-2 py-2 flex ">
                <div className=" flex w-full flex-1 flex-col ">
                    <div className="flex gap-4 relative px-2 py-2 max-w-[70%] ">
                        <TwitchOutlined/>
                        <div className="text-lg">
                            <p dangerouslySetInnerHTML={{__html:data}} />
                        </div>
                    </div>
                </div>               



                {/* <div className="rounded-lg bg-primaryBg-hover px-2 py-2">{data}</div> */}
            </div>
          
              
           
        
        </>
     
    );
}

export default Machine;