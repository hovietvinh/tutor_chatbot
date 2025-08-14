import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ChatDetail from "../pages/ChatDetail";




const Routes= createBrowserRouter([
    {
        path:"/",
        element: <App/>,
        children:[
            {
                index:true,
                element: <Navigate to={"/api/chat/info"}/>
            },
            {
                path:"/api/chat/info",
                element: <ChatDetail/>
            },
            {
                path:"/api/chat/:id",
                element: <ChatDetail/>
            }
        ]
    },
    
])



export default Routes
