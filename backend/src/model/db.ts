import mongoose, { ObjectId } from "mongoose";

const Schema = mongoose.Schema;

interface IUser extends Document {
    username: string;
    password: string;
}

interface IChat extends Document {
    chatRoom: mongoose.Types.ObjectId; 
    sender: mongoose.Types.ObjectId; 
    receiver: mongoose.Types.ObjectId;
    content: string; 
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
    password: {type: String}
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
        type: String, 
        required: true 
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