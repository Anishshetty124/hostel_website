const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyComplaints);
router.post('/', protect, createComplaint);

module.exports = router;