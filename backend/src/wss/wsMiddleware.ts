import { WebSocketServer } from "ws";
import http from "http"
import jwt from "jsonwebtoken"
import { userModel } from "../model/db";
import { ExtendedWebSocket } from "./customInterfaces";



export function authMiddlware(httpServer: http.Server, wss: WebSocketServer, JWT_PASS: string){
   
    httpServer.on("upgrade", async (request, socket, head) => {
        try{
            const url = new URL(request.url || "", `http://${request.headers.host}`);
            const token = request.headers["authorization"]?.split(" ")[1] || url.searchParams.get("token")

            if(!token){
                console.error("token not found");
                socket.write("Token not found")
                socket.destroy()
                return
            }

            const decoded = jwt.verify(token, JWT_PASS) as {userId: string}
            if(!decoded){
                console.error("Error while verifying token")
                socket.write("Error while verifying token")
                socket.destroy()
                return
            }

            const user = await userModel.findById(decoded.userId)
            if(!user){
                console.error("User not found")
                socket.write("User not found")
                socket.destroy()
                return
            }

            wss.handleUpgrade(request, socket, head, (ws: ExtendedWebSocket) => {
                ws.user = {_id: user._id, username: user.username}
                wss.emit("connection", ws, request)
            })
        }
        catch(e){
            console.error("Error while authenticating JWT", e)
            socket.write("Error while authenticating jwt")
            socket.destroy()
        }
    })
    
}