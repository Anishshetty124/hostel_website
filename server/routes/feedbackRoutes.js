const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendFeedback } = require('../controllers/feedbackController');

// POST /api/feedback - send feedback email
router.post('/', protect, sendFeedback);

module.exports = router;
