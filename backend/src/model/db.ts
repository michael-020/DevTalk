import mongoose, { ObjectId } from "mongoose";

const Schema = mongoose.Schema;

export interface IUser extends Document {
    _id?: mongoose.Types.ObjectId
    username: string;
    password: string;
    profilePicture: string;
    createdAt: Date;
}

interface IChat extends Document {
    chatRoom: mongoose.Types.ObjectId; 
    sender: mongoose.Types.ObjectId; 
    receiver: mongoose.Types.ObjectId;
    content?: string; 
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatRoom extends Document {
    participants: mongoose.Types.ObjectId[]; 
    messages?: mongoose.Types.ObjectId[]; 
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: {type: String, unique: true},
    password: {type: String},
    profilePicture: {type: String, default: ""}
}, {
    timestamps: true
})

const chatSchema = new Schema<IChat>({
    chatRoom: { 
        type: Schema.Types.ObjectId, 
        ref: 'chatrooms', 
        required: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    content: { 
        type: String
    },
    image: {
        type: String,
        default: ""
    }
}, { 
    timestamps: true 
});

const chatRoomSchema = new Schema<IChatRoom>({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    }],
    messages: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'chats' 
    }]
}, {
    timestamps: true
})

export const userModel = mongoose.model("users", userSchema)
export const chatModel = mongoose.model("chats", chatSchema)
export const chatRoomModel = mongoose.model("chatrooms", chatRoomSchema)