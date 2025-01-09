import WebSocket, { WebSocketServer } from "ws";
import http from "http"
import express from "express"

const app = express()
export const server = http.createServer(app);
export default app;

// yeh function web socket server ko setup karta hai, http server and jwt pass hota hai isme, auth middleware me http server is upgraded to
// Websocket server and userId is sent from the jwt
// export function setUpWebSocketServer(httpServer: http.Server, JWT_PASS: string){
//     const wss = new WebSocketServer({noServer: true})

//     // authMiddlware(httpServer, wss, JWT_PASS)

//     wss.on("connection", (socket: WebSocket, req:http.IncomingMessage) => {
//         // if(!socket.user){
//         //     socket.close(4001, "Unauthorized access")
//         //     return
//         // }
//         // // // Add user to online users
//         // // OnlineUsersManager.addUser(socket.user._id.toString(), socket);
        
//         // // // Broadcast updated online users list
//         // // OnlineUsersManager.broadcastOnlineUsers();

//         // // new ChatWebSocket(socket.user._id, socket)
//         // new ChatWebSocket(socket)

//         const url = new URL(req.url || "", `http://${req.headers.host}`);
//         const userId = url.searchParams.get("userId");

//         if (!userId) {
//             socket.close(4001, "User ID is required");
//             return;
//         }

//         new ChatWebSocket(new mongoose.Types.ObjectId(userId), socket)
//     })

//     return wss;
   
// }

// // Manage online users globally
// class OnlineUsersManager {
//     private static onlineUsers: Map<string, WebSocket> = new Map();

//     static addUser(userId: string, socket: WebSocket) {
//         this.onlineUsers.set(userId, socket);
//     }

//     static removeUser(userId: string) {
//         this.onlineUsers.delete(userId);
//     }

//     static getOnlineUsers(): string[] {
//         return Array.from(this.onlineUsers.keys());
//     }

//     static broadcastOnlineUsers() {
//         const onlineUserIds = this.getOnlineUsers();
        
//         this.onlineUsers.forEach((socket, userId) => {
//             if (socket.readyState === WebSocket.OPEN) {
//                 socket.send(JSON.stringify({
//                     type: 'ONLINE_USERS',
//                     data: { onlineUsers: onlineUserIds }
//                 }));
//             }
//         });
//     }
// }

// class ChatWebSocket{
//     // private userId: mongoose.Types.ObjectId;
//     private userId: mongoose.Types.ObjectId;
//     private socket: WebSocket;
//     private static clients: Map<string, Set<WebSocket>> = new Map();

//     constructor(userId: mongoose.Types.ObjectId, socket: WebSocket){
//         this.userId = userId;
//         this.socket = socket;
        
//         // Add user to online users
//         OnlineUsersManager.addUser(userId.toString(), socket);
        
//         // Broadcast updated online users list
//         OnlineUsersManager.broadcastOnlineUsers();

//         this.initializeSocketHandlers()
//     }

//     private initializeSocketHandlers(){
//         this.socket.on("message", this.handleIncommingMessage.bind(this))
//         this.socket.on("error", (e) => {
//             console.error("Websocket error: ", e)
//         })
//         this.socket.on("close", () => {
//             console.log("Websocket connection closed")

//             // Remove user from online users
//             OnlineUsersManager.removeUser(this.userId.toString());
            
//             // Broadcast updated online users list
//             OnlineUsersManager.broadcastOnlineUsers();
//         })
//     }

//     private async handleIncommingMessage(rawMessage: WebSocket.Data){
//         try {
//             const message = JSON.parse(rawMessage.toString());

//             switch (message.type) {
//                 case MessageTypes.ENTER_ROOM:
//                     if (message.data?.otherUserId) {
//                         await this.enterChatRoom(new mongoose.Types.ObjectId(message.data.otherUserId));
//                     } else {
//                         this.sendErrorMessage('Invalid payload for entering room');
//                     }
//                     break;

//                 case MessageTypes.CHAT:
//                     if (message.data?.content && message.data?.chatRoomId) {
//                         await this.sendMessage(
//                             message.data.content,
//                             new mongoose.Types.ObjectId(message.data.chatRoomId)
//                         );
//                     } else {
//                         this.sendErrorMessage('Invalid payload for sending message');
//                     }
//                     break;

//                 case MessageTypes.LEAVE:
//                     console.log('Leaving room not implemented yet');
//                     break;

//                 default:
//                     this.sendErrorMessage('Unknown message type');
//             }
//         }
//         catch(e) {
//             console.error("Error while handling incoming message:", {
//                 rawMessage,
//                 error: e,
//             });
//         }
//     }

//     private async enterChatRoom(otherUserId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null>{
//         try{
//             const otherUser = await userModel.findById(otherUserId)
//             if(!otherUser){
//                 console.error("user not found")
//                 return null
//             }

//             let chatRoom = await chatRoomModel.findOne({
//                 participants: { $all: [this.userId, otherUserId] },
//             }).populate("messages");

//             if (!chatRoom) {
//                 chatRoom = await chatRoomModel.create({
//                     participants: [this.userId, otherUserId],
//                     messages: [],
//                 });
//             }

//             const populatedMessages = await chatModel.find({ chatRoomId: chatRoom._id })
//             .populate("sender", "username")
//             .sort({ created: 1 });

