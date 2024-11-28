const express = require('express');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Render all trips page
router.get('/view', authMiddleware, async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }); // Fetch trips from the database
        res.render('trips', { trips }); // Pass trips to the EJS view
    } catch (err) {
        console.error('Error fetching trips:', err.message);
        res.status(500).send('Server error');
    }
});

// Show the list of user's trips in the "My Trip" page
router.get('/my-trip', authMiddleware, async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id });
        res.render('myTrip', { trips });
    } catch (err) {
        res.status(500).send('Error fetching trips');
    }
});

// Render the form to add a new trip
router.get('/add', authMiddleware, (req, res) => {
    res.render('addTrip'); // Render the Add Trip page
});

// Create a new trip (POST)
// Create a new trip (POST)
router.post('/add', authMiddleware, async (req, res) => {
    try {
        // Log the incoming data to verify
        console.log('Received trip data:', req.body);

        const { tripName, destinations } = req.body;

        if (!tripName || !destinations || destinations.length === 0) {
            return res.status(400).json({ msg: 'Please fill all fields.' });
        }

        const newTrip = new Trip({
            user: req.user.id,  // Get the logged-in user's ID
            tripName,
            destinations,
        });

        // Save the new trip
        await newTrip.save();
        console.log('Trip saved successfully');
        
        res.status(200).json({ msg: 'Trip route added successfully!' });
    } catch (err) {
        console.error('Error adding trip:', err.message);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});

// Render a detailed view for a specific trip (Big Plan + Destinations)
router.get('/my-trip/:id', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip || trip.user.toString() !== req.user.id) {
            return res.status(404).send('Trip not found');
        }
        res.render('tripDetails', { trip });
    } catch (err) {
        res.status(500).send('Error fetching trip details');
    }
});

// Delete the entire trip (Big Plan)
// Render detailed trip view for a specific trip ID (Big Plan + Destinations)
router.get('/my-trip/:id', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip || trip.user.toString() !== req.user.id) {
            return res.status(404).send('Trip not found');
        }
        // Pass the entire trip object with destinations to the EJS view
        res.render('tripDetails', { trip });
    } catch (err) {
        res.status(500).send('Error fetching trip details');
    }
});


// Edit a destination (City/Country)
router.put('/my-trip/:tripId/destination/:destinationId', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip || trip.user.toString() !== req.user.id) {
            return res.status(404).send('Trip not found');
        }

        const destination = trip.destinations.id(req.params.destinationId);
        if (!destination) {
            return res.status(404).send('Destination not found');
        }

        // Update destination details
        destination.name = req.body.name || destination.name; // Update name or leave as is
        await trip.save();
        res.redirect(`/trips/my-trip/${trip._id}`); // Redirect to the detailed trip page
    } catch (err) {
        res.status(500).send('Error updating destination');
    }
});

// Delete an existing trip
router.delete('/my-trip/:id', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).send('Not authorized to delete this trip');
        }

        // Delete the trip
        await Trip.findByIdAndDelete(req.params.id);
        res.redirect('/trips/my-trip'); // Redirect to 'my-trip' after deleting

    } catch (err) {
        console.error('Error deleting trip:', err);
        res.status(500).send('Error deleting trip');
    }
});

// Delete a specific destination (City/Country)
// Delete a specific destination (City/Country)
router.delete('/my-trip/:tripId/destination/:destinationId', authMiddleware, async (req, res) => {
    try {
        // Find the trip
        const trip = await Trip.findById(req.params.tripId);
        if (!trip || trip.user.toString() !== req.user.id) {
            return res.status(404).send('Trip not found');
        }

        // Find the destination inside the trip
        const destinationId = req.params.destinationId;
        const destination = trip.destinations.id(destinationId); // Use `id()` to get the destination
        if (!destination) {
            return res.status(404).send('Destination not found');
        }

        // Remove the destination from the trip's destinations array
        trip.destinations.pull(destinationId); // This will remove the destination by its ID

        // Save the updated trip
        await trip.save();

        // Redirect to the trip details page after deletion
        res.redirect(`/trips/my-trip/${trip._id}`);
    } catch (err) {
        console.error('Error deleting destination:', err.message); // Log the error for debugging
        res.status(500).send('Error deleting destination');
    }
});



// Render detailed trip view for a specific trip ID (Big Plan + Destinations)
router.get('/view/:id', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to view this trip' });
        }

        res.render('tripDetail', { trip });
    } catch (err) {
        console.error('Error fetching trip details:', err.message);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});

module.exports = router;
