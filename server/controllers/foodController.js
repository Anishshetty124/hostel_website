const FoodMenu = require('../models/FoodMenu');

exports.getMenu = async (req, res) => {
    try {
        const sorter = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
        const menu = await FoodMenu.find({});
        menu.sort((a, b) => sorter[a.day] - sorter[b.day]);
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    const { day, breakfast, lunch, dinner } = req.body;
    try {
        const updatedMenu = await FoodMenu.findOneAndUpdate(
            { day }, 
            { breakfast, lunch, dinner },
            { new: true, upsert: true }
        );
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};