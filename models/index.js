import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import './User.js';
import './Chat.js';
import './Message.js';

const databaseName = 'chat-app';

const connectionString = `mongodb+srv://${process.env.MONGODB_NAME}:${process.env.MONGODB_PASSWORD}@atlascluster.9za4ktm.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

async function initializeDB() {
    try {
        await mongoose.connect(connectionString, {
            autoIndex: false,
        });

        console.log('Database connected');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

export default initializeDB;
