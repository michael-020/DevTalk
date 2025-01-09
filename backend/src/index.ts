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
    credentials: true
}))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/messages", messageRouter)

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