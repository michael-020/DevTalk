import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { Settings } from "./pages/Settings"
import { Navbar } from "./components/Navbar"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Profile } from "./pages/Profile"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore"

function App() {

  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()
  const {theme} = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if(isCheckingAuth && !authUser){
    return  (
      <div className="h-screen flex justify-center items-center">
        <Loader className="size-10 animate-spin" />
      </div>
        
    )
  } 
 
  return (
    <div data-theme={theme}>
      <Navbar />

        <Routes>
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" /> } />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" /> } />
          <Route path="/" element={ authUser ? <Home /> : <Navigate to="/login" />} />
          <Route path="/settings" element={ <Settings /> } />
          <Route path="/profile" element={ authUser ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
    

      <Toaster />
    </div>  
  )
}

export default App
