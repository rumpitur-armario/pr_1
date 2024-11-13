const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

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
router.post('/login', async (req, res) => {
   const { email, password } = req.body;
   try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
   } catch (err) {
      res.status(500).json({ msg: 'Server error' });
   }
});

module.exports = router;
