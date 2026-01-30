const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// Get or update user's creative notification preference
router.get('/me/creative-notifications', protect, async (req, res) => {
  res.json({ creativeNotifications: req.user.creativeNotifications !== false });
});

router.post('/me/creative-notifications', protect, async (req, res) => {
  const { creativeNotifications } = req.body;
  req.user.creativeNotifications = !!creativeNotifications;
  await req.user.save();
  res.json({ success: true, creativeNotifications: req.user.creativeNotifications });
});

// Admin: get/set global creative notification status (for cron jobs)
let creativeNotificationsEnabled = true;

router.get('/creative/settings', protect, admin, async (req, res) => {
  // Example: return enabled and schedule info
  res.json({
    enabled: creativeNotificationsEnabled,
    schedules: [
      'Breakfast: 8:00',
      'Lunch: 13:00',
      'Snacks: 17:00',
      'Dinner: 20:00',
      'Games: 18:00'
    ]
  });
});

router.post('/creative/settings', protect, admin, async (req, res) => {
  creativeNotificationsEnabled = !!req.body.enabled;
  res.json({ success: true, enabled: creativeNotificationsEnabled });
});

module.exports = router;
