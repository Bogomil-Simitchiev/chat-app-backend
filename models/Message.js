import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

messageSchema.index({ chat: 1, createdAt: -1 });

const Message = model("Message", messageSchema);
export default Message;
