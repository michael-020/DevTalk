import { IUser } from "../chatStore/useChatStore";

export type authState = {
    authUser: IUser | null;
    isSigningUp: boolean;
    isLogginIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: WebSocket | null;
}

export type authAction = {
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