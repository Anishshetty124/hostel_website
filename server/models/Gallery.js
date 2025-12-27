const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    description: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Usually Admin
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);