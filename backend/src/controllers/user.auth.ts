import { Request, Response } from "express";
import { userModel } from "../model/db";

import { generateToken } from "../lib/utils";


export const signupHandler = async (req: Request, res: Response) => {
    const {username, password} = req.body

    const checkUsername = await userModel.findOne({username})
    if(checkUsername){
        res.status(400).json({
            msg: "Username already exists"
        })
        return
    }

    const newUser = await userModel.create({
        username,
        password
    })

    generateToken(newUser._id, res)

    res.json({
       _id: newUser._id,
       username: newUser.username,
       profilePicutre: newUser.profilePicture
    })
}


export const signinHandler = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // Find user and check password in one query
        const user = await userModel.findOne({ username, password }).select("-password");

        if (!user) {
            res.status(401).json({
                msg: "Invalid username or password",
            });
            return
        }

        const token = generateToken(user._id, res)

        res.json({
            _id: user?._id,
            username: user?.username,
            profilePicture: user?.profilePicture,
            token
        });
    } catch (err) {
        console.error("Error during sign-in:", err);
        res.status(500).json({
            msg: "An error occurred during sign-in",
        });
    }
}

export const logoutHandler = (req: Request, res: Response) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}