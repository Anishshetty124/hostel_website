
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendPushToUser, sendPushToAll } = require('../utils/pushService');

// Mark all notifications as seen/read for the current user
router.post('/mark-seen', protect, async (req, res) => {
  try {
    // Mark all private notifications for user and all public notifications as read
    await Notification.updateMany(
      {
        $and: [
          { read: false },
          {
            $or: [
              { isPublic: true },
              { user: req.user._id }
            ]
          }
        ]
      },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as seen' });
  }
});

// Delete a notification by ID (user can only delete their own or public notifications)
router.delete('/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    // Only allow delete if public or belongs to user
    if (!notif.isPublic && notif.user && notif.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    await notif.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete notification' });
  }
});

// Get notifications for current user (public + private)
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isPublic: true },
        { user: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch notifications' });
  }
});

// GET unseen notifications count for user
// Unseen notifications count: include both public and private notifications for the user
router.get('/unseen-count', require('../middleware/authMiddleware').protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    // Count unseen: (1) public and not read by user, (2) private and not read
    // For simplicity, treat 'read' as 'seen' (your schema uses 'read')
    const count = await Notification.countDocuments({
      $and: [
        { read: false },
        {
          $or: [
            { isPublic: true },
            { user: req.user._id }
          ]
        }
      ]
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unseen notifications count' });
  }
});

// Admin: send notification (public or private)
router.post('/send', protect, admin, async (req, res) => {
  try {
    const { type, recipient, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });
    const senderId = req.user?._id;
    const senderName = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Admin';
    if (type === 'public') {
      const notif = new Notification({ title, message, isPublic: true, sender: senderId, senderName, type: 'notice' });
      await notif.save();
      // Send push to all
      sendPushToAll({ title, body: message, url: '/notifications' });
      return res.status(201).json({ success: true, notification: notif });
    } else if (type === 'private') {
      if (!recipient) return res.status(400).json({ message: 'Recipient required for private message.' });
      const user = await User.findOne({ $or: [ { email: recipient }, { username: recipient } ] });
      if (!user) return res.status(404).json({ message: 'Recipient user not found.' });
      const notif = new Notification({ user: user._id, title, message, isPublic: false, sender: senderId, senderName, type: 'personal' });
      await notif.save();
      // Send push to user
      sendPushToUser(user._id, { title, body: message, url: '/notifications' });
      return res.status(201).json({ success: true, notification: notif });
    } else {
      return res.status(400).json({ message: 'Invalid type.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send notification' });
  }
});

module.exports = router;
