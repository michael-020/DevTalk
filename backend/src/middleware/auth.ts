import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASS } from "./../config"


export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("authorization")
    const decoded = jwt.verify(token as string, JWT_PASS) as JwtPayload

    if(decoded){
        req.userId = decoded.userId
        next()
    }
    else{
        res.json({
            msg: "You are not logged in"
        })
        return
    }
}