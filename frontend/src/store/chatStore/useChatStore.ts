import { create } from "zustand";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../authStore/useAuthStore";
import { chatAction, chatState } from "./types";

export interface IUser {
    _id: string;
    username: string;
    profilePicture: string;
    createdAt: Date;
}

export interface IMessages {
    _id: string;
    roomId: string;
    sender: any;
    receiver?: string;
    content?: string;
    image?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IMessageData {
    content: string;
    image?: string;
}

interface IChatStore {
    messages: IMessages[];
    users: IUser[];
    selectedUser: IUser | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    setSelectedUser: (selectedUser: IUser | null) => void;
    sendMessage: (messageData: IMessageData) => Promise<void>;
    addIncomingMessage: (message: IMessages) => void;

    subscribeToMessages: () => void;

    unSubscribeFromMessages: () => void;
}

export const useChatStore = create<chatState & chatAction>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/users/usernames");
            set({ users: res.data.users });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error fetching users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        if (!userId) {
            // toast.error("User ID is required to fetch messages");
            return;
        }
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data.messages });
        } catch (error: any) {
            // toast.error(error.response?.data?.message || "Error fetching messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    setSelectedUser: (selectedUser: IUser | null) => set({ selectedUser }),

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            // toast.error("No user selected");
            return;
        }
        try {
            const res = await axiosInstance.post(`/messages/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data.message] });

            const socket = useAuthStore.getState().socket;
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: "SEND_MESSAGE",
                  payload: res.data,
                })
              );
            }
        } catch (error: any) {
            // toast.error(error.response?.data?.message || "Error sending message");
        }
    },

    addIncomingMessage: (message: IMessages) => {
        // set((state) => ({
        //     messages: [...state.messages, message],
        // }));
        const { selectedUser } = get();
        if (selectedUser && message.sender === selectedUser._id) {
            set((state) => ({
                messages: [...state.messages, message]
            }));
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === "NEW_MESSAGE" && payload.sender === selectedUser._id) {
                const isMessageSentFromSelectedUser = payload.sender === selectedUser._id;
                if (!isMessageSentFromSelectedUser) return;

                set({ messages: [...get().messages, payload] });
            }
        };
    },

    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.onmessage = null; // Clear WebSocket event handler
        }
    }
}));
