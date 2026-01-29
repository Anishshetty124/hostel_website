const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');

// Load VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys are not set in .env');
}

webpush.setVapidDetails(
  'mailto:admin@myhostel.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function sendPushToUser(userId, payload) {
  const subs = await PushSubscription.find({ user: userId });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      // Ignore errors for now (expired, etc.)
    }
  }
}

async function sendPushToAll(payload) {
  const subs = await PushSubscription.find();
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      // Ignore errors for now
    }
  }
}

module.exports = { sendPushToUser, sendPushToAll };
