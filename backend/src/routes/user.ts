import { Request, Response, Router } from "express";
import { chatRoomModel, userModel } from "../model/db";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASS } from "../config";
import { userMiddleware } from "../middleware/auth";

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

userRouter.get("/chats", userMiddleware, async (req: Request, res: Response) => {
    const userId = req.userId as string

    const user  = await userModel.findById(userId);

    if(!user){
        res.json({
            msg: "user not found"
        })
        return
    }

    res.json(user)

})  

userRouter.post("/chat-room/:id", userMiddleware, async (req: Request, res: Response) => {
    const userId = req.userId
    const user2Id = req.params.id

    const user  = await userModel.findById(userId);
    const user2 = await userModel.findById(user2Id)
    
    if(!user){
        res.json({
            msg: "user not found"
        })
        return
    }
    if(!user2){
        res.json({
            msg: "user2 not found"
        })
        return
    }

    const checkRoom = await chatRoomModel.findOne({ participants: { $all: [userId, user2Id] } });
    if(checkRoom){
        res.json({
            msg: "room joined",
            room: checkRoom
        })
        return
    }

    const newRoom = await chatRoomModel.create({
        participants: [user, user2]
    })

    res.json({
        msg: "room created",
        newRoom
    })
})  

export default userRouter