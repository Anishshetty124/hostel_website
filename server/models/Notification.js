const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for public
  title: { type: String, required: true },
  message: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  senderName: { type: String },
  type: { type: String, enum: ['notice', 'personal', 'food'], default: 'notice' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', notificationSchema);
