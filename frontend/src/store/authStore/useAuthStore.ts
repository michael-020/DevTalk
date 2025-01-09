import { create } from "zustand";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useChatStore } from "../chatStore/useChatStore";
import { authAction, authState } from "./types";

export enum MessageTypes {
    ENTER_ROOM = 'ENTER_ROOM',
    CHAT = 'CHAT',
    LEAVE = 'LEAVE'
}

const BASE_URL = import.meta.env.MODE === "development" ? "ws://localhost:3000" : "/";

export const useAuthStore = create<authState & authAction>((set, get) => ({ // this is set function to change state of the function
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
            // await new Promise(r => setTimeout(r, 2000))
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
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
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
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
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
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    },

    updateProfile: async (data: { profilePic: string}) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/users/updateProfile", { profilePic: data.profilePic });

            set({ authUser: res.data });

            toast.success("Profile updated successfully");
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
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