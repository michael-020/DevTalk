import { useState } from "react";
import { ChatComp } from "../components/ChatComp";
import { UserCard } from "../components/UserCard";

export function Home(){
    const [usernames, setUsernames] = useState([])

    return <div>
        <div className="flex justify-between w-[60rem] mx-auto mt-24 h-[30rem]">
            <div className="w-[18rem]  border-4 border-sky-500 flex flex-col items-center p-2">
                <UserCard username={"mic"} />
            </div>
            <div className="w-[42rem] border-4 border-red-200 relative">
                <ChatComp />
            </div>
        </div>
       
    </div>
}