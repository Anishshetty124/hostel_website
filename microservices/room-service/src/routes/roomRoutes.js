const express = require('express');

const HostelRecord = require('../models/HostelRecord');
const HostelRecordEdit = require('../models/HostelRecordEdits');
const { protect, admin } = require('../middleware/authMiddleware');
const { createRoom, getRooms, getHostelRecords } = require('../controllers/roomController');

const router = express.Router();

const isAllowedRoomNumber = (room) => {
  const n = parseInt(room, 10);
  if (isNaN(n)) return false;

  return (
    (n >= 1 && n <= 10) ||
    (n >= 101 && n <= 113) ||
    (n >= 201 && n <= 213) ||
    (n >= 301 && n <= 313) ||
    (n >= 401 && n <= 413) ||
    (n >= 501 && n <= 513) ||
    (n >= 601 && n <= 613)
  );
};

router.get('/my-room-members', protect, async (req, res) => {
  try {
    const userRoomNumber = req.user.roomNumber;
    if (!userRoomNumber) {
      return res.status(400).json({ message: 'No room number found for your account.' });
    }

    const members = await HostelRecord.find({ roomNumber: userRoomNumber });
    return res.status(200).json(members);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch room members' });
  }
});

router.delete('/hostelrecords/:id', protect, admin, async (req, res) => {
  try {
    const deleted = await HostelRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Member not found' });
    return res.status(200).json({ message: 'Member deleted', deleted });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete member' });
  }
});

router.post('/hostelrecords', protect, admin, async (req, res) => {
  try {
    let { roomNumber, fullName, firstName } = req.body;
    if (!roomNumber || !fullName) {
      return res.status(400).json({ message: 'Room number and full name are required.' });
    }

    if (!isAllowedRoomNumber(roomNumber)) {
      return res.status(400).json({
        message:
          'Invalid room number. Admin can only add to rooms 1-10, 101-113, 201-213, 301-313, 401-413, 501-513, 601-613.',
      });
    }

    roomNumber = Number(roomNumber);
    const memberCount = await HostelRecord.countDocuments({ roomNumber });
    if (memberCount >= 4) {
      return res.status(400).json({ message: 'This room already has 4 members. You cannot add more than 4 members to a room.' });
    }

    const newMember = new HostelRecord({ roomNumber, fullName, firstName });
    await newMember.save();
    return res.status(201).json(newMember);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to add member' });
  }
});

router.post('/', protect, admin, createRoom);
router.get('/', protect, getRooms);
router.get('/hostelrecords', protect, admin, getHostelRecords);

router.put('/hostelrecords/:id', protect, admin, async (req, res) => {
  try {
    const original = await HostelRecord.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'HostelRecord not found' });

    const newRoomNumber = req.body.roomNumber;
    if (newRoomNumber && String(newRoomNumber) !== String(original.roomNumber)) {
      if (!isAllowedRoomNumber(newRoomNumber)) {
        return res.status(400).json({
          message: 'Invalid room number. Admin can only move to rooms 1-10, 101-113, 201-213, 301-313, 401-413, 501-513, 601-613.',
        });
      }

      const memberCount = await HostelRecord.countDocuments({ roomNumber: Number(newRoomNumber) });
      if (memberCount >= 4) {
        return res.status(400).json({ message: 'This room already has 4 members. Cannot add more.' });
      }
    }

    const edit = new HostelRecordEdit({
      originalId: original._id,
      roomNumber: req.body.roomNumber,
      fullName: req.body.fullName,
      firstName: req.body.firstName,
      editedBy: req.user?._id,
      editedAt: new Date(),
    });
    await edit.save();

    if (newRoomNumber) original.roomNumber = Number(newRoomNumber);
    if (req.body.fullName) original.fullName = req.body.fullName;
    if (req.body.firstName) original.firstName = req.body.firstName;
    await original.save();

    return res.status(200).json({ updated: original, edit });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.roomNumber) {
      return res.status(400).json({ message: 'Room number already exists. Please choose a unique room number.' });
    }

    return res.status(500).json({ message: err.message || 'Failed to update HostelRecord' });
  }
});

module.exports = router;
