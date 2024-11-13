const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');


router.get('/register', (req, res) => {
   res.render('register'); // This serves the register.ejs file
});

router.post('/register', async (req, res) => {
   try {
       // Step 1: Extract fields from request body
       const { username, email, password } = req.body;

       // Step 2: Check if all fields are provided
       if (!username || !email || !password) {
           console.log('Missing fields in request body:', req.body);
           return res.status(400).json({ msg: 'All fields are required' });
       }

       console.log('Register request received:', req.body);

       // Step 3: Check if user already exists
       let user = await User.findOne({ email });
       if (user) {
           console.log('User already exists:', email);
           return res.status(400).json({ msg: 'User already exists' });
       }

       // Step 4: Trim the password to remove any extra spaces
       const trimmedPassword = password.trim();

       // Step 5: Hash the password
       console.log('Hashing password...');
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
       console.log('Password hashed successfully:', hashedPassword);

       // Step 6: Create a new user instance with the hashed password
       user = new User({
           username,
           email,
           password: hashedPassword // Use the hashed password here
       });

       // Step 7: Save the user to MongoDB
       await user.save();
       console.log('User saved successfully:', user);

       // Step 8: Generate a JWT token for the newly registered user
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

       // Optional Step 9: Save token to the database (optional)
       const tokenDocument = new Token({
           userId: user._id,
           token: token
       });
       await tokenDocument.save();
       console.log('Token saved successfully:', tokenDocument);

       // Step 10: Send response with the token
       res.status(201).json({ token });
   } catch (err) {
       console.error('Error during registration:', err.message);
       res.status(500).json({ msg: 'Server error' });
   }
});







// Login Route
router.get('/login', (req, res) => {
   res.render('login');
});

// User Login
router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   try {
       console.log('Login request received:', req.body);

       // Find the user by email
       const user = await User.findOne({ email });
       if (!user) {
           console.log('User not found:', email);
           return res.status(400).json({ msg: 'Invalid credentials' });
       }
       console.log('User found:', user);

       // Compare the provided password with the hashed password in the database
       console.log('Comparing passwords...');
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
           console.log('Password does not match for user:', email);
           return res.status(400).json({ msg: 'Invalid credentials' });
       }
       console.log('Password matches');

       // Generate a JWT token
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

       // Save token in the database (optional)
       const tokenDocument = new Token({
           userId: user._id,
           token: token
       });
       await tokenDocument.save();
       console.log('Token saved successfully:', tokenDocument);

       res.json({ token });
   } catch (err) {
       console.error('Error during login:', err.message);
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
