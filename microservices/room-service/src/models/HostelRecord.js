const mongoose = require('mongoose');

const hostelRecordSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

hostelRecordSchema.index({ roomNumber: 1 });
hostelRecordSchema.index({ firstName: 1 });

module.exports = mongoose.model('HostelRecord', hostelRecordSchema, 'hostelrecords');
