const User = require('../models/User');

// @desc    Get all users (to find friends)
// @route   GET /api/games/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('name email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Friend Request (Simplified: Instant Add for prototype)
// @route   POST /api/games/add-friend
const addFriend = async (req, res) => {
    const { friendId } = req.body;
    try {
        // Add to my list
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friendId } });
        // Add me to their list
        await User.findByIdAndUpdate(friendId, { $addToSet: { friends: req.user._id } });
        
        res.json({ message: 'Friend Added!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    addFriend
};