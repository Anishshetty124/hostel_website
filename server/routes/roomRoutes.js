const express = require('express');
const router = express.Router();

// 1. Import from Controller
const { 
    createRoom, 
    getRooms, 
    updateRoom, 
    deleteRoom,
    getHostelRecords
} = require('../controllers/roomController');

// 2. Import Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// 3. Define Routes
// CHECK LINE 14 (This was likely where your error was)
router.post('/', protect, admin, createRoom); 

router.get('/', protect, getRooms);

router.put('/:id', protect, admin, updateRoom);

router.delete('/:id', protect, admin, deleteRoom);

// Admin: view hostel records (authoritative room details)
router.get('/records/all', protect, admin, getHostelRecords);

module.exports = router; 