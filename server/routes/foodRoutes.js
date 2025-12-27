const express = require('express');
const router = express.Router();
const { getMenu, updateMenu } = require('../controllers/foodController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getMenu);
router.post('/', protect, admin, updateMenu);

module.exports = router;