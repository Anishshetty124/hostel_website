const express = require('express');
const router = express.Router();
const { register, login, updateEmail } = require('../controllers/authController');

// IMPORT MIDDLEWARE
// Ensure this path matches where your middleware file actually is
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', register);
router.post('/login', login);

// PROTECT THE ROUTE
router.put('/update-email', protect, updateEmail);

module.exports = router;