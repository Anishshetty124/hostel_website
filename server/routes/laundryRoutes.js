const express = require('express');
const router = express.Router();
const { getLaundryStatus, bookMachine } = require('../controllers/laundryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLaundryStatus);
router.post('/book', protect, bookMachine);

module.exports = router;