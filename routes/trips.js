const express = require('express');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new trip
router.post('/', authMiddleware, async (req, res) => {
   try {
      const { destination, startDate, endDate, activities } = req.body;
      const newTrip = new Trip({
         user: req.user.id,
         destination,
         startDate,
         endDate,
         activities
      });
      const savedTrip = await newTrip.save();
      res.json(savedTrip);
   } catch (err) {
      res.status(500).json({ msg: 'Server error' });
   }
});

router.get('/view', (req, res) => {
    res.render('trips');
});
router.get('/add', (req, res) => {
    res.render('addTrip');
});
// Get all trips for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
   try {
      const trips = await Trip.find({ user: req.user.id });
      res.json(trips);
   } catch (err) {
      res.status(500).json({ msg: 'Server error' });
   }
});

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
router.get('/edit/:id', (req, res) => {
    res.render('editTrip', { tripId: req.params.id });
});

// Delete an existing trip
router.delete('/:id', authMiddleware, async (req, res) => {
   try {
       const trip = await Trip.findById(req.params.id);

       // Check if trip exists and if the user owns it
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
// Render all trips page
router.get('/view', authMiddleware, async (req, res) => {
   try {
       // Fetch trips from the database where user matches the logged-in user's ID
       const trips = await Trip.find({ user: req.user.id });

       // Render the 'trips.ejs' template located in the 'views' folder
       res.render('trips', { trips });
   } catch (err) {
       res.status(500).json({ msg: 'Server error' });
   }
});
// Render the form to add a new trip
router.get('/add', authMiddleware, (req, res) => {
   res.render('addTrip');
});

// Render the form to edit a trip
router.get('/edit/:id', authMiddleware, async (req, res) => {
   try {
       const trip = await Trip.findById(req.params.id);
       if (!trip) {
           return res.status(404).json({ msg: 'Trip not found' });
       }

       if (trip.user.toString() !== req.user.id) {
           return res.status(401).json({ msg: 'Not authorized' });
       }

       res.render('editTrip', { trip });
   } catch (err) {
       res.status(500).json({ msg: 'Server error' });
   }
});


module.exports = router;
