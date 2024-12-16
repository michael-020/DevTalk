import mongoose from "mongoose";
import WebSocket, { WebSocketServer } from "ws";
import http from "http"
import jwt from "jsonwebtoken"
import { chatModel, chatRoomModel, userModel } from "../model/db";
import { JWT_PASS } from "../config";
import { authMiddlware } from "./wsMiddleware";
import { ExtendedWebSocket, FormattedMessage, MessagePayload, MessageTypes } from "./customInterfaces";
import express from "express"

const app = express()

export function setUpWebSocketServer(httpServer: http.Server, JWT_PASS: string){
    const wss = new WebSocketServer({noServer: true})

    authMiddlware(httpServer, wss, JWT_PASS)

    wss.on("connection", (socket: ExtendedWebSocket) => {
        if(!socket.user){
            socket.close(4001, "Unauthorized access")
            return
        }
        new ChatWebSocket(socket.user._id, socket)
    })

    return wss;
   
}

export const wss = http.createServer(app);

// setUpWebSocketServer(wss, JWT_PASS)

// wss.listen(8080, () => {
//     console.log("wss listening on port 8080")
// });

class ChatWebSocket{
    private userId: mongoose.Types.ObjectId;
    private socket: ExtendedWebSocket;
    private static clients: Map<string, Set<ExtendedWebSocket>> = new Map();

    constructor(userId: mongoose.Types.ObjectId, socket: WebSocket){
        this.userId = userId;
        this.socket = socket;
        this.initializeSocketHandlers()
    }

    private initializeSocketHandlers(){
        this.socket.on("message", this.handleIncommingMessage.bind(this))
        this.socket.on("error", (e)=>{
            console.error("Websocket error: ", e)
        })
        this.socket.on("close", () => {
            console.log("Websocket connection closed")

            if(this.socket.user?.chatRoomId){
                const roomClients = ChatWebSocket.clients.get(this.socket.user.chatRoomId)
                if(roomClients){
                    roomClients.delete(this.socket)
                }
            }
        })
    }

    private async handleIncommingMessage(rawMessage: WebSocket.Data){
        try{
            const message: MessagePayload = JSON.parse(rawMessage.toString());

            switch (message.type) {
                case MessageTypes.ENTER_ROOM:
                    if (message.data?.otherUserId) {
                        await this.enterChatRoom(new mongoose.Types.ObjectId(message.data.otherUserId));
                    } else {
                        this.sendErrorMessage('Invalid payload for entering room');
                    }
                    break;

                case MessageTypes.CHAT:
                    if (message.data?.content && message.data?.chatRoomId) {
                        await this.sendMessage(
                            message.data.content,
                            new mongoose.Types.ObjectId(message.data.chatRoomId)
                        );
                    } else {
                        this.sendErrorMessage('Invalid payload for sending message');
                    }
                    break;

                case MessageTypes.LEAVE:
                    console.log('Leaving room not implemented yet');
                    break;

                default:
                    this.sendErrorMessage('Unknown message type');
            }
        }
        catch(e) {
            console.error("Error while handling incoming message:", {
                rawMessage,
                error: e,
            });
        }
    }

    private async enterChatRoom(otherUserId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null>{
        try{
            const otherUser = await userModel.findById(otherUserId)
            if(!otherUser){
                console.error("user not found")
                return null
            }

            let chatRoom = await chatRoomModel.findOne({
                participants: { $all: [this.userId, otherUserId] },
            }).populate("messages");

            if (!chatRoom) {
                chatRoom = await chatRoomModel.create({
                    participants: [this.userId, otherUserId],
                    messages: [],
                });
            }

            const populatedMessages = await chatModel.find({ chatRoomId: chatRoom._id })
            .populate("sender", "username")
            .sort({ created: 1 });

            this.socket.send(JSON.stringify({
                chatRoom,
                messages: populatedMessages,
            }));
            
            if (!this.socket.user) {
                this.socket.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "default",
                    chatRoomId: "",
                };
            }
            this.socket.user.chatRoomId = chatRoom._id.toString();
    
            if (!ChatWebSocket.clients.has(chatRoom._id.toString())) {
                ChatWebSocket.clients.set(chatRoom._id.toString(), new Set());
            }
            ChatWebSocket.clients.get(chatRoom._id.toString())?.add(this.socket);
    
            return chatRoom._id;
        }
        catch(e){
            console.error("")
            return null
        }
    } 

    private async sendMessage(content: string, chatRoomId: mongoose.Types.ObjectId){
        try{

            const chatMessage = await chatModel.create({
                chatRoom: chatRoomId,
                content,
                sender: this.userId,
                createdAt: new Date()
            })

            await chatMessage.populate("sender", "username")

            await chatRoomModel.findByIdAndUpdate(
                chatRoomId,
                {  $push: { messages: chatMessage._id }}
            )

            const formattedMessage: FormattedMessage = {
                content,
                user: {
                    userId: this.userId.toString(),
                    username: this.socket.user?.username as string
                },
                createdAt: chatMessage.createdAt
            }

            this.broadcastMessage(chatRoomId.toString(), formattedMessage)
        }
        catch(e){
            console.error("Error while sending message", e)
        }
    }

    private broadcastMessage(chatRoomId: string, message: FormattedMessage){
        
        const roomClients = ChatWebSocket.clients.get(chatRoomId);
        if (roomClients) {
            roomClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }

    private sendErrorMessage(errorMessage: string) {
        const errorPayload = {
            type: 'ERROR',
            data: { message: errorMessage }
        };
        this.socket.send(JSON.stringify(errorPayload));
    }
}

export default app;