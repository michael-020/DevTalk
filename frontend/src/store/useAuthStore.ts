import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IUser, useChatStore } from "./useChatStore";

export enum MessageTypes {
    ENTER_ROOM = 'ENTER_ROOM',
    CHAT = 'CHAT',
    LEAVE = 'LEAVE'
}

export let socket: WebSocket | null  = null;

interface userState {
    authUser: IUser | null;
    isSigningUp: boolean;
    isLogginIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: WebSocket | null;
    

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
    connectSocket: () => void;

    fetchOnlineUsers: () => void;
    disconnectSocket: () => void;
    getSocket: () => WebSocket | null; 
}

const BASE_URL = import.meta.env.MODE === "development" ? "ws://localhost:3000" : "/";

export const useAuthStore = create<userState>((set, get) => ({ // this is set function to change state of the function
    // these are state variables
    authUser: null,
    isSigningUp: false,
    isLogginIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

   

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/users/check")
            set({authUser: res.data})

            get().connectSocket()
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
            const res = await axiosInstance.post("/users/signup", data)
            set({authUser: res.data})
            toast.success("Account created Successfully")

            get().connectSocket()
        } catch (error) {
             toast.error((error as AxiosError).message)
        } finally {
            set({isSigningUp: false})
        }
    },

    login: async (data: {username: string, password: string}) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/users/signin", data)
            set({authUser: res.data})
            toast.success("Logged in Successfully")

            get().connectSocket()
        } catch (error: any) {
             toast.error(error.response.data.message)
        } finally {
            set({isSigningUp: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/users/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error:any) {
            toast.error(error.response.data.messages)
            console.error("error while loggin out")
        }
    },

    updateProfile: async (data: { profilePic: string}) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/users/updateProfile", { profilePic: data.profilePic });

            set({ authUser: res.data });

            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Error in update profile:", error);
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

   
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket) return;

        const socket = new WebSocket(`${BASE_URL}?userId=${authUser._id}`);

        socket.onopen = () => {
            console.log("WebSocket connection established");
            set({ socket });
        };

        socket.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
    
                switch(type) {
                    case "ONLINE_USERS":
                         // Update the online users in the state
                        set({ onlineUsers: payload });
                        break;
                    case "NEW_MESSAGE":
                        const chatStore = useChatStore.getState();
                        chatStore.addIncomingMessage({
                            _id: Date.now().toString(), // temporary ID
                            content: payload.content,
                            sender: payload.senderId, 
                            receiver: payload.recieverId,
                            roomId: payload.roomId,
                            createdAt: new Date()
                        });

                        break;
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            set({ socket: null });
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    },

    
    // Fetch online users from the server
    fetchOnlineUsers: async () => {
       
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
            set({ socket: null });
        }
    },

   
    getSocket: () => get().socket, 
}))