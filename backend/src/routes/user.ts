import { Request, Response, Router } from "express";
import { chatModel, chatRoomModel, userModel } from "../model/db";
import { userMiddleware } from "../middleware/auth";
import cloudinary from "../lib/cloudinary";
import { generateToken } from "../lib/utils";

const userRouter = Router();

userRouter.post("/signup", async (req: Request, res: Response) => {
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
})

userRouter.post("/signin", async (req: Request, res: Response) => {
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
            profilePicture: user?.profilePicture
        });
    } catch (err) {
        console.error("Error during sign-in:", err);
        res.status(500).json({
            msg: "An error occurred during sign-in",
        });
    }
})

userRouter.post("/logout", (req: Request, res: Response) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
})

userRouter.post("/updateProfile", userMiddleware, async (req: Request, res: Response) => {
    const {profilePic} = req.body
    const userId = req.user._id

    if(!profilePic){
        res.status(401).json({
            msg: "profile pic not provided"
        })
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    const updatedUser = await userModel.findByIdAndUpdate(userId, {profilePicture: uploadResponse.url}, {new: true})

    res.status(200).json(updatedUser)
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
    // Fetch all users except the one making the request
    const users = await userModel.find({ _id: { $ne: req.user._id } });

    if (!users || users.length === 0) {
        res.status(404).json({
            msg: "No users found"
        });
        return;
    }

    res.json({
        users: users.map(u => ({
            id: u._id,
            username: u.username, 
        }))
    });

})  

userRouter.get("/getMessages/:id", userMiddleware, async (req: Request, res: Response) => {
    const userId = req.user._id
    const user2Id = req.params.id

    const user  = await userModel.findById(userId);
    const user2 = await userModel.findById(user2Id)
    
    if(!user){
        res.json({
            msg: "user not found"
        })
        return
    }
    if(!user2){
        res.json({
            msg: "user2 not found"
        })
        return
    }

    const checkRoom = await chatRoomModel.findOne({ participants: { $all: [userId, user2Id] } });
    if(checkRoom){
        const messages = await chatModel.find({chatRoom: checkRoom._id})
        res.json({
            msg: "room joined",
            messages
        })
        return
    }

    const newRoom = await chatRoomModel.create({
        participants: [user, user2]
    })
    const messages = await chatModel.find({chatRoom: newRoom._id})
    res.json({
        msg: "room created",
        messages
    })
})  

userRouter.post("/sendMessage/:id", userMiddleware, async (req: Request, res: Response) => {
    try{
        const myId = req.user._id;
        const otherUserId = req.params.id
        const {content, image} = req.body

        const otherUser = await userModel.findById(otherUserId)
        if(!otherUser){
            res.status(401).json({
                msg: "user not found"
            })
        }
    
        let chatRoom = await chatRoomModel.findOne({
            participants: { $all: [myId, otherUserId ] } 
        })
        if(!chatRoom){
            chatRoom = new chatRoomModel({
                participants: [myId, otherUserId],
                messages: [] 
            });
           
            await chatRoom.save()
        }

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
       
        const message = new chatModel({
            content,
            image: imageUrl,
            sender: myId,
            chatRoom: chatRoom._id
        })
    
        await message.save()
    
        chatRoom.messages?.push(message._id);
        await chatRoom.save();

        // todo: real time functionality
    
        res.status(200).json({
            msg: "Message sent",
            message
        });
    }
    catch(e) {
        console.error("error while sending message", e)
        res.status(500).json("error while sending message")
    }
})

export default userRouter