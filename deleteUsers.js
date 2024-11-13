const mongoose = require('mongoose');
const User = require('./models/User'); // Assuming User model is in `models/User.js`

// Replace with your MongoDB URI
const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.rynva.mongodb.net/";

const deleteAllUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Delete all users
        const result = await User.deleteMany({});
        console.log(`${result.deletedCount} users deleted successfully`);

        // Close the connection
        mongoose.connection.close();
    } catch (err) {
        console.error('Error deleting users:', err.message);
        mongoose.connection.close();
    }
};

deleteAllUsers();
