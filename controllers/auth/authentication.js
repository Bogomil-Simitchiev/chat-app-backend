import { Router } from 'express';
import { register, login } from '../../services/authService.js';

const router = Router();

router.post('/register', async (req, res) => {
    const { email, nickname, password } = req.body;

    try {
        const { user, token } = await register(email, nickname, password);
        // req.session.user = user; // Optional: keep session if needed
        res.status(201).json({ message: 'Registration successful', user, token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { nickname, password } = req.body;

    try {
        const { user, token } = await login(nickname, password);
        // req.session.user = user; // Optional: keep session if needed
        res.status(200).json({ message: 'Login successful', user, token});
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
