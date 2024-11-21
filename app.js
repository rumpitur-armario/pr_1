require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const tripRoutes = require('./routes/trips');
const authRoutes = require('./routes/auth');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Middleware for parsing URL-encoded bodies
app.use(session({
   secret: process.env.SESSION_SECRET,  // Use a strong secret key
   resave: false,
   saveUninitialized: false,
   cookie: { secure: false }  // Set to 'true' if using HTTPS in production
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Register routes
app.use('/auth', authRoutes);    // Place auth routes before trips for authentication access
app.use('/trips', tripRoutes);

// Basic home page route
app.get('/', (req, res) => {
   res.render('index');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
