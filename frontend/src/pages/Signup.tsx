import { FormEvent, useState } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { Eye, EyeOff, Loader2, Lock, MessageSquare, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthImagePattern } from "../components/AuthImagePattern"
import toast from "react-hot-toast"

const signup = () => {
    const [showPassword, setShowPassword] = useState(false) 
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const navigate = useNavigate()
     
    const {signup, isSigningUp} = useAuthStore()

    const validateForm = () => {
        if (!formData.username.trim()) return toast.error("Full name is required");
       
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

        return true;
    }
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        const success = validateForm() 

        if(success === true)
                signup(formData)
    }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
       {/* left side */}
       <div className="flex flex-col p-6 sm:p-12 justify-center items-center">    
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 group">
                    <div
                        className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                    group-hover:bg-primary/20 transition-colors"
                    >
                        <MessageSquare className="size-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                    <p className="text-base-content/60">Get started with your free account</p>
                    </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Username</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="size-5 text-base-content/40" />
                        </div>
                        <input
                        type="text"
                        className={`input input-bordered w-full pl-10`}
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    </div>

                    <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Password</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="size-5 text-base-content/40" />
                        </div>
                        <input
                        type={showPassword ? "text" : "password"}
                        className={`input input-bordered w-full pl-10`}
                        placeholder="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? (
                            <EyeOff className="size-5 text-base-content/40" />
                        ) : (
                            <Eye className="size-5 text-base-content/40" />
                        )}
                        </button>
                    </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                    {isSigningUp ? (
                        <>
                        <Loader2 className="size-5 animate-spin" />
                        Loading...
                        </>
                    ) : (
                        "Create Account"
                    )}
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-base-content/60">
                        <span>  Already have an account ? </span> <span onClick={() => navigate("/login")} className="link link-primary">Login</span>
                    </p>
                </div>
            </div>
       </div>

       {/* right side */}
       <div>
         <AuthImagePattern
            title="Join our community" 
            subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
         />
       </div>
    </div>
  )
}

export default signup
