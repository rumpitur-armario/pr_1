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
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        console.log('Register request received:', req.body);

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const trimmedPassword = password.trim();
        console.log('Trimmed password:', trimmedPassword);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
        console.log('Password hashed successfully:', hashedPassword);

        user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        console.log('User saved successfully with hashed password:', user);

        // Generate a JWT token for the newly registered user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '70d' });

        // Store token in session
        req.session.token = token;  // <-- Store the token in session

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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '70d' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000 // Cookie will expire in 1 hour
        });

        // Optionally send a success message
        res.status(200).json({ msg: 'Login successful' });

    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});




// User Logout
// Logout route
// Logout route
router.get('/auth/logout', (req, res) => {
    // If using session-based authentication
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/'); // Redirect to the home page
    });

    // If using token-based authentication
    // Clear any client-side stored tokens or cookies
    res.clearCookie('token'); // Replace 'token' with the name of your cookie, if applicable
    res.redirect('/'); // Redirect to the home page
});



module.exports = router;
