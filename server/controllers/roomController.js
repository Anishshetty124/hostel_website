const Room = require('../models/Room'); // Ensure you have this model

// 1. Create Room (Admin Only)
const createRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 2. Get All Rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json(err);
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
        res.status(200).json(updatedRoom);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 4. Delete Room
const deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json("Room has been deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
};

// --- CRITICAL FIX: EXPORT ALL FUNCTIONS HERE ---
module.exports = {
    createRoom,
    getRooms,
    updateRoom,
    deleteRoom
};