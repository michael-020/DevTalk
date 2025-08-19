import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import userRouter from "./routes/user.js";
import mongoose from "mongoose";
import './override.js';
import app, { server } from "./wss/wss.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/messages.js";
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ 
    limit: '100mb'  // Increased limit
  }));
  app.use(express.urlencoded({ 
    limit: '100mb', 
    extended: true 
  }));
  

  app.use(bodyParser.json({ 
    limit: '100mb'  
  }));
  app.use(bodyParser.urlencoded({ 
    limit: '100mb', 
    extended: true 
  }));
app.use(cookieParser())

app.use(cors({
    origin: process.env.NODE_ENV === "production" ? true : "http://localhost:5173", 
    credentials: true
}))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/messages", messageRouter)

app.use("/health", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: 'Server health check failed',
      error: errorMessage
    });
  }
})

if(process.env.NODE_ENV === "production"){
  const rootDir = path.resolve(__dirname, '..');
  app.use(express.static(path.join(rootDir, '../frontend/dist')))

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootDir, '../frontend/dist/index.html'))
  })
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL as string)

    console.log("Connected to db")

    // setUpWebSocketServer(wss, JWT_PASS);

    server.listen(process.env.PORT, () => {
      console.log('Server running on port 3000');
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
main()