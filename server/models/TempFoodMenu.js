const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
    {
        items: { type: [String], default: [] },
        time: { type: String },
        color: { type: String },
    },
    { _id: false }
);

const TempFoodMenuSchema = new mongoose.Schema({
  date: { type: String, required: true },
  day: { type: String, required: true }, // Add day of week for correct lookup
  menu: {
    breakfast: { type: mealSchema, default: () => ({ items: [] }) },
    lunch: { type: mealSchema, default: () => ({ items: [] }) },
    snacks: { type: mealSchema, default: () => ({ items: [] }) },
    nightmeal: { type: mealSchema, default: () => ({ items: [] }) }
  },
  createdAt: { type: Date, default: Date.now, expires: 604800 } // auto-delete after 7 days
});

module.exports = mongoose.model('TempFoodMenu', TempFoodMenuSchema);