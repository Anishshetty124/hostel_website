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
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordCode: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for first name search (login)
userSchema.index({ firstName: 1 });
// Use module.exports directly. Do NOT use exports.User or { User }
module.exports = mongoose.model('User', userSchema);