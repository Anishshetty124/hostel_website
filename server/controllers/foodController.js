// Admin: Update food menu for a specific date (temporary) or all days (permanent)
const TempFoodMenu = require('../models/TempFoodMenu');
const adminUpdateMenu = async (req, res) => {
    const { day, menu } = req.body;
    try {
        // Only update the selected day, using the new meals structure
        if (!day) {
            return res.status(400).json({ success: false, message: 'Missing day for permanent update' });
        }
        const updated = await FoodMenu.findOneAndUpdate(
            { day },
            {
                $set: {
                    meals: {
                        breakfast: menu.breakfast,
                        lunch: menu.lunch,
                        snacks: menu.snacks,
                        nightmeal: menu.nightmeal
                    }
                }
            },
            { new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const FoodMenu = require('../models/FoodMenu');

const getMenu = async (req, res) => {
    try {
        // Check for a temporary menu for today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // Find all temp menus for today (for all days)
        const tempMenus = await TempFoodMenu.find({ date: todayStr });
        const tempMenusByDay = {};
        tempMenus.forEach(tm => {
            if (tm.menu && tm.day) tempMenusByDay[tm.day] = tm.menu;
        });

        // Get all permanent menus
        const menuDocs = await FoodMenu.find();
        const menu = menuDocs.map(doc => ({ day: doc.day, meals: doc.meals }));

        // Merge: if a temp menu exists for a day, use it; else use permanent
        const mergedMenu = menu.map(dayObj => {
            if (tempMenusByDay[dayObj.day]) {
                return { day: dayObj.day, meals: tempMenusByDay[dayObj.day] };
            }
            return dayObj;
        });
        res.json(mergedMenu);
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


// Fetch only today's menu
const getTodayMenu = async (req, res) => {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // Try to find a temp menu for today for any day
        const tempMenus = await TempFoodMenu.find({ date: todayStr });
        const tempMenusByDay = {};
        tempMenus.forEach(tm => {
            if (tm.menu && tm.day) tempMenusByDay[tm.day] = tm.menu;
        });

        // Get permanent menu for today
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const doc = await FoodMenu.findOne({ day: dayName });
        let menu = doc ? { day: doc.day, meals: doc.meals } : null;
        // If temp menu exists for today, use it
        if (tempMenusByDay[dayName]) {
            menu = { day: dayName, meals: tempMenusByDay[dayName] };
        }
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch menu for a specific day (e.g., /api/food/Monday)
const getDayMenu = async (req, res) => {
    try {
        const { day } = req.params;
        if (!day) return res.status(400).json({ message: 'Day is required' });
        // Try to find a temp menu for today for this day
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const tempMenu = await TempFoodMenu.findOne({ date: todayStr, day });
        if (tempMenu && tempMenu.menu) {
            return res.json({ day, meals: tempMenu.menu });
        }
        // Fallback to permanent menu
        const doc = await FoodMenu.findOne({ day });
        if (doc) {
            return res.json({ day: doc.day, meals: doc.meals });
        }
        res.status(404).json({ message: 'Menu not found for this day' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenu,
    getTodayMenu,
    getDayMenu,
    updateMenu,
    setDayMenu,
    getWeeklySchedule,
    adminUpdateMenu,
};