const express = require('express');

const {
  getMenu,
  getTodayMenu,
  getDayMenu,
  updateMenu,
  getWeeklySchedule,
  setDayMenu,
  adminUpdateMenu,
} = require('../controllers/foodController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMenu);
router.get('/today', getTodayMenu);
router.get('/:day', getDayMenu);
router.post('/', protect, admin, updateMenu);
router.get('/schedule', protect, getWeeklySchedule);
router.post('/day', protect, admin, setDayMenu);
router.post('/admin/update', protect, admin, adminUpdateMenu);

module.exports = router;
