const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    roomNumber: {
        type: String,
        default: "Not Assigned"
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'warden'],
        default: 'student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for faster queries
userSchema.index({ email: 1 }); // Email lookups (login)
userSchema.index({ firstName: 1 }); // First name search (login)
userSchema.index({ roomNumber: 1 }); // Room queries

// --- THE CRITICAL FIX ---
// Use module.exports directly. Do NOT use exports.User or { User }
module.exports = mongoose.model('User', userSchema);