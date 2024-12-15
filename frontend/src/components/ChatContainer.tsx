import { useEffect, useRef } from "react"
import { useChatStore } from "../store/useChatStore"
import MessageInput from "./MessageInput"
import { useAuthStore } from "../store/useAuthStore"
import ChatHeader from "./ChatHeader"


const ChatContainer = () => {
  const {messages, getMessages, isMessagesLoading, selectedUser} = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id)
  }, [getMessages, selectedUser._id])

  if(isMessagesLoading){
    return <div>
      Loading....
    </div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
    <ChatHeader />

    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages && messages.map((message) => (
        <div
          key={message._id}
          className={`chat ${message.sender === authUser?._id ? "chat-end" : "chat-start"}`}
          ref={messageEndRef}
        >
          <div className=" chat-image avatar">
            <div className="size-10 rounded-full border">
              <img
                src={
                  message.sender === authUser?._id
                    ? authUser?.profilePicture || "/avatar.png"
                    : selectedUser.profilePicture || "/avatar.png"
                }
                alt="profile pic"
              />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">
              {/* {formatMessageTime(message.createdAt)} */}
            </time>
          </div>
          <div className="chat-bubble flex flex-col">
            {message.image && (
              <img
                src={message.image}
                alt="Attachment"
                className="sm:max-w-[200px] rounded-md mb-2"
              />
            )}
            {message.content && <p>{message.content}</p>}
          </div>
        </div>
      ))}
    </div>

    <MessageInput />
  </div>
  )
}

export default ChatContainer
