import { Schema, model } from "mongoose";

const chatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    }
}, {
    timestamps: true
});

chatSchema.index(
    { participants: 1 },
    { unique: true, partialFilterExpression: { isGroup: false } }
);

const Chat = model("Chat", chatSchema);
export default Chat;
