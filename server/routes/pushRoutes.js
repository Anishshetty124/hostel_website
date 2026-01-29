const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/authMiddleware');

// Save or update push subscription for user
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription data.' });
    }
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, endpoint },
      { user: req.user._id, endpoint, keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to save subscription' });
  }
});

module.exports = router;
