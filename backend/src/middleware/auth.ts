import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASS } from "./../config"
import { IUser } from "../model/db";

interface customDecodedInterface {
    // userId?: string;
    user: IUser
}

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("authorization")

    if(!token){
        res.json({
            msg: "token not found"
        })
        return
    }

    const decoded = jwt.verify(token, JWT_PASS as string) as JwtPayload

    if(decoded){
        // req.userId = (decoded as customDecodedInterface).userId
        req.user = (decoded as customDecodedInterface).user
        next()
    }
    else{
        res.json({
            msg: "You are not logged in"
        })
        return
    }
}