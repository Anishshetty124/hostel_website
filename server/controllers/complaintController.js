const Complaint = require('../models/Complaint');

// @desc    Create a complaint
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
    const { title, description } = req.body;
    try {
        const complaint = await Complaint.create({
            user: req.user._id,
            title,
            description
        });
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my complaints
// @route   GET /api/complaints
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints
};