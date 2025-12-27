const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Models
const User = require("../models/User");
const HostelRecord = require("../models/HostelRecord");

// --- 1. REGISTER ---
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roomNumber } = req.body;

    // Basic Validation
    if (!firstName || !lastName || !email || !password || !roomNumber) {
      return res.status(400).json({ message: "All fields are required." });
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
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roomNumber: roomNumber.trim(),
    });

    await newUser.save();
    res.status(201).json({ message: "Verification successful! Account created." });

  } catch (error) {
    console.error("Registration Error:", error);
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
        roomNumber: validUser.roomNumber
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
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

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// --- CRITICAL: EXPORT ALL FUNCTIONS ---
module.exports = {
  register,
  login,
  updateEmail
};