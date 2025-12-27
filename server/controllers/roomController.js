const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('occupants', 'name email').sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRoom = async (req, res) => {
    const { roomNumber, floor, capacity } = req.body;
    try {
        const roomExists = await Room.findOne({ roomNumber });
        if (roomExists) return res.status(400).json({ message: 'Room already exists' });
        const room = await Room.create({ roomNumber, floor, capacity: capacity || 3 });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};