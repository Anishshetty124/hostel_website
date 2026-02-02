// --- Helper: Derive first name from a full name while stripping honorifics ---
const getFirstNameFromFullName = (fullName) => {
  const HONORIFICS = [
    'dr.', 'dr', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms', 'prof.', 'prof', 'sir', 'madam', 'shri', 'smt'
  ];
  if (!fullName || typeof fullName !== 'string') return '';
  let s = fullName.trim();
  // Normalize spaces and dots
  s = s.replace(/\s+/g, ' ').trim();
  const parts = s.split(' ');
  // Drop leading honorific tokens
  while (parts.length && HONORIFICS.includes(parts[0].toLowerCase())) {
    parts.shift();
  }
  // First remaining token is the first name
  const first = (parts[0] || '').trim();
  // If first token still ends with a dot (e.g., 'Dr.'), strip it
  return first.replace(/\.$/, '');
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Models
const User = require("../models/User");
const HostelRecord = require("../models/HostelRecord");

// Import Email Service
const getAllUsers = async (req, res) => {
  try {
    const users = await require('../models/User').find({}, 'firstName lastName email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
const { sendPasswordResetOTP, sendWelcomeEmail } = require("../utils/emailService");

// --- 1. REGISTER ---
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roomNumber } = req.body;

    // Basic Validation (make lastName optional)
    if (!firstName || !email || !password || !roomNumber) {
      return res.status(400).json({ message: "First name, email, password and room number are required." });
    }

    // Strict Password Policy
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long, contain 1 capital letter, and 1 special character." 
      });
    }

    // Hostel Verification (The "Gatekeeper")
    const validHosteller = await HostelRecord.findOne({
      roomNumber: roomNumber,
      $or: [
        { firstName: { $regex: new RegExp(`^${firstName}$`, "i") } },
        { fullName: { $regex: new RegExp(firstName, "i") } }
      ]
    });

    if (!validHosteller) {
      return res.status(403).json({ 
        message: `Verification failed. Room ${roomNumber} does not match name "${firstName}" in our records.` 
      });
    }

    // Check Duplicate Email
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash Password & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roomNumber: roomNumber.trim(),
    });

    await newUser.save();

    res.status(201).json({ message: "Verification successful! Account created." });

  } catch (error) {
    // Registration Error handled
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- 2. LOGIN ---
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedIdentifier = identifier.trim();

    // Optimize: Try email first (fastest, uses index), then firstName
    let user = await User.findOne({ email: trimmedIdentifier.toLowerCase() });
    
    if (!user) {
      // Only search by firstName if email didn't match
      const users = await User.find({
        firstName: { $regex: new RegExp(`^${trimmedIdentifier}$`, "i") }
      }).limit(2); // Only get max 2 to detect duplicates

      if (users.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      if (users.length > 1) {
        return res.status(409).json({ message: "Duplicate accounts detected. Please login using your Email." });
      }
      user = users[0];
    }

    // Single password comparison instead of loop
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const validUser = user;

    // Generate Token
    const token = jwt.sign(
      { id: validUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.status(200).json({
      token,
      user: {
        id: validUser._id,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
        email: validUser.email,
        roomNumber: validUser.roomNumber,
        role: validUser.role
      },
    });

  } catch (error) {
    // Login Error handled
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- 3. UPDATE EMAIL ---
const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user?._id || req.user?.id; 

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(409).json({ message: "This email is already in use." });
    }

    // Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email: email },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        roomNumber: updatedUser.roomNumber,
        role: updatedUser.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// --- 4. FORGOT PASSWORD - Request Reset Code ---
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code in user document
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    // Send OTP via email using Resend
    try {
      await sendPasswordResetOTP(user.email, user.firstName, resetCode);
      
      res.status(200).json({ 
        message: "Reset code sent to your email. Please check your inbox.",
        // ONLY FOR DEVELOPMENT - Remove in production
        code: process.env.NODE_ENV === 'development' ? resetCode : undefined
      });
    } catch (emailError) {
      // Email sending failed handled
      
      // If email fails, still let them know but log it
      res.status(200).json({ 
        message: "Reset code generated. Please check your email.",
        // Show code in development if email fails
        code: process.env.NODE_ENV === 'development' ? resetCode : undefined,
        warning: "Email delivery may be delayed. Please try again if you don't receive it."
      });
    }

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- 5. VERIFY RESET CODE ---
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    res.status(200).json({ message: "Code verified successfully." });

  } catch (error) {
    console.error("Verify Code Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- 6. RESET PASSWORD ---
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters, contain 1 capital letter and 1 special character." 
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset fields
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// --- 7. GET ROOM MEMBERS (fetch all members for a room number) ---
const getRoomMembers = async (req, res) => {
  try {
    const { roomNumber } = req.query;
    if (!roomNumber || !roomNumber.trim()) {
      return res.status(400).json({ message: 'Room number is required.' });
    }

    const queryNumber = parseInt(roomNumber, 10);
    const members = await HostelRecord.find({
      $or: [
        { roomNumber: roomNumber },
        { roomNumber: queryNumber },
        { roomNumber: String(roomNumber) }
      ]
    });

    return res.status(200).json(members);
  } catch (error) {
    console.error('[getRoomMembers] Server error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- CRITICAL: EXPORT ALL FUNCTIONS ---
module.exports = {
  register,
  login,
  updateEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getRoomMembers,
  getAllUsers,
};