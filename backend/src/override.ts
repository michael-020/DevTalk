import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./model/db.js";

declare global{
    export namespace Express {
        interface Request {
            userId?: string | JwtPayload,
            user: IUser
        }
    }
}