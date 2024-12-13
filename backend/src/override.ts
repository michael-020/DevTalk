import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./model/db";

declare global{
    export namespace Express {
        interface Request {
            userId?: string | JwtPayload,
            user: IUser
        }
    }
}