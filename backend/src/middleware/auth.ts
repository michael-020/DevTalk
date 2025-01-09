import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { IUser, userModel } from "../model/db.js";

interface customDecodedInterface {
    userId?: string;
    user: IUser
}

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt

    if(!token){
        res.status(400).json({
            msg: "token not found"
        })
        return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    
    if(decoded){
        const user = await userModel.findById((decoded as customDecodedInterface).userId).select("-password")

        if(!user){
            res.status(400).json({
                msg: "user not found"
            })
            return
        }
        // req.userId = (decoded as customDecodedInterface).userId
        req.user = user
        next()
    }
    else{
        res.status(400).json({
            msg: "You are not logged in"
        })
        return
    }
}