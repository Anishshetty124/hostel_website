const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints, getAllComplaints, replyComplaint, userReplyComplaint, updateComplaintStatus, deleteReply, deleteComplaint } = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getMyComplaints);
router.post('/', protect, createComplaint);
router.delete('/:id', protect, deleteComplaint);

// User replies to their own complaint
router.post('/:id/user-reply', protect, userReplyComplaint);

// Delete reply (both user and admin can delete their own replies)
router.delete('/:id/reply/:replyId', protect, deleteReply);

// Admin endpoints
router.get('/admin/all', protect, admin, getAllComplaints);
router.post('/:id/reply', protect, admin, replyComplaint);
router.patch('/:id/status', protect, admin, updateComplaintStatus);

module.exports = router;