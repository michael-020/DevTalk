import express, { Express } from "express"
import cors from "cors"
import userRouter from "./routes/user";
import mongoose from "mongoose";

const app: Express = express();
app.use(express.json())
app.use(cors())

app.use("/api/v1/user", userRouter)

async function main() {
    await mongoose.connect("mongodb://localhost:27017/chat-app")

    console.log("Connected to db")
}
main()

app.listen(3000);