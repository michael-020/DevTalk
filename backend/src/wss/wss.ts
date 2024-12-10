import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { chatModel, chatRoomModel, userModel } from "../model/db";
import mongoose from 'mongoose';
import { app } from '..';
import { JWT_PASS } from '../config';

// Enhanced type definitions
enum WebSocketMessageType {
    ENTER_ROOM = 'ENTER_ROOM',
    SEND_MESSAGE = 'SEND_MESSAGE',
    LEAVE_ROOM = 'LEAVE_ROOM',
}

interface WebSocketMessagePayload {
    type: WebSocketMessageType;
    data: {
        otherUserId?: string;
        content?: string;
        chatRoomId?: string;
    };
}

interface ExtendedWebSocket extends WebSocket {
    user?: WebSocketUser;
}

interface WebSocketUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    chatRoomId?: string;
}

interface ChatMessage {
    chatRoom: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

interface ChatRoom {
    _id: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    messages: mongoose.Types.ObjectId[];
}

interface ErrorMessage {
    type: 'ERROR';
    data: { message: string };
}

interface FormattedMessage {
    type: WebSocketMessageType.SEND_MESSAGE;
    data: {
        chatRoomId: string;
        content: string;
        sender: {
            _id: mongoose.Types.ObjectId;
            username?: string;
        };
        createdAt: Date;
    };
}

const wssServer = http.createServer();

setupWebSocketServer(wssServer, JWT_PASS);

wssServer.listen(8080, () => {
    console.log(`WebSocket server running on port 8080`);
});

function wsAuthMiddleware(httpServer: http.Server, wss: WebSocketServer, JWT_PASS: string) {
    httpServer.on('upgrade', async (request, socket, head) => {
        try {
            const url = new URL(request.url || '', `http://${request.headers.host}`);
            const token = url.searchParams.get('token') || request.headers['authorization']?.split(' ')[1];

            if (!token) {
                console.error('No token found in request');
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            const decoded = jwt.verify(token, JWT_PASS) as { userId: string };
            const user = await userModel.findById(decoded.userId);
            if (!user) {
                console.error('User not found in database');
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            wss.handleUpgrade(request, socket, head, (ws: ExtendedWebSocket) => {
                ws.user = { _id: user._id, username: user.username };
                wss.emit('connection', ws, request);
            });

        } catch (error) {
            console.error('Authentication error during WebSocket upgrade:', error);
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        }
    });
}

class ChatWebSocket {
    private ws: ExtendedWebSocket;
    private userId: mongoose.Types.ObjectId;
    private static clients: Map<string, Set<ExtendedWebSocket>> = new Map();

    constructor(userId: mongoose.Types.ObjectId, ws: ExtendedWebSocket) {
        this.userId = userId;
        this.ws = ws;
        this.initializeWebSocketHandlers();
    }

    private initializeWebSocketHandlers() {
        this.ws.on('message', this.handleIncomingMessage.bind(this));
        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
        this.ws.on('close', () => {
            console.log('WebSocket connection closed');

            if (this.ws.user?.chatRoomId) {
                const roomClients = ChatWebSocket.clients.get(this.ws.user.chatRoomId);
                if (roomClients) {
                    roomClients.delete(this.ws);
                }
            }
        });
    }

    private async enterChatRoom(otherUserId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null> {
        try {
            let chatRoom = await chatRoomModel.findOne({
                participants: { 
                    $all: [
                        { $elemMatch: { $eq: this.userId } },
                        { $elemMatch: { $eq: otherUserId } }
                    ],
                    $size: 2 
                }
            }).populate('messages');
    
            if (!chatRoom) {
                const existingRoom = await chatRoomModel.findOne({
                    participants: { 
                        $all: [
                            { $elemMatch: { $eq: this.userId } },
                            { $elemMatch: { $eq: otherUserId } }
                        ],
                        $size: 2 
                    }
                });

                if (existingRoom) {
                    chatRoom = existingRoom;
                    console.log('Existing chat room found');
                } else {
                    chatRoom = await chatRoomModel.create({
                        participants: [this.userId, otherUserId],
                        messages: []
                    });
                    console.log('New chat room created');
                }
            } else {
                console.log('Existing chat room found');
            }
    
            const populatedMessages = await chatModel
                .find({ chatRoom: chatRoom._id })
                .populate('sender', 'username')
                .sort({ createdAt: 1 });
    
            this.ws.send(
                JSON.stringify({
                    type: WebSocketMessageType.ENTER_ROOM,
                    data: {
                        chatRoom,
                        messages: populatedMessages
                    }
                })
            );

            // Ensure ws.user exists
            if (!this.ws.user) {
                this.ws.user = { 
                    _id: new mongoose.Types.ObjectId(), 
                    username: 'default', 
                    chatRoomId: '' 
                };
            }

            this.ws.user.chatRoomId = chatRoom._id.toString();
    
            if (!ChatWebSocket.clients.has(chatRoom._id.toString())) {
                ChatWebSocket.clients.set(chatRoom._id.toString(), new Set());
            }
            ChatWebSocket.clients.get(chatRoom._id.toString())?.add(this.ws);
    
            return chatRoom._id;
        } catch (error) {
            console.error('Room entry error:', error);
            this.sendErrorMessage('Failed to enter chat room');
            return null;
        }
    }

    private broadcastToChatRoom(chatRoomId: string, message: FormattedMessage | ErrorMessage) {
        const roomClients = ChatWebSocket.clients.get(chatRoomId);
        if (roomClients) {
            roomClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }

    private async sendMessage(messageContent: string, chatRoomId: mongoose.Types.ObjectId) {
        try {
            const chatMessage = await chatModel.create({
                chatRoom: chatRoomId,
                sender: this.userId,
                content: messageContent,
                createdAt: new Date()
            });

            await chatMessage.populate('sender', 'username');

            await chatRoomModel.findByIdAndUpdate(
                chatRoomId, 
                { $push: { messages: chatMessage._id } }
            );

            const formattedMessage: FormattedMessage = {
                type: WebSocketMessageType.SEND_MESSAGE,
                data: {
                    chatRoomId: chatRoomId.toString(),
                    content: messageContent,
                    sender: {
                        _id: this.userId,
                        username: this.ws.user?.username
                    },
                    createdAt: chatMessage.createdAt
                }
            };

            this.broadcastToChatRoom(chatRoomId.toString(), formattedMessage);
        } catch (error) {
            console.error('Message send error:', error);
            this.sendErrorMessage('Failed to send message');
        }
    }

    private async handleIncomingMessage(rawMessage: WebSocket.Data) {
        try {
            const message: WebSocketMessagePayload = JSON.parse(rawMessage.toString());

            switch (message.type) {
                case WebSocketMessageType.ENTER_ROOM:
                    if (message.data?.otherUserId) {
                        await this.enterChatRoom(new mongoose.Types.ObjectId(message.data.otherUserId));
                    } else {
                        this.sendErrorMessage('Invalid payload for entering room');
                    }
                    break;

                case WebSocketMessageType.SEND_MESSAGE:
                    if (message.data?.content && message.data?.chatRoomId) {
                        await this.sendMessage(
                            message.data.content,
                            new mongoose.Types.ObjectId(message.data.chatRoomId)
                        );
                    } else {
                        this.sendErrorMessage('Invalid payload for sending message');
                    }
                    break;

                case WebSocketMessageType.LEAVE_ROOM:
                    console.log('Leaving room not implemented yet');
                    break;

                default:
                    this.sendErrorMessage('Unknown message type');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            this.sendErrorMessage('Invalid message format');
        }
    }

    private sendErrorMessage(errorMessage: string) {
        const errorPayload: ErrorMessage = {
            type: 'ERROR',
            data: { message: errorMessage }
        };
        this.ws.send(JSON.stringify(errorPayload));
    }
}

export function setupWebSocketServer(httpServer: http.Server, JWT_PASS: string) {
    const wss = new WebSocketServer({ noServer: true });

    wsAuthMiddleware(httpServer, wss, JWT_PASS);

    wss.on('connection', (ws: ExtendedWebSocket) => {
        if (!ws.user) {
            ws.close(4001, 'Unauthorized');
            return;
        }

        new ChatWebSocket(ws.user._id, ws);
    });

    return wss;
}

export const wss = setupWebSocketServer;