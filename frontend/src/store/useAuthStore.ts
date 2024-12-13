import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface userState {
    authUser: any;
    isSigningUp: boolean;
    isLogginIn: boolean;
    isUpdatingProfile: boolean;
     
    isCheckingAuth: boolean;

    checkAuth: () => void;

    signup: (data : {
        username: string;
        password: string;
    }) => void;

    login: (data : {
        username: string;
        password: string;
    }) => void;
}

export const useAuthStore = create<userState>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLogginIn: false,
    isUpdatingProfile: false,
     
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/check")
            set({authUser: res.data})
        } catch (error) {
            console.error("Error in check auth")
            set({authUser: null})
        }
        finally {
            set({isCheckingAuth: false})
        }
    },

    signup: async (data: {username: string, password: string}) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/signup", data)
            set({authUser: res.data})
            toast.success("Account created Successfully")
        } catch (error) {
             toast.error((error as AxiosError).message)
        } finally {
            set({isSigningUp: false})
        }
    },

    login: async (data: {username: string, password: string}) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/signin", data)
            set({authUser: res.data})
            toast.success("Logged in Successfully")
        } catch (error) {
             toast.error((error as AxiosError).message)
        } finally {
            set({isSigningUp: false})
        }
    }
}))