//             this.socket.send(JSON.stringify({
//                 chatRoom,
//                 messages: populatedMessages,
//             }));
            
            
//             // Add this socket to the room's clients
//             if (!ChatWebSocket.clients.has(chatRoom._id.toString())) {
//                 ChatWebSocket.clients.set(chatRoom._id.toString(), new Set());
//             }
//             ChatWebSocket.clients.get(chatRoom._id.toString())?.add(this.socket);

//             return chatRoom._id;
//         }
//         catch(e){
//             console.error("")
//             return null
//         }
//     } 

//     private async sendMessage(content: string, chatRoomId: mongoose.Types.ObjectId){
//         try {
//             const chatMessage = await chatModel.create({
//                 chatRoom: chatRoomId,
//                 content,
//                 sender: this.userId,
//                 createdAt: new Date()
//             })

//             await chatMessage.populate("sender", "username")

//             await chatRoomModel.findByIdAndUpdate(
//                 chatRoomId,
//                 { $push: { messages: chatMessage._id } }
//             )

//             const formattedMessage = {
//                 type: MessageTypes.CHAT,
//                 data: {
//                     content,
//                     user: {
//                         userId: this.userId.toString(),
//                         username: (await userModel.findById(this.userId))?.username || 'Unknown'
//                     },
//                     createdAt: chatMessage.createdAt,
//                     chatRoomId: chatRoomId.toString()
//                 }
//             }

//             this.broadcastMessage(chatRoomId.toString(), formattedMessage)
//         }
//         catch(e) {
//             console.error("Error while sending message", e)
//             this.sendErrorMessage("Failed to send message")
//         }
//     }

//     private broadcastMessage(chatRoomId: string, message: any){
//         const roomClients = ChatWebSocket.clients.get(chatRoomId);
//         if (roomClients) {
//             roomClients.forEach((client) => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.send(JSON.stringify(message));
//                 }
//             });
//         }
//     }

    
//     private sendErrorMessage(errorMessage: string) {
//         const errorPayload = {
//             type: 'ERROR',
//             data: { message: errorMessage }
//         };
//         this.socket.send(JSON.stringify(errorPayload));
//     }
// }

// app.get('/onlineUsers', (req: Request, res: Response) => {
//     try {
//         const onlineUserIds = OnlineUsersManager.getOnlineUsers();
        
//         // Fetch full user details for online users
//         res.json({ 
//             onlineUsers: onlineUserIds 
//         });
//     } catch (error) {
//         console.error('Error fetching online users:', error);
//         res.status(500).json({ message: 'Error fetching online users' });
//     }
// });


const socketServer = new WebSocketServer({noServer: true})
export const userSocketMap: Record<string, WebSocket> = {}; // { userId: socket }

// Add this crucial upgrade handler
server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (!userId) {
        socket.destroy();
        return;
    }

    socketServer.handleUpgrade(request, socket, head, (ws) => {
        socketServer.emit('connection', ws, request); // this triggers a connection event
    });
});

interface WebSocketMessage {
    type: "JOIN_ROOM" | "SEND_MESSAGE";
    payload: {
      roomId?: string;
      content?: string;
      image?: string;
    };
}

interface CustomWebSocket extends WebSocket {
    roomId?: string;
}

socketServer.on("connection", function connection(socket: CustomWebSocket, req: http.IncomingMessage) {
    // console.log("A user connected");
  
    // Extract userId from query params (e.g., ?userId=123)
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");
  
    if (userId){
        userSocketMap[userId] = socket;

        broadcastOnlineUsers()
    }
    

    socket.on("error", console.error)

    socket.on("message", async (data: WebSocket.Data) => {
        try {
            const parsedMessage: WebSocketMessage = JSON.parse(data.toString())

            if(parsedMessage.type === "JOIN_ROOM" && parsedMessage.payload.roomId){
                // join room logic
                socket.roomId = parsedMessage.payload.roomId

                // console.log(`User ${userId} joined room ${parsedMessage.payload.roomId}`);
            }
            else if(parsedMessage.type === "SEND_MESSAGE"){
                const { roomId, content, image } = parsedMessage.payload;

                // Broadcast the message only;
                socketServer.clients.forEach((client) => {  // Iterates over all connected WebSocket clients
                    const customClient = client as CustomWebSocket;
                    if (
                        customClient.readyState === WebSocket.OPEN && // client is connected and ready to recieve the message
                        customClient.roomId === roomId
                    ) {
                        customClient.send(
                            JSON.stringify({
                                type: "NEW_MESSAGE",
                                payload: { roomId, content, image },
                            })
                        );
                    }
                });
            }
        } catch (error) {
            console.error("Error while sending message:", error);
        }
        
    })

    socket.on("close", () => {
        // logic to disconnect the user 
        // console.log("A client disconnected");

        const userId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === socket
        );
    
        if (userId) {
            delete userSocketMap[userId];
            // console.log(`User ${userId} removed from socket map`);

            broadcastOnlineUsers();
        }
    })
})

// Broadcast online users
function broadcastOnlineUsers() {
    const onlineUsers = Object.keys(userSocketMap);
    socketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "ONLINE_USERS",
                payload: onlineUsers,
            }));
        }
    });
}