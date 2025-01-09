import axios from "axios";
import { BACKEND_URL } from "../config";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE == "development" ? `${BACKEND_URL}` : "/api/v1", 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json', 
    }
})