import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:5164/api"
});


export default api;