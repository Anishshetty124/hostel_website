const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { sendFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', protect, sendFeedback);

module.exports = router;
