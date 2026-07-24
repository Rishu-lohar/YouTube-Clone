import axios from "axios"

const axiosInstance = axios.create({

    baseURL:process.env.BACKEND_URL,
    headers:{
        "Content-Type":"application/josn"
    }
})

export default axiosInstance;