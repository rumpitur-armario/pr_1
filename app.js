require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const tripRoutes = require('./routes/trips');
const authRoutes = require('./routes/auth');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');  // Set EJS as the template engine

// Basic route
app.get('/', (req, res) => {
   res.render('home');  // Render 'home.ejs' as the homepage
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
