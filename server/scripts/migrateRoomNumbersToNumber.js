// Script to migrate all roomNumber fields to numbers in HostelRecord collection
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';
const HostelRecord = require('../models/HostelRecord');

(async () => {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const records = await HostelRecord.find({});
  let updated = 0;
  for (const rec of records) {
    if (typeof rec.roomNumber === 'string' && !isNaN(Number(rec.roomNumber))) {
      rec.roomNumber = Number(rec.roomNumber);
      await rec.save();
      updated++;
      console.log(`Updated _id=${rec._id} to roomNumber=${rec.roomNumber}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} records.`);
  await mongoose.disconnect();
})();
