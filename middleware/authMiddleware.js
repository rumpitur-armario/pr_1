const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Retrieve the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Extract the token from the 'Bearer <token>' format
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Authorization header is malformed' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded token to the request object
        next(); // Move to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
