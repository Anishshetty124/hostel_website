const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('firstName lastName email');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFriend = async (req, res) => {
  const { friendId } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $addToSet: { friends: req.user._id } });

    return res.json({ message: 'Friend Added!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  addFriend,
};
