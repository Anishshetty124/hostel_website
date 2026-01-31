
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const HostelRecord = require('../models/HostelRecord');

// GET: Members for the logged-in user's room (user access)
router.get('/my-room-members', protect, async (req, res) => {
    try {
        // Assume user's roomNumber is stored in req.user.roomNumber
        const userRoomNumber = req.user.roomNumber;
        if (!userRoomNumber) {
            return res.status(400).json({ message: 'No room number found for your account.' });
        }
        const members = await HostelRecord.find({ roomNumber: userRoomNumber });
        res.status(200).json(members);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch room members' });
    }
});

// DELETE: Remove a member (delete HostelRecord by id)
router.delete('/hostelrecords/:id', protect, admin, async (req, res) => {
    try {
        const deleted = await HostelRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json({ message: 'Member deleted', deleted });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to delete member' });
    }
});

// POST: Add a new member (create HostelRecord, enforce max 4 per room and valid room)
router.post('/hostelrecords', protect, admin, async (req, res) => {
    try {
        let { roomNumber, fullName, firstName } = req.body;
        if (!roomNumber || !fullName) {
            return res.status(400).json({ message: 'Room number and full name are required.' });
        }
        // Only allow adding to allowed admin ranges
        function isAllowedRoomNumber(room) {
            const n = parseInt(room, 10);
            if (isNaN(n)) return false;
            if ((n >= 1 && n <= 10) ||
                (n >= 101 && n <= 113) ||
                (n >= 201 && n <= 213) ||
                (n >= 301 && n <= 313) ||
                (n >= 401 && n <= 413) ||
                (n >= 501 && n <= 513) ||
                (n >= 601 && n <= 613)) {
                return true;
            }
            return false;
        }
        if (!isAllowedRoomNumber(roomNumber)) {
            return res.status(400).json({ message: 'Invalid room number. Admin can only add to rooms 1-10, 101-113, 201-213, 301-313, 401-413, 501-513, 601-613.' });
        }
        // Enforce max 4 members per room
        roomNumber = Number(roomNumber);
        const memberCount = await HostelRecord.countDocuments({ roomNumber });
        if (memberCount >= 4) {
            return res.status(400).json({ message: 'This room already has 4 members. You cannot add more than 4 members to a room.' });
        }
        const newMember = new HostelRecord({ roomNumber, fullName, firstName });
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to add member' });
    }
});
const HostelRecordEdit = require('../models/HostelRecordEdits');

// 1. Import from Controller
const { 
    createRoom, 
    getRooms, 
    updateRoom, 
    deleteRoom,
    getHostelRecords,
    getRoomMembers,
    removeMemberFromRoom,
    addMemberToRoom,
    updateRoomDetails,
    getAllRoomDocuments
} = require('../controllers/roomController');


// 3. Define Routes
// CREATE: Post new room
router.post('/', protect, admin, createRoom); 

// GET: All rooms grouped by floor
router.get('/', protect, getRooms);

// GET: All Room documents from database (admin management)

// GET: All HostelRecord entries (for room numbers from HostelRecord)
router.get('/hostelrecords', protect, admin, getHostelRecords);

// GET: Members for a specific room

// POST: Add member to room

// DELETE: Remove member from room

// PUT: Update room details

// PUT: Update room by ID

// DELETE: Delete room by ID

// PUT: Update a HostelRecord by ID (add edit entry instead of updating original)

// PUT: Update a HostelRecord by ID (update main + log edit)
router.put('/hostelrecords/:id', protect, admin, async (req, res) => {
    try {
        const original = await HostelRecord.findById(req.params.id);
        if (!original) return res.status(404).json({ message: 'HostelRecord not found' });

        // Only allow changing to a valid room number in the allowed admin range
        const newRoomNumber = req.body.roomNumber;
        function isAllowedRoomNumber(room) {
            // Allowed ranges: 1-10, 101-113, 201-213, 301-313, 401-413, 501-513, 601-613
            const n = parseInt(room, 10);
            if (isNaN(n)) return false;
            if ((n >= 1 && n <= 10) ||
                (n >= 101 && n <= 113) ||
                (n >= 201 && n <= 213) ||
                (n >= 301 && n <= 313) ||
                (n >= 401 && n <= 413) ||
                (n >= 501 && n <= 513) ||
                (n >= 601 && n <= 613)) {
                return true;
            }
            return false;
        }
        if (newRoomNumber && newRoomNumber !== original.roomNumber) {
            if (!isAllowedRoomNumber(newRoomNumber)) {
                return res.status(400).json({ message: 'Invalid room number. Admin can only move to rooms 1-10, 101-113, 201-213, 301-313, 401-413, 501-513, 601-613.' });
            }
            // Enforce max 4 members per room
            const memberCount = await HostelRecord.countDocuments({ roomNumber: newRoomNumber });
            if (memberCount >= 4) {
                return res.status(400).json({ message: 'This room already has 4 members. Cannot add more.' });
            }
        }

        // Save edit log
        const edit = new HostelRecordEdit({
            originalId: original._id,
            roomNumber: req.body.roomNumber,
            fullName: req.body.fullName,
            firstName: req.body.firstName,
            editedBy: req.user?._id,
            editedAt: new Date()
        });
        await edit.save();

        // Update the main HostelRecord
        if (newRoomNumber) original.roomNumber = newRoomNumber;
        if (req.body.fullName) original.fullName = req.body.fullName;
        if (req.body.firstName) original.firstName = req.body.firstName;
        await original.save();

        res.status(200).json({ updated: original, edit });
    } catch (err) {
        // Log the error for debugging
        console.log('PUT /hostelrecords/:id error:', err);
        // Handle duplicate key error (unique index violation)
        if (err.code === 11000 && err.keyPattern && err.keyPattern.roomNumber) {
            return res.status(400).json({ message: 'Room number already exists. Please choose a unique room number.' });
        }
        res.status(500).json({ message: err.message || 'Failed to update HostelRecord' });
    }
});


module.exports = router;