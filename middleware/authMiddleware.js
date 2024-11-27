const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        console.log('Request Headers:', req.headers); // Logs all headers for debugging

        // Extract Authorization header, query token, or cookie token
        let token = req.header('Authorization');
        if (token) {
            const parts = token.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                console.log('Malformed Authorization header:', token);
                return res.status(401).json({ msg: 'Authorization header is malformed' });
            }
            token = parts[1];
        } else if (req.query.token) {
            token = req.query.token; // Support token in query parameter for convenience
        } else if (req.cookies.token) {
            token = req.cookies.token; // Support token in cookie for convenience
        }

        if (!token) {
            console.log('Token not provided.');
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        console.log('Token extracted:', token);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);

        // Attach user information to the request
        req.user = decoded;
        console.log('User authenticated successfully:', req.user);
        
        next();
    } catch (err) {
        console.error('Error during token verification:', err.message);
        
        // Handle expired token separately for clarity
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        }

        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
