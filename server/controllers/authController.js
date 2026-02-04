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
const { OAuth2Client } = require("google-auth-library");

// Import Models
const User = require("../models/User");
const HostelRecord = require("../models/HostelRecord");

// Initialize Google OAuth Client
const googleClient = new OAuth2Client();

const getGoogleClientIds = () => {
  const raw = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

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

// --- 8. GOOGLE OAUTH - VERIFY TOKEN & GET USER INFO ---
const googleLogin = async (req, res) => {
  try {
    const startTs = Date.now();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required." });
    }

    const audiences = getGoogleClientIds();
    if (audiences.length === 0) {
      console.error("[googleLogin] Missing Google client ID configuration.");
      return res.status(500).json({ message: "Google authentication is not configured." });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: audiences,
    });
    const verifyMs = Date.now() - startTs;

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    if (!email || !given_name) {
      return res.status(400).json({ message: "Invalid Google token data." });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // User doesn't exist - return null to prompt for room number
      return res.status(200).json({
        action: "verify_room",
        googleData: {
          email: email.toLowerCase(),
          firstName: given_name,
          lastName: family_name || "",
          picture: picture,
        },
        message: "User not found. Please enter your room number for verification.",
      });
    }

      console.info(`[googleLogin] verifyIdToken: ${verifyMs}ms`);
    // User exists - generate token and return user data
      console.info(`[googleLogin] failed in ${Date.now() - startTs}ms`);
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      action: "login",
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
    try {
      const parts = (req.body?.token || '').split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.error('[googleLogin] Token aud:', payload?.aud, 'expected:', process.env.GOOGLE_CLIENT_ID);
      }
    } catch {}
    console.error("[googleLogin] Error:", error);
    res.status(400).json({ message: "Google authentication failed." });
  }
};

// --- 9. GOOGLE OAUTH - VERIFY ROOM & CREATE/UPDATE USER ---
const googleVerifyRoom = async (req, res) => {
  try {
    const { email, firstName, lastName, roomNumber, picture } = req.body;

    if (!email || !firstName || !roomNumber) {
      return res.status(400).json({ message: "Email, first name, and room number are required." });
    }

    // Verify room membership in HostelRecord
    const normalizedRoom = roomNumber.trim();
    const queryNumber = parseInt(normalizedRoom, 10);
    const roomMatch = [
      { roomNumber: normalizedRoom },
      { roomNumber: String(normalizedRoom) }
    ];
    if (!Number.isNaN(queryNumber)) {
      roomMatch.push({ roomNumber: queryNumber });
      roomMatch.push({ roomNumber: String(queryNumber) });
    }

    const validHosteller = await HostelRecord.findOne({
      $and: [
        { $or: roomMatch },
        {
          $or: [
            { firstName: { $regex: new RegExp(`^${firstName}$`, "i") } },
            { fullName: { $regex: new RegExp(firstName, "i") } }
          ]
        }
      ]
    });

    if (!validHosteller) {
      return res.status(403).json({
        message: `Verification failed. Room ${roomNumber} does not match name "${firstName}" in our records.`,
      });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user with Google OAuth
      const tempPassword = await bcrypt.hash(`${email}:${Date.now()}`, 10);
      user = new User({
        firstName: firstName.trim(),
        lastName: (lastName || "").trim(),
        email: email.toLowerCase(),
        password: tempPassword,
        roomNumber: roomNumber.trim(),
      });
      await user.save();
    } else {
      // Update existing user with verified room number if needed
      if (!user.roomNumber || user.roomNumber === "Not Assigned") {
        user.roomNumber = roomNumber.trim();
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roomNumber: user.roomNumber,
        role: user.role,
      },
      message: "Google verification successful!",
    });

  } catch (error) {
    console.error("[googleVerifyRoom] Error:", error);
    res.status(500).json({ message: "Internal server error." });
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
  googleLogin,
  googleVerifyRoom,
};