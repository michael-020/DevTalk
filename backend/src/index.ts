import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import userRouter from "./routes/user";
import mongoose from "mongoose";
import './override';
import app, { server } from "./wss/wss";
import { JWT_PASS } from "./config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/messages";
// import path from "path"

// const __dirname = path.resolve()

// export const app: Express = express();
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

app.use("/api/v1/users", userRouter)
app.use("/api/v1/messages", messageRouter)

// if(process.env.NODE_ENV === "production"){
//   app.use(express.static(path.join(__dirname, "../frontend/dist")))

//   app.get("*", (req: Request, res: Response) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
//   })
// }

async function main() {
  try {
    await mongoose.connect("mongodb://localhost:27017/chat-app")

    console.log("Connected to db")

    // setUpWebSocketServer(wss, JWT_PASS);

    server.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
main()