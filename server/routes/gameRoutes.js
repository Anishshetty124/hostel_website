const express = require('express');
const router = express.Router();
const { getUsers, addFriend } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.get('/users', protect, getUsers);
router.post('/add-friend', protect, addFriend);

module.exports = router;