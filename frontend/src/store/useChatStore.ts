import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { MessageTypes, socket, useAuthStore } from "./useAuthStore";


export interface IUser {
    _id:/* mongoose.Types.ObjectId | */string; 
    username: string;
    profilePicture: string;
    createdAt: Date
}

export interface IMessages {
    _id: string
    chatRoom: string; 
    sender: any; 
    receiver: string;
    content?: string; 
    image?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IMessageData {
    content: string,
    image?: string 
}

interface IChatStore {
    messages: IMessages[],
    users: IUser[],
    selectedUser: IUser | null,
    isUsersLoading: boolean,
    isMessagesLoading: boolean,

    getUsers: () => void,

    getMessages: (userId: string) => void;

    setSelectedUser: (selectedUser: IUser | null) => void;

    sendMessage: (messageData: IMessageData) => void;

    addMessage: (message: IMessages) => void;

    subscribeToMessages: (otherUserId: string) => void;

    sendMessageWs: (messageData: IMessageData) => void;

    unsubscirbeFromMessages: () => void;
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
    
    setSelectedUser: (selectedUser: IUser | null) => set({selectedUser}),

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get()
        try {
            if(selectedUser){
                const res = await axiosInstance.post(`/messages/${selectedUser._id}`, messageData);
                set({messages: [...messages, res.data.message ]})
            }
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    },

    addMessage: (message) => {
        set(state => ({
            messages: [...state.messages, {
                _id: Date.now().toString(), // Temporary ID
                chatRoom: '', // You might want to populate this
                sender: message.sender.userId,
                receiver: '', // You might want to populate this
                content: message.content,
                createdAt: new Date(message.createdAt)
            }]
        }));
    },

    // Subscribe to messages for a specific user/room
    subscribeToMessages: (otherUserId: string) => {
        // Use the auth store's enterChatRoom method
        useAuthStore.getState().enterChatRoom(otherUserId);
    },

    // Send a message via WebSocket
    sendMessageWs: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get();
        
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            toast.error("Chat connection not established");
            return;
        }

        try {
            if (selectedUser) {
                const payload = {
                    type: MessageTypes.CHAT,
                    data: {
                        content: messageData.content,
                        chatRoomId: selectedUser._id // Assuming _id is the chatRoomId
                    }
                };

                socket.send(JSON.stringify(payload));

                // Optimistically add the message to the local state
                set({
                    messages: [...messages, {
                        _id: Date.now().toString(), // Temporary ID
                        chatRoom: selectedUser._id,
                        sender: useAuthStore.getState().authUser?._id || '',
                        receiver: selectedUser._id,
                        content: messageData.content,
                        createdAt: new Date()
                    }]
                });
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    },

    // Unsubscribe from messages (close the current room)
    unsubscirbeFromMessages: () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const payload = {
                type: MessageTypes.LEAVE,
                data: {}
            };

            socket.send(JSON.stringify(payload));
        }
    }

}))