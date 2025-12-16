import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';

import initializeDB from './models/index.js';

// controllers
import authController from './controllers/auth/authentication.js';
import friendController from './controllers/friend/friendActions.js';
import chatController from './controllers/chat/chatController.js';
import messageController from './controllers/message/messageController.js';

// models
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// MIDDLEWARES
app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

// ROUTES
app.use('/api/auth', authController);
app.use('/api', friendController);
app.use('/api', chatController);
app.use('/api', messageController);

// SOCKET.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // join chat room
  socket.on('joinChat', async ({ chatId, userId }) => {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) return;
      if (!chat.participants.includes(userId)) return;

      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    } catch (err) {
      console.error('Join chat error:', err);
    }
  });

  // send message
  socket.on('sendMessage', async ({ chatId, senderId, content }) => {
    try {
      if (!chatId || !senderId || !content) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      if (!chat.participants.includes(senderId)) return;

      const message = await Message.create({
        chat: chatId,
        sender: senderId,
        content
      });

      chat.lastMessage = message._id;
      await chat.save();

      const populatedMessage = await message.populate(
        'sender',
        'nickname'
      );

      io.to(chatId).emit('newMessage', populatedMessage);
    } catch (err) {
      console.error('Send message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// SERVER START
initializeDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
  });
