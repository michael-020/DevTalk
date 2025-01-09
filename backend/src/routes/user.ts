import express, { Request, Response, Router } from "express";
import { userModel } from "../model/db.js";
import { userMiddleware } from "../middleware/auth.js";
import cloudinary from "../lib/cloudinary.js";
import { logoutHandler, signinHandler, signupHandler } from "../controllers/user.auth.js";

const userRouter = Router();
userRouter.use(express.json())

userRouter.post("/signup", signupHandler)

userRouter.post("/signin", signinHandler)

userRouter.post("/logout", logoutHandler)

userRouter.put("/updateProfile", userMiddleware, async (req: Request, res: Response) => {
    try {
        const profilePic  = req.body.profilePic
        const userId = req.user._id

        if(!profilePic){
            res.status(401).json({
                msg: "profile pic not provided"
            })
            return
        }

        if (profilePic && profilePic.length > 10 * 1024 * 1024) { // 10MB limit for base64
            res.status(413).json({
                msg: "Profile picture is too large"
            });
            return
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "profile_pictures", 
            transformation: [
                { width: 500, height: 500, crop: "fill" }, 
                { quality: "auto" }
            ]
        })

        const updatedUser = await userModel.findByIdAndUpdate(userId, {profilePicture: uploadResponse.url}, {new: true})

        res.status(200).json(updatedUser)
    } catch (error) {
        console.error("Error while updating user", error)
        res.status(500).json({
            msg: "error while updating user"
        })
    }
    
})

userRouter.get("/check", userMiddleware, (req: Request, res: Response) => {
    try{
        res.status(200).json(req.user)
    }
    catch(e){
        console.error("Error while checking user", e)
        res.status(500).json({
            msg: "error while checking user"
        })
    }
})

userRouter.get("/usernames", userMiddleware, async (req: Request, res: Response) => {
    try {
        const users = await userModel.find({ _id: { $ne: req.user._id } });

        if (!users || users.length === 0) {
            res.status(404).json({
                msg: "No users found"
            });
            return;
        }

        res.status(200).json({
            users: users.map(u => ({
                _id: u._id,
                username: u.username, 
                profilePicture: u.profilePicture
            }))
        });
    } catch (error) {
        console.error("Error while getting usernames", error)
        res.status(500).json({
            msg: "Error while getting usernames"
        })
    }
})  


export default userRouter