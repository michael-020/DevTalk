import { Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore/useAuthStore"
import { LogOut, MessageSquare, Settings, User } from "lucide-react"
import { motion } from "framer-motion"

const hoverAnimation = {
  initial: {
    scale: 1,
  },
  whileHover: {
    scale: 1.05,    
  },
  whileTap: {
    scale: 1
  },
}

export const Navbar = () => {

  const { logout, authUser } = useAuthStore()

  return (
    <header
    className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80 "
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">DevTalk</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              variants={hoverAnimation}
              initial="initial"
              whileHover={"whileHover"}
              whileTap={"whileTap"}
            > 
              <Link
                to={"/settings"}
                className={`
                btn btn-sm btn-primary gap-2 transition-colors
                
                `}
                
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </motion.div>
            

            {authUser && (
              <>
                <motion.div
                  variants={hoverAnimation}
                  initial="initial"
                  whileHover={"whileHover"}
                  whileTap={"whileTap"}
                >
                  <Link to={"/profile"} className={`btn btn-sm  gap-2`}>
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </motion.div>
                

                <motion.button className="flex gap-2 items-center" onClick={logout}
                  variants={hoverAnimation}
                  initial="initial"
                  whileHover={"whileHover"}
                  whileTap={"whileTap"}
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}