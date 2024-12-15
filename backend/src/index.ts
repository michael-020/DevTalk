import dotenv from "dotenv"
dotenv.config()
import express, { Express } from "express"
import cors from "cors"
import userRouter from "./routes/user";
import mongoose from "mongoose";
import './override';
import { setUpWebSocketServer } from "./wss/wss";
import { JWT_PASS } from "./config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

console.log(JWT_PASS)

export const app: Express = express();
app.use(express.json({ 
    limit: '100mb'  // Increased limit
  }));
  app.use(express.urlencoded({ 
    limit: '100mb', 
    extended: true 
  }));
  
  // If using body-parser
  app.use(bodyParser.json({ 
    limit: '100mb'  // Match the limit
  }));
  app.use(bodyParser.urlencoded({ 
    limit: '100mb', 
    extended: true 
  }));
app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/v1/user", userRouter)

async function main() {
    await mongoose.connect("mongodb://localhost:27017/chat-app")

    console.log("Connected to db")
}
main()

const httpServer = app.listen(3000, () => {
    console.log('Express server running on port 3000');
});


setUpWebSocketServer(httpServer, JWT_PASS);

// const socketServer = wssServer;
// socketServer.listen(8080, () => {
//     console.log("Websocket server running on port 8080")
// })

// httpServer.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//         wss.emit('connection', ws, request);
//     });
// });

