
const { protect, admin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const HostelRecord = require('../models/HostelRecord');

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
        const { roomNumber, fullName, firstName } = req.body;
        if (!roomNumber || !fullName) {
            return res.status(400).json({ message: 'Room number and full name are required.' });
        }
        // Only allow adding to an existing valid room
        const allRooms = await HostelRecord.distinct('roomNumber');
        const validRoomNumbers = allRooms.filter(rn => rn && rn.trim()).map(rn => rn.trim());
        const newRoomNumber = roomNumber.trim();
        if (!validRoomNumbers.includes(newRoomNumber)) {
            return res.status(400).json({ message: 'Invalid room number. You can only add to an existing valid room.' });
        }
        // Enforce max 4 members per room
        const memberCount = await HostelRecord.countDocuments({ roomNumber: newRoomNumber });
        if (memberCount >= 4) {
            return res.status(400).json({ message: 'This room already has 4 members. Cannot add more.' });
        }
        const newMember = new HostelRecord({ roomNumber: newRoomNumber, fullName, firstName });
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

        // Only allow changing to an existing valid room number (from the set of all roomNumbers)
        const allRooms = await HostelRecord.distinct('roomNumber');
        const validRoomNumbers = allRooms.filter(rn => rn && rn.trim()).map(rn => rn.trim());
        const newRoomNumber = req.body.roomNumber && req.body.roomNumber.trim();
        if (newRoomNumber && newRoomNumber !== original.roomNumber) {
            if (!validRoomNumbers.includes(newRoomNumber)) {
                return res.status(400).json({ message: 'Invalid room number. You can only move to an existing valid room.' });
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
        // Handle duplicate key error (unique index violation)
        if (err.code === 11000 && err.keyPattern && err.keyPattern.roomNumber) {
            return res.status(400).json({ message: 'Room number already exists. Please choose a unique room number.' });
        }
        res.status(500).json({ message: err.message || 'Failed to update HostelRecord' });
    }
});


module.exports = router; 