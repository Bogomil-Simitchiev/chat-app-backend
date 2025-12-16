import { Router } from 'express';
import User from '../../models/User.js';

const router = Router();

router.post('/add-friend', async (req, res) => {
    try {
        const { senderNickname, recipientNickname } = req.body;

        if (senderNickname === recipientNickname) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }
        const sender = await User.findOne({ nickname: senderNickname }).collation({ locale: 'en', strength: 2 });
        const recipient = await User.findOne({ nickname: recipientNickname }).collation({ locale: 'en', strength: 2 });

        if (!sender || !recipient) {
            return res.status(404).json({ message: "User not found." });
        }

        if (sender.friends.includes(recipient._id) || recipient.friends.includes(sender._id)) {
            return res.status(400).json({ message: "You are already friends." });
        }

        if (recipient.requests.includes(sender._id)) {
            return res.status(400).json({ message: "Friend request already sent." });
        }
        
        recipient.requests.push(sender._id);
        await recipient.save();

        res.json({ message: `Friend request sent to ${recipientNickname}.` });
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.get('/requests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('requests', 'nickname email');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ requests: user.requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post('/accept/:requesterId/:userId', async (req, res) => {
    try {
        const { requesterId, userId } = req.params;

        const requester = await User.findById(requesterId);
        const user = await User.findById(userId);

        if (!requester || !user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.requests.includes(requesterId)) {
            return res.status(400).json({ message: "No friend request found from this user." });
        }

        if (!user.friends.includes(requesterId)) {
            user.friends.push(requesterId);
        }
        if (!requester.friends.includes(userId)) {
            requester.friends.push(userId);
        }

        user.requests = user.requests.filter((id) => id.toString() !== requesterId.toString());

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Friend request accepted!", user, requester });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post('/decline/:requesterId/:userId', async (req, res) => {
    try {
        const { requesterId, userId } = req.params;

        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "User not found." });

        user.requests = user.requests.filter((id) => id.toString() !== requesterId.toString());

        await user.save();

        res.status(200).json({ message: "Friend request declined!", user });

    } catch (error) {
        console.error("Error declining friend request:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.get('/friends/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('friends', 'nickname');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ friends: user.friends });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
