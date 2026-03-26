const express = require('express');
const multer = require('multer');

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  replyComplaint,
  userReplyComplaint,
  updateComplaintStatus,
  updateComplaintImages,
  deleteReply,
  deleteComplaint,
  uploadComplaintImage,
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', protect, getMyComplaints);
router.post('/', protect, createComplaint);
router.post('/upload', protect, upload.single('file'), uploadComplaintImage);

router.get('/admin/all', protect, admin, getAllComplaints);

router.post('/:id/user-reply', protect, userReplyComplaint);
router.post('/:id/reply', protect, admin, replyComplaint);
router.patch('/:id/status', protect, admin, updateComplaintStatus);
router.delete('/:id/reply/:replyId', protect, deleteReply);

router.patch('/:id', protect, updateComplaintImages);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
