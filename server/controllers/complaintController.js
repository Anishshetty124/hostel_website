const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPushToUser, sendPushToAll } = require('../utils/pushService');

// @desc    Create a complaint
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
    const { title, description, roomNumber, category = 'Other', urgency = 'Medium', images = [] } = req.body;
    if (!title || !description || !roomNumber) {
        return res.status(400).json({ message: 'Title, description, and room number are required.' });
    }
    try {
        // Convert image URLs to image objects with metadata (for backward compatibility, accept both strings and objects)
        const processedImages = Array.isArray(images) ? images.map(img => {
            if (typeof img === 'string') {
                return {
                    mediaUrl: img,
                    type: 'image',
                    provider: 'imagekit',
                    uploadedAt: new Date()
                };
            }
            return img;
        }) : [];

        const complaint = await Complaint.create({
            user: req.user._id,
            title: title.trim(),
            description: description.trim(),
            roomNumber: roomNumber.trim(),
            category,
            urgency,
            images: processedImages
        });
        
        // Emit socket event for new complaint
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:created', complaint);
        }
        
        // Get all admins
        const admins = await User.find({ role: 'admin' });
        
        // Save notification record and send push to each admin
        for (const admin of admins) {
            // Save to notification collection
            await Notification.create({
                user: admin._id,
                title: 'New Complaint',
                message: `${req.user.firstName || 'User'} filed a new complaint: "${complaint.title}" in room ${complaint.roomNumber}`,
                type: 'personal',
                sender: req.user._id,
                senderName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
                isPublic: false
            });
            
            // Send push notification
            await sendPushToUser(admin._id, {
                title: 'New Complaint',
                body: complaint.title,
                icon: '/manifest.json',
                badge: '/manifest.json',
                tag: 'complaint-' + complaint._id,
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: {
                    complaintId: complaint._id,
                    url: '/admin/complaints'
                }
            });
        }
        
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

// @desc    Update complaint images (attach images after creation)
// @route   PATCH /api/complaints/:id
const updateComplaintImages = async (req, res) => {
    const { images } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        
        // Check authorization - user can only update their own complaints
        if (complaint.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Process images to metadata format (same as createComplaint)
        const newImages = (images || []).map(img => {
            if (typeof img === 'string') {
                return {
                    mediaUrl: img,
                    type: 'image',
                    provider: 'imagekit',
                    fileId: img.split('/').pop().split('?')[0],
                    uploadedAt: new Date()
                };
            }
            return img;
        });
        
        // Merge with existing images, avoid duplicates by mediaUrl
        const existingUrls = new Set((complaint.images || []).map(img => 
            typeof img === 'string' ? img : img.mediaUrl
        ));
        const uniqueNewImages = newImages.filter(img => !existingUrls.has(img.mediaUrl));
        
        complaint.images = [...(complaint.images || []), ...uniqueNewImages];
        await complaint.save();
        
        // Populate user info for response
        const populated = await complaint.populate('user', 'firstName lastName email roomNumber role');
        
        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:updated', populated);
        }
        
        res.json(populated);
    } catch (error) {
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
        
        // Emit socket event for new reply
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:updated', populated);
        }
        
        // Save notification record for the user
        await Notification.create({
            user: complaint.user,
            title: 'New Reply to Your Complaint',
            message: `Admin has replied to your complaint: "${complaint.title}"`,
            type: 'personal',
            sender: req.user._id,
            senderName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
            isPublic: false
        });
        
        // Send push notification to complaint owner (user)
        await sendPushToUser(complaint.user, {
            title: 'New Reply to Your Complaint',
            body: 'An admin has replied to your complaint: ' + complaint.title,
            icon: '/manifest.json',
            badge: '/manifest.json',
            tag: 'complaint-reply-' + complaint._id,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
                complaintId: complaint._id,
                url: '/user/complaints'
            }
        });
        
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
        
        // Emit socket event for new reply
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:updated', populated);
        }
        
        // Send push notification to admins and save notification records
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            // Save notification record
            await Notification.create({
                user: admin._id,
                title: 'User Reply to Complaint',
                message: `User has replied to complaint: "${complaint.title}" in room ${complaint.roomNumber}`,
                type: 'personal',
                sender: req.user._id,
                senderName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
                isPublic: false
            });
            
            // Send push notification
            await sendPushToUser(admin._id, {
                title: 'User Reply to Complaint',
                body: 'A user has replied to complaint: ' + complaint.title,
                icon: '/manifest.json',
                badge: '/manifest.json',
                tag: 'complaint-reply-' + complaint._id,
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: {
                    complaintId: complaint._id,
                    url: '/admin/complaints'
                }
            });
        }
        
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
        
        // Emit socket event for status update
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:updated', complaint);
        }
        
        // Save notification record for user
        await Notification.create({
            user: complaint.user,
            title: 'Complaint Status Updated',
            message: `Your complaint "${complaint.title}" is now ${status}`,
            type: 'personal',
            sender: req.user._id,
            senderName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
            isPublic: false
        });
        
        // Send push notification to user about status change
        await sendPushToUser(complaint.user, {
            title: 'Complaint Status Updated',
            body: complaint.title + ' is now ' + status,
            icon: '/manifest.json',
            badge: '/manifest.json',
            tag: 'complaint-status-' + complaint._id,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
                complaintId: complaint._id,
                url: '/user/complaints'
            }
        });
        
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
        
        // Emit socket event for reply deletion
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:updated', populated);
        }
        
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
        
        // Emit socket event for complaint deletion
        const io = req.app.get('io');
        if (io) {
            io.emit('complaint:deleted', req.params.id);
        }
        
        return res.json({ message: 'Complaint deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Upload image for complaint (ImageKit only, no Gallery DB save)
// @route   POST /api/complaints/upload
const uploadComplaintImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const ImageKit = require('imagekit');
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });

        const file = req.file;
        const type = file.mimetype.startsWith('video') ? 'video' : 'image';

        // Upload to ImageKit in complaints folder
        const uploadResponse = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: '/complaints',
        });

        // Return URL and metadata WITHOUT saving to Gallery collection
        res.json({
            url: uploadResponse.url,
            mediaUrl: uploadResponse.url,
            fileId: uploadResponse.fileId,
            type: type,
            provider: 'imagekit'
        });
    } catch (error) {
        console.error('Complaint image upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    replyComplaint,
    userReplyComplaint,
    updateComplaintStatus,
    updateComplaintImages,
    deleteReply,
    deleteComplaint,
    uploadComplaintImage
};