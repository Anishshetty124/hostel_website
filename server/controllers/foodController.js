const FoodMenu = require('../models/FoodMenu');

const getMenu = async (req, res) => {
    try {
        // Sort in database using aggregation pipeline (much faster)
        const menu = await FoodMenu.aggregate([
            {
                $addFields: {
                    dayOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$day", "Monday"] }, then: 1 },
                                { case: { $eq: ["$day", "Tuesday"] }, then: 2 },
                                { case: { $eq: ["$day", "Wednesday"] }, then: 3 },
                                { case: { $eq: ["$day", "Thursday"] }, then: 4 },
                                { case: { $eq: ["$day", "Friday"] }, then: 5 },
                                { case: { $eq: ["$day", "Saturday"] }, then: 6 },
                                { case: { $eq: ["$day", "Sunday"] }, then: 7 }
                            ],
                            default: 8
                        }
                    }
                }
            },
            { $sort: { dayOrder: 1 } },
            { $project: { dayOrder: 0 } }
        ]);
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMenu = async (req, res) => {
    const { day, breakfast, lunch, dinner, snacks, nightmeal } = req.body;
    try {
        const update = {
            ...(breakfast !== undefined && { breakfast }),
            ...(lunch !== undefined && { lunch }),
            ...(snacks !== undefined && { snacks }),
            ...(nightmeal !== undefined && { nightmeal }),
            // Backward compatibility: map 'dinner' to 'nightmeal'
            ...(dinner !== undefined && { nightmeal: dinner }),
        };
        const updatedMenu = await FoodMenu.findOneAndUpdate(
            { day }, 
            update,
            { new: true, upsert: true }
        );
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const setDayMenu = async (req, res) => {
    try {
        const { day, breakfast, lunch, snacks, nightmeal } = req.body;
        const updatedMenu = await FoodMenu.findOneAndUpdate(
            { day },
            {
                $set: {
                    ...(breakfast !== undefined && { breakfast }),
                    ...(lunch !== undefined && { lunch }),
                    ...(snacks !== undefined && { snacks }),
                    ...(nightmeal !== undefined && { nightmeal }),
                    dayOrder: dayWeights[day] || 8,
                },
            },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: updatedMenu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWeeklySchedule = async (req, res) => {
    try {
        const schedule = await FoodMenu.find().sort({ dayOrder: 1 });
        res.status(200).json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMenu,
    updateMenu,
    setDayMenu,
    getWeeklySchedule,
};