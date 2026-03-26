const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@myhostel.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn('VAPID keys are not set; push delivery is disabled in complaint-service.');
}

async function sendPushToUser(userId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await PushSubscription.find({ user: userId });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      // Ignore invalid/expired subscriptions.
    }
  }
}

module.exports = { sendPushToUser };
