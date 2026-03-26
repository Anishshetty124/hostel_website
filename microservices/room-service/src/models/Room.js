const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number },
    floor: { type: Number },
    block: { type: String },
    capacity: { type: Number, default: 4 },
    currentOccupancy: { type: Number, default: 0 },
    status: { type: String, default: 'available' },
  },
  { timestamps: true, strict: false }
);

roomSchema.index({ roomNumber: 1 });

module.exports = mongoose.model('Room', roomSchema);
