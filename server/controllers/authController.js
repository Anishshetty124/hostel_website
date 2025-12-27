const User = require('../models/User');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { name, email, password, roomNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Logic to verify room (simplified for now)
        let isHostelMember = false;
        let assignedFloor = null;
        
        if (roomNumber) {
            // Check if room exists in DB
            const room = await Room.findOne({ roomNumber });
            if (room) {
                isHostelMember = true;
                assignedFloor = room.floor;
                // Add user to room
                await Room.findByIdAndUpdate(room._id, { $push: { occupants: room._id } });
            }
        }

        const user = await User.create({
            name, email, password, 
            roomNumber, floor: assignedFloor, isHostelMember
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roomNumber: user.roomNumber,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};