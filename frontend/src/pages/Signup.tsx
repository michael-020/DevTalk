import { useRef } from "react"
import { BACKEND_URL } from "../config"
import axios from "axios"
import { useNavigate } from "react-router-dom"


export function Signup(){

    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate();

    async function handleSignup(){
        const response = await axios.post(`${BACKEND_URL}/signup`, {
            username: usernameRef.current?.value,
            password: passwordRef.current?.value
        })
        console.log(response.data)
        navigate("/login")
    }


    return <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="w-60 p-6 flex flex-col gap-4 items-center border rounded-lg shadow-lg bg-white">
            <h2 className="text-purple-300">Sign-up</h2>
            <input ref={usernameRef} type="text" placeholder="username" className="p-2 border placeholder-purple-300 rounded-lg"/>
            <input ref={passwordRef} type="text" placeholder="password" className="p-2 border placeholder-purple-300 rounded-lg" />
            <button className="border w-full p-2 bg-purple-300 rounded-lg" onClick={handleSignup} >Submit</button>
        </div>
    </div>
}