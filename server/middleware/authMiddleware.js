const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set. Please configure it in your environment.');
    process.exit(1);
}

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find User with lean() for better performance (returns plain JS object)
            req.user = await User.findById(decoded.id || decoded._id).select('-password').lean();

            if (!req.user) {
                return res.status(401).json({ message: 'User not found with this token' });
            }

            next();
        } catch (error) {
            console.error('[authMiddleware] Token verification failed:', error?.message || error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(401).json({ message: 'Not authorized as admin' });
};

module.exports = { protect, admin };