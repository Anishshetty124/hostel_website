// Script to fetch hostel records for a given room number
const mongoose = require('mongoose');
const HostelRecord = require('../models/HostelRecord');

const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // Change to your DB name

async function fetchRoomRecords(roomNumber) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const records = await HostelRecord.find({ roomNumber: String(roomNumber) });
    console.log(`Records for room ${roomNumber}:`, records);
  } catch (err) {
    console.error('Error fetching records:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// Change the room number as needed
fetchRoomRecords(403);
