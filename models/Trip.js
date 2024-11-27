const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    city: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activities: [String]
});

const tripSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripName: { type: String, required: true },
    destinations: [{ city: String, country: String }],
    startDate: Date,
    endDate: Date,
    activities: [String],
});

module.exports = mongoose.model('Trip', tripSchema);
