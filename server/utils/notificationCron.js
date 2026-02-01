const cron = require('node-cron');
const Notification = require('../models/Notification');
const FoodMenu = require('../models/FoodMenu');
const { sendPushToAll } = require('../utils/pushService');

// Helper to generate creative messages
function creativeFoodMessage(meal, items) {
  const templates = [
    `Hungry for ${meal}? Today's menu: ${items}. Don't miss out!`,
    `It's ${meal} time! Enjoy ${items} in the mess today.`,
    `Craving something delicious? ${meal} menu: ${items}. Bon appétit!`,
    `Your ${meal} is ready: ${items}. Come and enjoy!`,
    `Today's ${meal} special: ${items}. See you in the mess!`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function creativeGameMessage() {
  const templates = [
    "Feeling lucky? Try your hand at Connect Four or 2048 in the Game Arena!",
    "Take a break and challenge your friends in our hostel games section!",
    "Game time! Can you beat the high score in Minesweeper or Memory Match?",
    "Unwind with a quick game—visit the Game Room now!",
    "Don't forget: Games are waiting for you. Play, compete, and have fun!"
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Schedule times (24h format): breakfast 8:00, lunch 13:00, snacks 17:00, dinner 20:00
const mealTimes = [
  { meal: 'breakfast', cron: '0 8 * * *' },
  { meal: 'lunch', cron: '0 13 * * *' },
  { meal: 'snacks', cron: '0 17 * * *' },
  { meal: 'dinner', cron: '0 20 * * *' }
];

mealTimes.forEach(({ meal, cron: cronTime }) => {
  cron.schedule(cronTime, async () => {
    try {
      // Get today's menu for the meal
      const today = new Date();
      const day = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const menuDoc = await FoodMenu.findOne({ day });
      let items = menuDoc && menuDoc[meal] ? menuDoc[meal].join(', ') : 'Check the mess for today\'s menu!';
      const message = creativeFoodMessage(meal, items);
      // Save notification in DB
      const notif = new Notification({ title: `${meal.charAt(0).toUpperCase() + meal.slice(1)} Menu`, message, isPublic: true, type: 'food' });
      await notif.save();
      // Send push to all
      sendPushToAll({ title: notif.title, body: message, url: '/user/food-menu', type: 'food' });
      console.log(`[CRON] Sent ${meal} notification to all users.`);
    } catch (err) {
      console.error(`[CRON] Failed to send ${meal} notification:`, err.message);
    }
  });
});

// Game notification every day at 18:00
cron.schedule('0 18 * * *', async () => {
  try {
    const message = creativeGameMessage();
    const notif = new Notification({ title: 'Game Time!', message, isPublic: true, type: 'notice' });
    await notif.save();
    sendPushToAll({ title: notif.title, body: message, url: '/user/game-arena', type: 'notice' });
    console.log('[CRON] Sent game notification to all users.');
  } catch (err) {
    console.error('[CRON] Failed to send game notification:', err.message);
  }
});

module.exports = {};
