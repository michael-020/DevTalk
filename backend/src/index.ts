import express, { Express } from "express"
import cors from "cors"
import userRouter from "./routes/user";

const app: Express = express();
app.use(express.json())
app.use(cors())

app.use("/api/v1/user", userRouter)


app.listen(3000);