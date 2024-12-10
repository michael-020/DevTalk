import { JwtPayload } from "jsonwebtoken";

declare global{
    export namespace Express {
        interface Request {
            userId?: string | JwtPayload
        }
    }
}