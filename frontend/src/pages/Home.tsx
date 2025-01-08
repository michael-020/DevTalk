
import ChatContainer from "../components/ChatContainer"
import { useChatStore } from "../store/chatStore/useChatStore"
import NoChatSelected from "../components/NoChatSelected"
import Sidebar  from "../components/Sidebar"
import { motion } from "framer-motion" 

const routeVariants = {
  initial: {
      y: 0.9,
      opacity: 0,
  },
  final: {
      y: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        ease: "easeInOut"
      }
  },
  exit: {
    scale:0.9,
    opacity:0
  }
}


const Home = () => {
  const { selectedUser } = useChatStore()

  return (
    <motion.div className="h-screen bg-base-200 -mt-1"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="flex items-center justify-center pt-24 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Home
