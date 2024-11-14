const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

const authMiddleware = async (req, res, next) => {
    try {
        // Extract the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('No Authorization header found.');
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Authorization header is malformed:', authHeader);
            return res.status(401).json({ msg: 'Authorization header is malformed' });
        }

        console.log('Token extracted:', token);

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token successfully verified:', decoded);

        // Check if the token is present in the database
        const tokenInDb = await Token.findOne({ token: token });
        if (!tokenInDb) {
            console.log('Token not found in the database.');
            return res.status(401).json({ msg: 'Token is not valid or has been revoked' });
        }

        // Add user information to the request
        req.user = decoded;
        console.log('User authenticated successfully:', req.user);
        next();
    } catch (err) {
        console.error('Error during token verification:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
