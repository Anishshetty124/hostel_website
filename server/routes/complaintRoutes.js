const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createComplaint, getMyComplaints, getAllComplaints, replyComplaint, userReplyComplaint, updateComplaintStatus, updateComplaintImages, deleteReply, deleteComplaint, uploadComplaintImage } = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', protect, getMyComplaints);
router.post('/', protect, createComplaint);
router.post('/upload', protect, upload.single('file'), uploadComplaintImage);

// Admin endpoints - get before :id routes
router.get('/admin/all', protect, admin, getAllComplaints);

// Specific routes before generic :id routes
router.post('/:id/user-reply', protect, userReplyComplaint);
router.post('/:id/reply', protect, admin, replyComplaint);
router.patch('/:id/status', protect, admin, updateComplaintStatus);
router.delete('/:id/reply/:replyId', protect, deleteReply);

// Generic :id routes last
router.patch('/:id', protect, updateComplaintImages);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;