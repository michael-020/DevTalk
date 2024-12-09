import { Request, Response, Router } from "express";
import { userModel } from "../model/db";
import jwt from "jsonwebtoken"
import { JWT_PASS } from "../config";

const userRouter = Router();

userRouter.post("/signup", async (req: Request, res: Response) => {
    const {username, password} = req.body

    await userModel.create({
        username,
        password
    })

    res.json({
        msg: "Signup successful"
    })
})

userRouter.post("/signin", async (req: Request, res: Response) => {
    const { username, password  } = req.body

    const user = await userModel.findOne({username})

    if(!user){
        res.json({
            msg: "user not found"
        })
        return
    }

    if(user?.password !== password){
        res.json({
            msg: "Incorrect password"
        })
        return
    }

    const token = jwt.sign({
        userId: user._id
    }, JWT_PASS)

    res.json({
        token
    })
})

userRouter.get("/chats/:id", (req: Request, res: Response) => {

})


export default userRouter