
export function Login(){

    return <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="w-60 p-6 flex flex-col gap-4 items-center border rounded-lg shadow-lg bg-white">
            <h2 className="text-purple-300">Login</h2>
            <input type="text" placeholder="username" className="p-2 border placeholder-purple-300 rounded-lg"/>
            <input type="text" placeholder="password" className="p-2 border placeholder-purple-300 rounded-lg" />
            <button className="border w-full p-2 bg-purple-300 rounded-lg" >Submit</button>
        </div>
    </div>
}