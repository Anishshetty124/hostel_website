const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    // New unified fields
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String },
    title: { type: String },
    category: { type: String, default: 'Hostel' },

    // Backward-compatible legacy fields
    imageUrl: { type: String },
    description: { type: String },

    provider: { type: String, enum: ['imagekit', 'legacy', 'custom'], default: 'imagekit' },
    fileId: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hash: { type: String, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);