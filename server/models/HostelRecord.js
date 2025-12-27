const mongoose = require('mongoose');

const hostelRecordSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true, // Ensures one record per room
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  // You might have other fields like block, floor, etc.
}, { timestamps: true });

// Add index for faster verification queries
hostelRecordSchema.index({ roomNumber: 1 });
hostelRecordSchema.index({ firstName: 1 });

// --- THE CRITICAL FIX ---
// Do NOT use: export const HostelRecord = ...
// Do NOT use: exports.HostelRecord = ...
module.exports = mongoose.model('HostelRecord', hostelRecordSchema);