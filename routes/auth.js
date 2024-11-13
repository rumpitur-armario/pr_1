const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');


// Signup Route
router.post('/signup', async (req, res) => {
   const { username, email, password } = req.body;
   try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });

      // Create a new user
      user = new User({ username, email, password });
      await user.save();

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, username, email } });
   } catch (err) {
      res.status(500).json({ msg: 'Server error' });
   }
});

// Login Route
router.get('/login', (req, res) => {
   res.render('login');
});

router.post('/login', async (req, res) => {
   const { email, password } = req.body;
   try {
       const user = await User.findOne({ email });
       if (!user) {
           return res.status(400).json({ msg: 'Invalid credentials' });
       }

       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
           return res.status(400).json({ msg: 'Invalid credentials' });
       }

       // Generate JWT token
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

       // Save token in MongoDB
       const tokenDocument = new Token({
           userId: user._id,
           token: token
       });
       await tokenDocument.save();

       res.json({ token });
   } catch (err) {
       console.error(err.message);
       res.status(500).json({ msg: 'Server error' });
   }
});

router.post('/logout', async (req, res) => {
   const authHeader = req.header('Authorization');
   if (!authHeader) {
       return res.status(400).json({ msg: 'No token provided' });
   }

   try {
       const token = authHeader.split(' ')[1];
       await Token.findOneAndDelete({ token: token });
       res.json({ msg: 'Logged out successfully' });
   } catch (err) {
       console.error(err.message);
       res.status(500).json({ msg: 'Server error' });
   }
});


module.exports = router;
