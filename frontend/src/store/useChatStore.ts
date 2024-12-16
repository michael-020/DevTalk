import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import mongoose from "mongoose"

export interface IUser {
    _id:/* mongoose.Types.ObjectId | */string; 
    username: string;
    profilePicture: string;
    createdAt: Date
}

export interface IMessages {
    _id: string
    chatRoom: string; 
    sender: string; 
    receiver: string;
    content?: string; 
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageData {
    content: string,
    image?: string 
}

interface IChatStore {
    messages: IMessages[],
    users: IUser[],
    selectedUser: any,
    isUsersLoading: boolean,
    isMessagesLoading: boolean,

    getUsers: () => void,

    getMessages: (userId: string) => void;

    setSelectedUser: (selectedUser: IUser | "") => void;

    sendMessage: (messageData: IMessageData) => void;
}


export const useChatStore = create<IChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true})
        try {
            const res = await axiosInstance.get("/users/usernames")
            set({users: res.data.users})
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false})
        }
    },

    getMessages: async (userId: string) => {
        if (!userId) {
            toast.error("User ID is required to fetch messages");
            return;
        }
        set({isMessagesLoading: true})
        try {
            
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages: res.data.messages})
            
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false})
        }
    },
    
    setSelectedUser: (selectedUser: IUser | "") => set({selectedUser}),

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/messages/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data.message ]})
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    },
}))