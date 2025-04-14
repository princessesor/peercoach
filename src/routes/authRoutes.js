//routes to handle register, login and logout

import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import User from '../models/user.js';
import { checkNotAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

router.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

router.delete('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/login');
  });
});

export default router;
