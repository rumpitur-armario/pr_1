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
// Fetch public trips for specific continent, region, and country
router.get('/public-trips', async (req, res) => {
    const { continent, region, country } = req.query;

    try {
        const trips = await Trip.find({
            'destinations.continent': continent,
            'destinations.region': region,
            'destinations.country': country,
            public: true,
        }).sort({ likes: -1 });

        res.json(trips);
    } catch (err) {
        console.error('Error fetching public trips:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Render the form to add a new trip
router.get('/add', authMiddleware, (req, res) => {
    res.render('addTrip'); // Render the Add Trip page
});

// Create a new trip (POST)

router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { tripName, destinations, isPublic } = req.body;

        if (!tripName || !destinations || destinations.length === 0) {
            return res.status(400).json({ msg: 'Please fill all fields.' });
        }

        const newTrip = new Trip({
            user: req.user.id,
            tripName,
            destinations,
            public: Boolean(isPublic), // Save the public flag as true/false
        });

        await newTrip.save();
        res.status(201).json({ msg: 'Trip created successfully!' });
    } catch (err) {
        console.error('Error adding trip:', err.message);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});



// Render a detailed view for a specific trip (Big Plan + Destinations)

// Increment Likes
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }
        trip.likes += 1;
        await trip.save();
        res.json({ likes: trip.likes }); // Respond with updated likes
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add Review
router.post('/:id/review', authMiddleware, async (req, res) => {
    const { comment } = req.body;
    if (!comment || comment.trim() === '') {
        return res.status(400).json({ msg: 'Review cannot be empty' });
    }

    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }

        trip.reviews.push({ user: req.user.username, comment });
        await trip.save();

        res.json({ reviews: trip.reviews }); // Respond with updated reviews
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});
router.post('/edit/:id', async (req, res) => {
    try {
        const { tripName, destinations, public } = req.body;
        await Trip.findByIdAndUpdate(req.params.id, {
            tripName,
            destinations: destinations.map(dest => ({
                ...dest,
                startDate: new Date(dest.startDate),
                endDate: new Date(dest.endDate)
            })),
            public: public === 'on'
        });
        res.redirect(`/trips/my-trip/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update trip');
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
// Fetch public trips for a specific country
router.get('/public-trips', async (req, res) => {
    try {
        const publicTrips = await Trip.find({ public: true }).sort({ likes: -1 });
        res.json(publicTrips); // Respond with the list of public trips
    } catch (err) {
        console.error('Error fetching public trips:', err.message);
        res.status(500).json({ msg: 'Internal Server Error' });
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
router.get('/trips/my-trip/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).lean(); // Ensure `.lean()` for plain JS objects
        res.render('trip-details', { trip });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.get('/edit/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        res.render('editTrip', { trip, tripId: req.params.id }); // Pass tripId to the view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// Route to fetch public trip plans by country
// Route to render the public trips page for a specific country
router.get('/public/:country', async (req, res) => {
    const { country } = req.params;
    try {
        const publicTrips = await Trip.find({
            'destinations.country': country,
            public: true
        }).sort({ likes: -1 }); // Sort by likes

        res.render('publicTrips', { country, publicTrips });
    } catch (error) {
        console.error('Error fetching public trips:', error);
        res.status(500).send('Failed to load public trips');
    }
});
// Route to get trip details
router.get('/detail/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('user');
        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        const isOwner = req.user && trip.user._id.toString() === req.user._id.toString();

        if (isOwner) {
            // Render editable trip details for the owner
            res.render('tripDetails', { trip });
        } else {
            // Render public trip details for other users
            res.render('publicTripDetails', { trip });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



module.exports = router;