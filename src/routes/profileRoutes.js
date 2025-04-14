//routes to handle profile updates

import express from 'express';
import User from '../models/user.js';
import { checkAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// GET /profile
router.get('/profile', checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.render('index.ejs', { name: req.user.name, user });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
});

// POST /updateProfile
router.post('/updateProfile', checkAuthenticated, async (req, res) => {
  const { bio, skillsDesired, skillsHave } = req.body;
  try {
    const user = await User.findById(req.user._id);

    user.bio = bio;
    user.skillsDesired = skillsDesired.split(',').map((skill) => skill.trim());
    user.skillsHave = skillsHave.split(',').map((skill) => skill.trim());

    await user.save();

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Error updating user profile');
  }
});

export default router;

