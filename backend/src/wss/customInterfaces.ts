import mongoose from "mongoose";
import { WebSocket } from "ws";

export enum MessageTypes {
    ENTER_ROOM = "ENTER_ROOM",
    CHAT = "CHAT",
    LEAVE = "LEAVE"
}

export interface MessagePayload {
    type: MessageTypes;
    data: {
        content?: string,
        otherUserId?: string,
        chatRoomId?: string
    }
}

export interface chat {
    chatRoom: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface FormattedMessage {
    content: string;
    user: {
        userId: string,
        username: string
    };
    createdAt: Date;
}

export interface chatRoom {
    participants: mongoose.Types.ObjectId[];
    messages: mongoose.Types.ObjectId[];
}

export interface WebSocketUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    chatRoomId?: string;
}

export interface ExtendedWebSocket extends WebSocket {
    user?: WebSocketUser;
}