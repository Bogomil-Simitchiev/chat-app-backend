import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'my_dev_secret_key';

export function generateToken(user) {
    return jwt.sign({ userId: user.id, nickname: user.nickname }, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
