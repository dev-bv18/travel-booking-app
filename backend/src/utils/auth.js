const jwt = require('jsonwebtoken');

const authenticate = (token) => {
    if (!token) {
        throw new Error('Authentication token is missing');
    }

    try {
        const cleanToken = token.replace('Bearer ', ''); // Remove 'Bearer ' prefix
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        return decoded; // Return decoded JWT payload (user info)
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = { authenticate };
