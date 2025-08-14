import axios from "./axios"
const URL_API = "/api/chat"

export const createChat = (chatUser)=>{
    const data={
        chatUser:chatUser
    }
    return axios.post(`${URL_API}/create`,data)
}

export const getAllMessage= async()=>{
    const res = await axios.get(URL_API);
    return res.result;
}

export const getMessageById= async(id)=>{
    const res = await axios.get(`${URL_API}/${id}`);
    return res.result;
}

export const addMessage = async(id,chatUser)=>{
    const data={
        _id:id,
        chatUser:chatUser
    }
    const rs = await axios.post(`${URL_API}/update`,data);
    return rs;
}

export const delMessage = async(id)=>{
    
    const rs = await axios.patch(`${URL_API}/delete?id=${id}`)
    return rs;
}

