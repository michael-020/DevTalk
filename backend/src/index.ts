import express, { Express } from "express"
import cors from "cors"
import userRouter from "./routes/user";
import mongoose from "mongoose";
import './override';
import wssServer, { setupWebSocketServer } from "./wss/wss";
import { JWT_PASS } from "./config";


export const app: Express = express();
app.use(express.json())
app.use(cors())

app.use("/api/v1/user", userRouter)

async function main() {
    await mongoose.connect("mongodb://localhost:27017/chat-app")

    console.log("Connected to db")
}
main()

const httpServer = app.listen(3000, () => {
    console.log('Express server running on port 3000');
});


setupWebSocketServer(httpServer, JWT_PASS);

const socketServer = wssServer;
socketServer.listen(8080, () => {
    console.log("Websocket server running on port 8080")
})

// httpServer.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//         wss.emit('connection', ws, request);
//     });
// });

