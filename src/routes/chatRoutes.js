import express from 'express';
import User from '../models/user.js';
import { checkAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Chat Route
router.get('/chat/:id', checkAuthenticated, async (req, res) => {
    try {
        const matchedUserId = req.params.id; // Get matched user ID from URL
        const matchedUser = await User.findById(matchedUserId); // Fetch matched user details

        if (!matchedUser) {
            return res.status(404).send('User not found');
        }

        res.render('chat.ejs', {
            user: req.user, // Current logged-in user
            matchedUser, // Matched user to chat with
        });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).send('Error fetching chat data');
    }
});

export default router;
