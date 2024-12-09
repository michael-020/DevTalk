import mongoose, { Date, ObjectId } from "mongoose";

const Schema = mongoose.Schema;

interface IUser extends Document {
    username: string;
    password: string;
}

interface IChat extends Document {
    chatRoom: mongoose.Types.ObjectId; 
    sender: mongoose.Types.ObjectId; 
    content: string; 
    // messageType: 'text' | 'image' | 'video' | 'file'; // Type of message
    // readBy: mongoose.Types.ObjectId[]; 
    createdAt: Date;
    updatedAt: Date;
}

interface IChatRoom extends Document {
    // type: 'private' | 'group'; 
    participants: mongoose.Types.ObjectId[]; 
    // groupName?: string; 
    // groupImagePath?: string;
    messages: mongoose.Types.ObjectId; 
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
        ref: 'ChatRoom', 
        required: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
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
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }],
    messages: { 
        type: Schema.Types.ObjectId, 
        ref: 'Message' 
    }
}, {
    timestamps: true
})

export const userModel = mongoose.model("users", userSchema)
export const chatModel = mongoose.model("chats", chatSchema)
export const chatRoomModel = mongoose.model("chatrooms", chatRoomSchema)