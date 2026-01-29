const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a complaint
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
    const { title, description, roomNumber, category = 'Other', urgency = 'Medium' } = req.body;
    if (!title || !description || !roomNumber) {
        return res.status(400).json({ message: 'Title, description, and room number are required.' });
    }
    try {
        const complaint = await Complaint.create({
            user: req.user._id,
            title: title.trim(),
            description: description.trim(),
            roomNumber: roomNumber.trim(),
            category,
            urgency
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
        if (!req.user) {
            // getMyComplaints: req.user is undefined
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user._id || req.user.id;
        if (!userId) {
            // getMyComplaints: userId is undefined
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const complaints = await Complaint.find({ user: userId })
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        // getMyComplaints error handled
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints (admin)
// @route   GET /api/complaints/admin/all
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user', 'firstName lastName email roomNumber role')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add admin reply
// @route   POST /api/complaints/:id/reply
const replyComplaint = async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Reply message is required.' });
    }
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        complaint.replies.push({
            message: message.trim(),
            by: req.user._id,
            role: req.user.role
        });

        await complaint.save();
        const populated = await complaint.populate('replies.by', 'firstName lastName role');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add user reply (same as admin, but available to owner)
// @route   POST /api/complaints/:id/user-reply
const userReplyComplaint = async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Reply message is required.' });
    }
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        
        // User can only reply to their own complaint
        if (String(complaint.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        complaint.replies.push({
            message: message.trim(),
            by: req.user._id,
            role: 'user'
        });

        await complaint.save();
        const populated = await complaint.populate('replies.by', 'firstName lastName role');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update status
// @route   PATCH /api/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
    const { status } = req.body;
    const allowed = ['Pending', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'firstName lastName email roomNumber role');
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a reply
// @route   DELETE /api/complaints/:id/reply/:replyId
const deleteReply = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const reply = complaint.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        // Check if user is authorized (either admin or reply owner)
        const isAdmin = req.user.role === 'admin';
        const isOwner = String(reply.by) === String(req.user._id);
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this reply' });
        }

        complaint.replies.pull(req.params.replyId);
        await complaint.save();
        
        const populated = await complaint.populate('replies.by', 'firstName lastName role');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a complaint (owner or admin)
// @route   DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const isOwner = String(complaint.user) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this complaint' });
        }

        await complaint.deleteOne();
        return res.json({ message: 'Complaint deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    replyComplaint,
    userReplyComplaint,
    updateComplaintStatus,
    deleteReply,
    deleteComplaint
};