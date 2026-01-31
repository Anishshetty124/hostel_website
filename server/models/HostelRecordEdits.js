const mongoose = require('mongoose');

const hostelRecordEditSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'HostelRecord' },
  roomNumber: { type: Number, required: true },
  fullName: { type: String, required: true },
  firstName: { type: String },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HostelRecordEdit', hostelRecordEditSchema);
