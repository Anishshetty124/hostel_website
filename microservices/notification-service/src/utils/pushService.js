const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys are not set; web push delivery is disabled.');
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@myhostel.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function sendPushToUser(userId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await PushSubscription.find({ user: userId });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      // Ignore expired/invalid subscriptions for now.
    }
  }
}

async function sendPushToAll(payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await PushSubscription.find();
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      // Ignore expired/invalid subscriptions for now.
    }
  }
}

module.exports = { sendPushToUser, sendPushToAll };
