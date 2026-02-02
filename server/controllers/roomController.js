const Room = require('../models/Room'); // Ensure you have this model
const HostelRecord = require('../models/HostelRecord');

// 1. Create Room (Admin Only)
const createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (err) {
        console.error('[createRoom] Error:', err);
        res.status(500).json({ message: err.message || 'Failed to create room' });
    }
};

// 2. Get All Rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        console.error('[getRooms] Error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch rooms' });
    }
};

// 3. Update Room
const updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(updatedRoom);
    } catch (err) {
        console.error('[updateRoom] Error:', err);
        res.status(500).json({ message: err.message || 'Failed to update room' });
    }
};

// 4. Delete Room
const deleteRoom = async (req, res) => {
    try {
        const deleted = await Room.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room has been deleted.' });
    } catch (err) {
        console.error('[deleteRoom] Error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete room' });
    }
};

// --- Only export implemented controllers ---
module.exports = {
    createRoom,
    getRooms,
    updateRoom,
    deleteRoom,
    getHostelRecords: async (req, res) => {
        try {
            const records = await HostelRecord.find().sort({ roomNumber: 1 });
            res.status(200).json(records);
        } catch (err) {
            console.error('[getHostelRecords] Error:', err);
            res.status(500).json({ message: err.message || 'Failed to fetch hostel records' });
        }
    }
};