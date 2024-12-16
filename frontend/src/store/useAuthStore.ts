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

export let socket: WebSocket | null = null;

interface userState {
    authUser: IUser | null;
    isSigningUp: boolean;
    isLogginIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: IUser[]

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

    enterChatRoom: (otherUserId: string) => void;

    fetchOnlineUsers: () => void;

    disconnectSocket: () => void;
}

export const useAuthStore = create<userState>((set, get) => ({ // this is set function to change state of the function
    // these are state variables
    authUser: null,
    isSigningUp: false,
    isLogginIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],


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
            // Create FormData to send the image
            // const formData = new FormData();
            // formData.append('profilePic', data.profilePic);

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
        
        // Disconnect existing socket if any
        get().disconnectSocket();

        if (!authUser) return;

        // Create new WebSocket connection
        socket = new WebSocket(`ws://localhost:3000/ws`);

        socket.onopen = () => {
            console.log("WebSocket connection established");
            toast.success("Connected to chat server");

            // Fetch initial online users
            get().fetchOnlineUsers();
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                // Handle different message types
                if (message.content && message.user) {
                    // Chat message
                    useChatStore.getState().addMessage(message);
                    toast.success(`New message from ${message.user.username}`);
                } else if (message.type === 'ONLINE_USERS') {
                    // Update online users
                    set({ onlineUsers: message.data.onlineUsers });
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast.error("Chat connection error");
        };

        socket.onclose = (event) => {
            console.log("WebSocket connection closed", event);
            
            // Attempt to reconnect if not intentionally closed
            if (event.code !== 1000 && authUser) {
                toast.error("Chat connection lost. Reconnecting...");
                setTimeout(() => get().connectSocket(), 3000);
            }

            // Clear online users when disconnected
            set({ onlineUsers: [] });
        };
    },

    // Fetch online users from the server
    fetchOnlineUsers: async () => {
        try {
            const res = await axiosInstance.get("/onlineUsers");
            set({ onlineUsers: res.data.onlineUsers });
        } catch (error: any) {
            console.error("Error fetching online users:", error);
            toast.error("Failed to fetch online users");
        }
    },

    disconnectSocket: () => {
        if (socket) {
            socket.close(1000, "User disconnected");
            socket = null;
        }
    },

    // Method to enter a chat room
    enterChatRoom: (otherUserId: string) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            toast.error("Chat connection not established");
            return;
        }

        const payload = {
            type: MessageTypes.ENTER_ROOM,
            data: { otherUserId }
        };

        socket.send(JSON.stringify(payload));
    },

}))