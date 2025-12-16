// services/authService.js
import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';

export async function register(email, nickname, password) {
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
        throw new Error('Nickname already exists!');
    }

    const user = new User({
        email,
        nickname,
        hashedPassword: password
    });
    await user.save();

    const token = generateToken({ id: user._id, nickname: user.nickname });

    return {
        user: {
            userId: user._id,
            nickname: user.nickname,
        },
        token
    };
}

export async function login(nickname, password) {
    const user = await User.findOne({ nickname });
    if (!user) {
        throw new Error('No such user found!');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Incorrect password!');
    }

    const token = generateToken({ id: user._id, nickname: user.nickname });

    return {
        user: {
            userId: user._id,
            nickname: user.nickname,
        },
        token
    };
}
