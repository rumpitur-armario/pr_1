const mongoose = require('mongoose');

// Destination Schema
const destinationSchema = new mongoose.Schema({
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activities: { type: [String], default: [] } // Destination-specific activities
});

// Custom validation for date range
destinationSchema.pre('validate', function (next) {
    if (this.startDate > this.endDate) {
        next(new Error('Start date must be before end date.'));
    } else {
        next();
    }
});

// Trip Schema
const tripSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tripName: { type: String, required: true },
    destinations: [destinationSchema],
    activities: { type: [String], default: [] }, // Use detailed destination schema
    public: { type: Boolean, default: false }, // Public trip flag
    likes: { type: Number, default: 0 } // Number of likes for the trip
});

// Virtual field to calculate the trip's overall start date
tripSchema.virtual('startDate').get(function () {
    if (this.destinations.length > 0) {
        return this.destinations.reduce(
            (min, dest) => (dest.startDate < min ? dest.startDate : min),
            this.destinations[0].startDate
        );
    }
    return null;
});

// Virtual field to calculate the trip's overall end date
tripSchema.virtual('endDate').get(function () {
    if (this.destinations.length > 0) {
        return this.destinations.reduce(
            (max, dest) => (dest.endDate > max ? dest.endDate : max),
            this.destinations[0].endDate
        );
    }
    return null;
});

// Include virtual fields in JSON and object outputs
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

// Add indexes for better query performance
tripSchema.index({ user: 1 });
tripSchema.index({ public: 1 });

module.exports = mongoose.model('Trip', tripSchema);
