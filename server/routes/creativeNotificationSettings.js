const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Get current user's creative notification setting
router.get('/me/creative-notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('creativeNotifications');
    res.json({ creativeNotifications: user.creativeNotifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch setting' });
  }
});

// Update current user's creative notification setting
router.post('/me/creative-notifications', protect, async (req, res) => {
  try {
    const { creativeNotifications } = req.body;
    await User.findByIdAndUpdate(req.user._id, { creativeNotifications });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update setting' });
  }
});

module.exports = router;
