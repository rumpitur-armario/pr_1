const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

const authMiddleware = async (req, res, next) => {
    try {
        console.log('Request Headers:', req.headers); // Logs all headers for debugging

        // Extract Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('Authorization header not found.');
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Malformed Authorization header:', authHeader);
            return res.status(401).json({ msg: 'Authorization header is malformed' });
        }

        console.log('Token extracted:', token);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);

        const tokenInDb = await Token.findOne({ token: token });
        if (!tokenInDb) {
            console.log('Token not found in the database.');
            return res.status(401).json({ msg: 'Token is not valid or has been revoked' });
        }

        req.user = decoded;
        console.log('User authenticated successfully:', req.user);
        next();
    } catch (err) {
        console.error('Error during token verification:', err.message);
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
