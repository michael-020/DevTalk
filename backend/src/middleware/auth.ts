import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASS } from "./../config"

interface customDecodedInterface {
    userId?: string
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
        req.userId = (decoded as customDecodedInterface).userId
        next()
    }
    else{
        res.json({
            msg: "You are not logged in"
        })
        return
    }
}