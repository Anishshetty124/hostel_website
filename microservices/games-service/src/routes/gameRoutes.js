const express = require('express');

const { getUsers, addFriend } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', protect, getUsers);
router.post('/add-friend', protect, addFriend);

module.exports = router;
