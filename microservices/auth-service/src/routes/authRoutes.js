const express = require('express');

const {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  updateEmail,
  getRoomMembers,
  getAllUsers,
  googleLogin,
  googleVerifyRoom,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/google-login', googleLogin);
router.post('/google-verify-room', googleVerifyRoom);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

router.get('/users/all', protect, admin, getAllUsers);
router.get('/room-members', getRoomMembers);

router.put('/update-email', protect, updateEmail);

module.exports = router;
