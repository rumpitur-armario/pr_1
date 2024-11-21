const express = require('express');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Render all trips page (No middleware)
router.get('/view', (req, res) => {
   res.render('trips');
});

// Render the form to add a new trip (No middleware)
router.get('/add', (req, res) => {
    // If token is stored in the session, pass it; otherwise, use a default (null)
    const token = req.session ? req.session.token : null;
    res.render('addTrip', { token });
});

// Render the form to edit a trip (No middleware)
router.get('/edit/:id', (req, res) => {
   res.render('editTrip', { tripId: req.params.id });
});

// Render the map view page (No middleware)
router.get('/map-view', (req, res) => {
   res.render('map');
});

// Create a new trip (POST)
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { destination, coordinates, startDate, endDate, activities } = req.body;
 
        if (!destination || !coordinates || !coordinates.latitude || !coordinates.longitude || !startDate || !endDate) {
            return res.status(400).json({ msg: 'Please provide all required fields including coordinates.' });
        }
 
        const newTrip = new Trip({
            user: req.user.id,
            destination,
            coordinates,
            startDate,
            endDate,
            activities: activities.split(',').map(activity => activity.trim())
        });
 
        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
 });

// Get all trips for the logged-in user (JSON)
router.get('/', authMiddleware, async (req, res) => {
   try {
       const trips = await Trip.find({ user: req.user.id });
       res.json(trips);
   } catch (err) {
       res.status(500).json({ msg: 'Server error' });
   }
});

// Map route to display trips on the map (JSON)
router.get('/map', authMiddleware, async (req, res) => {
    try {
        console.log('Authenticated user ID:', req.user.id);

        // Fetch trips from the database for the logged-in user
        const trips = await Trip.find({ user: req.user.id });

        if (!trips || trips.length === 0) {
            console.log('No trips found for user:', req.user.id);
        } else {
            console.log('Fetched trips:', trips);
        }

        res.json({ trips });
    } catch (err) {
        console.error('Error fetching trips:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get a specific trip by ID (JSON)
router.get('/:id', authMiddleware, async (req, res) => {
   try {
       const trip = await Trip.findById(req.params.id);
       if (!trip) {
           return res.status(404).json({ msg: 'Trip not found' });
       }
       if (trip.user.toString() !== req.user.id) {
           return res.status(401).json({ msg: 'Not authorized' });
       }
       res.json(trip);
   } catch (err) {
       console.error(err.message);
       res.status(500).json({ msg: 'Server error' });
   }
});

// Update an existing trip
router.put('/:id', authMiddleware, async (req, res) => {
   try {
       const { destination, startDate, endDate, activities } = req.body;
       let trip = await Trip.findById(req.params.id);
       if (!trip) {
           return res.status(404).json({ msg: 'Trip not found' });
       }
       if (trip.user.toString() !== req.user.id) {
           return res.status(401).json({ msg: 'Not authorized' });
       }

       trip = await Trip.findByIdAndUpdate(req.params.id, {
           destination,
           startDate,
           endDate,
           activities
       }, { new: true });

       res.json(trip);
   } catch (err) {
       console.error(err.message);
       res.status(500).json({ msg: 'Server error' });
   }
});

// Delete an existing trip
router.delete('/:id', authMiddleware, async (req, res) => {
   try {
       const trip = await Trip.findById(req.params.id);

       if (!trip) {
           return res.status(404).json({ msg: 'Trip not found' });
       }

       if (trip.user.toString() !== req.user.id) {
           return res.status(401).json({ msg: 'Not authorized' });
       }

       await Trip.findByIdAndDelete(req.params.id);
       res.json({ msg: 'Trip removed' });
   } catch (err) {
       res.status(500).json({ msg: 'Server error' });
   }
});


router.get('/view/:id', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.render('viewTrip', { trip });
    } catch (err) {
        console.error('Error fetching trip details:', err.message);
        res.status(500).send('Server error');
    }
 });



module.exports = router;
