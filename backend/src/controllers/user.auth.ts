import { Request, Response } from "express";
import { userModel } from "../model/db";
import { generateToken } from "../lib/utils";
import bcrypt from "bcrypt"


export const signupHandler = async (req: Request, res: Response) => {
    const {username, password} = req.body

    const checkUsername = await userModel.findOne({username})
    if(checkUsername){
        res.status(400).json({
            msg: "Username already exists"
        })
        return
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = await userModel.create({
        username,
        password: hashedPassword
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
        const user = await userModel.findOne({ username })

        if (!user) {
            res.status(401).json({
                msg: "Invalid username or password",
            });
            return
        }


        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            res.status(401).json({
                msg: "Invalid username or password",
            });
            return
        }

        // Remove password from the response
        user.password = "";

        const token = generateToken(user._id, res)

        res.json({
            _id: user?._id,
            username: user?.username,
            profilePicture: user?.profilePicture
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