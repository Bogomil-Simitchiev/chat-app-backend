import { Router } from "express";
import Chat from "../../models/Chat.js";
import User from "../../models/User.js";

const router = Router();

router.post("/chat", async (req, res) => {
    try {
        const { userId, friendId } = req.body;

        if (!userId || !friendId) {
            return res.status(400).json({ message: "Missing userId or friendId" });
        }

        if (userId === friendId) {
            return res.status(400).json({ message: "Cannot create chat with yourself" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.friends.includes(friendId)) {
            return res.status(403).json({ message: "Users are not friends" });
        }

        let chat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [userId, friendId] }
        }).populate("participants", "nickname");

        if (!chat) {
            chat = await Chat.create({
                participants: [userId, friendId]
            });

            chat = await chat.populate("participants", "nickname");
        }

        res.status(200).json(chat);

    } catch (error) {
        console.error("Chat creation error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/chats/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const chats = await Chat.find({
            participants: userId
        })
            .populate("participants", "nickname")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "nickname" }
            })
            .sort({ updatedAt: -1 });

        res.json(chats);

    } catch (error) {
        console.error("Fetching chats error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
