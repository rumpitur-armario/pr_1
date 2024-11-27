// Load environment variables from .env
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const tripRoutes = require('./routes/trips');
const authRoutes = require('./routes/auth');
const locationsRoutes = require('./routes/Locations');
const axios = require('axios');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Middleware for parsing URL-encoded bodies
app.use(session({
   secret: process.env.SESSION_SECRET,  // Use a strong secret key
   resave: false,
   saveUninitialized: false,
   cookie: { secure: process.env.NODE_ENV === 'production' }  // Set to 'true' if using HTTPS in production
}));
app.use('/api', locationsRoutes);

app.get('/api/weather', async (req, res) => {
   const { lat, lon } = req.query;
   const apiKey = process.env.OPENWEATHERMAP_API_KEY;  // Use the environment variable for the API key

   try {
       const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
       res.json(response.data);
   } catch (error) {
       console.error('Error fetching weather data:', error);
       res.status(500).send('Error fetching weather data');
   }
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

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
