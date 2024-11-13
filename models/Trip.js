const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   destination: { type: String, required: true },
   startDate: { type: Date, required: true },
   endDate: { type: Date, required: true },
   activities: [String],  // Array of activities for the trip
});

module.exports = mongoose.model('Trip', tripSchema);
