import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import axios from "axios";

export function Login(){
    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate();

    async function handleLogin(){
        const response = await axios.post(`${BACKEND_URL}/signin`, {
            username: usernameRef.current?.value,
            password: passwordRef.current?.value
        })

        const authorization = response.data.token

        localStorage.setItem("authorization", authorization);

        navigate("/home")
    }

    return <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="w-60 p-6 flex flex-col gap-4 items-center border rounded-lg shadow-lg bg-white">
            <h2 className="text-purple-300">Login</h2>
            <input ref={usernameRef} type="text" placeholder="username" className="p-2 border placeholder-purple-300 rounded-lg"/>
            <input ref={passwordRef} type="text" placeholder="password" className="p-2 border placeholder-purple-300 rounded-lg" />
            <button className="border w-full p-2 bg-purple-300 rounded-lg" onClick={handleLogin}>Submit</button>
        </div>
    </div>
}