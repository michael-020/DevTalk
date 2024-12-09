"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoomModel = exports.chatModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String, unique: true }
});
const chatSchema = new Schema({
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
const chatRoomSchema = new Schema({
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
});
exports.userModel = mongoose_1.default.model("users", userSchema);
exports.chatModel = mongoose_1.default.model("chats", chatSchema);
exports.chatRoomModel = mongoose_1.default.model("chatrooms", chatRoomSchema);
