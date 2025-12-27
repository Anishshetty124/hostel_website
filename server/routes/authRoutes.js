const express = require('express');
const router = express.Router();
const { register, login, updateEmail, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/authController');

// IMPORT MIDDLEWARE
// Ensure this path matches where your middleware file actually is
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', register);
router.post('/login', login);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// PROTECT THE ROUTE
router.put('/update-email', protect, updateEmail);

module.exports = router;