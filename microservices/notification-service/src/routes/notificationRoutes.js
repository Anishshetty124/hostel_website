const express = require('express');

const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendPushToUser, sendPushToAll } = require('../utils/pushService');

const router = express.Router();

router.post('/mark-seen', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $and: [{ read: false }, { $or: [{ isPublic: true }, { user: req.user._id }] }],
      },
      { $set: { read: true } }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark notifications as seen' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (!notif.isPublic && notif.user && notif.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notif.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete notification' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ isPublic: true }, { user: req.user._id }],
    }).sort({ createdAt: -1 });

    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch notifications' });
  }
});

router.get('/unseen-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $and: [{ read: false }, { $or: [{ isPublic: true }, { user: req.user._id }] }],
    });

    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch unseen notifications count' });
  }
});

router.post('/send', protect, admin, async (req, res) => {
  try {
    const { type, recipient, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });

    const senderId = req.user?._id;
    const senderName = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Admin';

    if (type === 'public') {
      const notif = new Notification({ title, message, isPublic: true, sender: senderId, senderName, type: 'notice' });
      await notif.save();
      await sendPushToAll({ title, body: message, url: '/notifications', type: 'notice' });
      return res.status(201).json({ success: true, notification: notif });
    }

    if (type === 'private') {
      if (!recipient) return res.status(400).json({ message: 'Recipient required for private message.' });

      const user = await User.findOne({ $or: [{ email: recipient }, { username: recipient }] });
      if (!user) return res.status(404).json({ message: 'Recipient user not found.' });

      const notif = new Notification({
        user: user._id,
        title,
        message,
        isPublic: false,
        sender: senderId,
        senderName,
        type: 'personal',
      });
      await notif.save();
      await sendPushToUser(user._id, { title, body: message, url: '/notifications', type: 'personal' });
      return res.status(201).json({ success: true, notification: notif });
    }

    return res.status(400).json({ message: 'Invalid type.' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to send notification' });
  }
});

router.get('/admin/sent', protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find({ sender: req.user._id })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch sent notifications' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });

    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (notif.sender?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this notification' });
    }

    notif.title = title;
    notif.message = message;
    await notif.save();

    return res.json({ success: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update notification' });
  }
});

router.delete('/:id/admin', protect, admin, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (notif.sender?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notif.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete notification' });
  }
});

module.exports = router;
