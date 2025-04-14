// src/routes/homeRoutes.js
import express from 'express';
import User from '../models/user.js';
import { checkAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('index.ejs', { name: req.user.name, user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

export default router;
