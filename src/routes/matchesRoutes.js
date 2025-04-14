//routes for matches

import express from 'express';
import User from '../models/user.js';
import { checkAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Matches Page
router.get('/matchesPage', checkAuthenticated, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if (!currentUser) {
            return res.status(404).send('Current user not found');
        }

        const allUsers = await User.find({ _id: { $ne: req.user._id } });

        const matches = allUsers.filter((user) => {
            return user.skillsHave.some((skill) =>
                currentUser.skillsDesired.includes(skill)
            );
        });

        res.render('matches.ejs', { user: currentUser, matches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).send('Error fetching matches');
    }
});

export default router;
