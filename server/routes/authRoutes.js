const express = require('express');
const router = express.Router();

const { register, login, forgotPassword, verifyResetCode, resetPassword, updateEmail, updatePassword, getRoomMembers, getAllUsers, googleLogin, googleVerifyRoom } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Google OAuth Routes
router.post('/google-login', googleLogin);
router.post('/google-verify-room', googleVerifyRoom);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Room members lookup (public)
// Admin: Get all users for suggestions/autocomplete
router.get('/users/all', protect, admin, getAllUsers);
router.get('/room-members', getRoomMembers); // accepts ?roomNumber=101

// PROTECT THE ROUTE
router.put('/update-email', protect, updateEmail);

module.exports = router;