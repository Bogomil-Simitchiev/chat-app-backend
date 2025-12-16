import { Router } from "express";
import Message from "../../models/Message.js";
import Chat from "../../models/Chat.js";

const router = Router();

router.get("/messages/:chatId", async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.query;

        if (!chatId || !userId) {
            return res.status(400).json({ message: "Missing chatId or userId" });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.participants.includes(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "nickname")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error loading messages:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/messages", async (req, res) => {
    try {
        const { chatId, senderId, content } = req.body;

        if (!chatId || !senderId || !content) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.participants.includes(senderId)) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const message = await Message.create({
            chat: chatId,
            sender: senderId,
            content
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populatedMessage = await message.populate("sender", "nickname");

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
