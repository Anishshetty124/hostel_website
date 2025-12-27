const express = require('express');
const router = express.Router();
const { getRooms, createRoom, deleteRoom } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getRooms);
router.post('/', protect, admin, createRoom);
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;