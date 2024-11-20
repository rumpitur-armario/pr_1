const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    destination: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    startDate: Date,
    endDate: Date,
    activities: [String]
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
