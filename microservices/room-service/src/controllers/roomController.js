const Room = require('../models/Room');
const HostelRecord = require('../models/HostelRecord');

const createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    return res.status(201).json(savedRoom);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create room' });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json(rooms);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch rooms' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(updatedRoom);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update room' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json({ message: 'Room has been deleted.' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete room' });
  }
};

const getHostelRecords = async (req, res) => {
  try {
    const records = await HostelRecord.find().sort({ roomNumber: 1 });
    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch hostel records' });
  }
};

module.exports = {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getHostelRecords,
};
