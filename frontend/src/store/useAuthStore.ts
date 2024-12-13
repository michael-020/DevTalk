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

    logout: () => void;

    updateProfile: (data:{ profilePic: string }) => void;
}

export const useAuthStore = create<userState>((set) => ({ // this is set function to change state of the function
    // these are state variables
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
        } catch (error: any) {
             toast.error(error.response.data.message)
        } finally {
            set({isSigningUp: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
        } catch (error:any) {
            toast.error(error.response.data.messages)
            console.error("error while loggin out")
        }
    },

    updateProfile: async (data: { profilePic: string}) => {
        set({ isUpdatingProfile: true });
        try {
            // Create FormData to send the image
            // const formData = new FormData();
            // formData.append('profilePic', data.profilePic);

            const res = await axiosInstance.put("/updateProfile", { profilePic: data.profilePic });
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Error in update profile:", error);
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    }
}))