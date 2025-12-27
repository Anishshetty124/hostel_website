const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
	{
		items: { type: [String], default: [] },
		time: { type: String },
		color: { type: String },
	},
	{ _id: false }
);

const foodMenuSchema = new mongoose.Schema(
	{
		day: { type: String, required: true, unique: true },
		breakfast: { type: mealSchema, default: () => ({ items: [] }) },
		lunch: { type: mealSchema, default: () => ({ items: [] }) },
		snacks: { type: mealSchema, default: () => ({ items: [] }) },
		nightmeal: { type: mealSchema, default: () => ({ items: [] }) },
		dayOrder: { type: Number, default: 8 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('FoodMenu', foodMenuSchema);
