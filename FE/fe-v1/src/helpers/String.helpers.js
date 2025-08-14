export const reduceString = (string)=>{
    if(string.length<=18) return string;
    else{
        return `${string.substring(0,13)}....`
    }
}