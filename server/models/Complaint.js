const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Electrical', 'Plumbing', 'Cleaning', 'Other'], default: 'Other' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    images: [{
        mediaUrl: { type: String }, // URL from ImageKit or CDN
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        provider: { type: String, enum: ['imagekit', 'custom'], default: 'imagekit' },
        fileId: { type: String }, // ImageKit file ID for management
        uploadedAt: { type: Date, default: Date.now }
    }],
    replies: [
        {
            message: { type: String, required: true, trim: true },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, trim: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Helpful indexes
complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ roomNumber: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);