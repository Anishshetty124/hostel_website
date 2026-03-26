const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const HostelRecord = require('../models/HostelRecord');
const { sendPasswordResetOTP } = require('../utils/emailService');

const googleClient = new OAuth2Client();

const getGoogleClientIds = () => {
  const raw = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roomNumber } = req.body;

    if (!firstName || !email || !password || !roomNumber) {
      return res.status(400).json({ message: 'First name, email, password and room number are required.' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long, contain 1 capital letter, and 1 special character.',
      });
    }

    const roomNumberAsNumber = Number(roomNumber);
    const validHosteller = await HostelRecord.findOne({
      roomNumber: Number.isNaN(roomNumberAsNumber) ? roomNumber : roomNumberAsNumber,
      $or: [
        { firstName: { $regex: new RegExp(`^${firstName}$`, 'i') } },
        { fullName: { $regex: new RegExp(firstName, 'i') } },
      ],
    });

    if (!validHosteller) {
      return res.status(403).json({
        message: `Verification failed. Room ${roomNumber} does not match name "${firstName}" in our records.`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: (lastName || '').trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roomNumber: String(roomNumber).trim(),
    });

    await newUser.save();

    return res.status(201).json({ message: 'Verification successful! Account created.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const trimmedIdentifier = identifier.trim();
    let user = await User.findOne({ email: trimmedIdentifier.toLowerCase() });

    if (!user) {
      const users = await User.find({ firstName: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') } }).limit(2);

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      if (users.length > 1) {
        return res.status(409).json({ message: 'Duplicate accounts detected. Please login using your Email.' });
      }

      user = users[0];
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roomNumber: user.roomNumber,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(409).json({ message: 'This email is already in use.' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { email }, { new: true, runValidators: true }).select('-password');

    return res.status(200).json({
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        roomNumber: updatedUser.roomNumber,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating profile.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    try {
      await sendPasswordResetOTP(user.email, user.firstName, resetCode);
      return res.status(200).json({
        message: 'Reset code sent to your email. Please check your inbox.',
        code: process.env.NODE_ENV === 'development' ? resetCode : undefined,
      });
    } catch (emailError) {
      return res.status(200).json({
        message: 'Reset code generated. Please check your email.',
        code: process.env.NODE_ENV === 'development' ? resetCode : undefined,
        warning: "Email delivery may be delayed. Please try again if you don't receive it.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    return res.status(200).json({ message: 'Code verified successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters, contain 1 capital letter and 1 special character.',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const { roomNumber } = req.query;
    if (!roomNumber || !roomNumber.trim()) {
      return res.status(400).json({ message: 'Room number is required.' });
    }

    const queryNumber = parseInt(roomNumber, 10);
    const members = await HostelRecord.find({
      $or: [{ roomNumber }, { roomNumber: queryNumber }, { roomNumber: String(roomNumber) }],
    });

    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName email');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required.' });
    }

    const audiences = getGoogleClientIds();
    if (audiences.length === 0) {
      return res.status(500).json({ message: 'Google authentication is not configured.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: audiences,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    if (!email || !given_name) {
      return res.status(400).json({ message: 'Invalid Google token data.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        action: 'verify_room',
        googleData: {
          email: email.toLowerCase(),
          firstName: given_name,
          lastName: family_name || '',
          picture,
        },
        message: 'User not found. Please enter your room number for verification.',
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      action: 'login',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roomNumber: user.roomNumber,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Google authentication failed.' });
  }
};

const googleVerifyRoom = async (req, res) => {
  try {
    const { email, firstName, lastName, roomNumber } = req.body;

    if (!email || !firstName || !roomNumber) {
      return res.status(400).json({ message: 'Email, first name, and room number are required.' });
    }

    const normalizedRoom = roomNumber.trim();
    const queryNumber = parseInt(normalizedRoom, 10);
    const roomMatch = [{ roomNumber: normalizedRoom }, { roomNumber: String(normalizedRoom) }];
    if (!Number.isNaN(queryNumber)) {
      roomMatch.push({ roomNumber: queryNumber });
      roomMatch.push({ roomNumber: String(queryNumber) });
    }

    const validHosteller = await HostelRecord.findOne({
      $and: [
        { $or: roomMatch },
        {
          $or: [
            { firstName: { $regex: new RegExp(`^${firstName}$`, 'i') } },
            { fullName: { $regex: new RegExp(firstName, 'i') } },
          ],
        },
      ],
    });

    if (!validHosteller) {
      return res.status(403).json({
        message: `Verification failed. Room ${roomNumber} does not match name "${firstName}" in our records.`,
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const tempPassword = await bcrypt.hash(`${email}:${Date.now()}`, 10);
      user = new User({
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        email: email.toLowerCase(),
        password: tempPassword,
        roomNumber: roomNumber.trim(),
      });
      await user.save();
    } else if (!user.roomNumber || user.roomNumber === 'Not Assigned') {
      user.roomNumber = roomNumber.trim();
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roomNumber: user.roomNumber,
        role: user.role,
      },
      message: 'Google verification successful!',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  updateEmail,
  getRoomMembers,
  getAllUsers,
  googleLogin,
  googleVerifyRoom,
};
