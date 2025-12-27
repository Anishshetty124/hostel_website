const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
    machineNumber: { type: Number, required: true, unique: true },
    isBusy: { type: Boolean, default: false },
    startTime: { type: Date },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

module.exports = mongoose.model('Laundry', laundrySchema);