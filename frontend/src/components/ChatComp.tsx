import { Meessages } from "./Messages";
import { RecievedMessages } from "./RecievedMessages";


export function ChatComp(){

    return <div className=" h-full">
        <div className="grid grid-cols-2 px-12 overflow-y-scroll h-[26rem] ">
            <div className="col-span-2 justify-self-start">
                <RecievedMessages content="hello" />
                <RecievedMessages content="hello" />
                <RecievedMessages content="hello" />
                <RecievedMessages content="hello" />
            </div>
            <div className="col-span-2 justify-self-end">
                <Meessages content="hi" />
                <Meessages content="hi" />

                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
                <Meessages content="hi" />
            </div>
        </div>
       
        <form
            onSubmit={(e) => {
                e.preventDefault(); // Prevent default form refresh behavior
                console.log("Message sent!"); // Replace with your send message logic
            }}
            className="absolute bottom-3 left-3 w-[95%] flex items-center bg-white shadow-md rounded-lg p-2"
        >
            <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 border-none outline-none text-sm"
                name="message"
                required
            />
            <button
                type="submit"
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                aria-label="Send"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                    />
                </svg>
            </button>
        </form>
    </div>
}