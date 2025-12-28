const express = require('express');
const router = express.Router();
const { register, login, updateEmail, forgotPassword, verifyResetCode, resetPassword, getRoomMembers } = require('../controllers/authController');

// IMPORT MIDDLEWARE
// Ensure this path matches where your middleware file actually is
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', register);
router.post('/login', login);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Room members lookup (public)
router.get('/room-members', getRoomMembers); // accepts ?roomNumber=101

// PROTECT THE ROUTE
router.put('/update-email', protect, updateEmail);

module.exports = router;