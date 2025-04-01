// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../config/auth.config');

exports.signup = async (req, res) => {
  try {
    // 1. Check if user already exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 3. Create the new user
    const newUser = await User.createUser({
      email: req.body.email,
      password: hashedPassword,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      bio: req.body.bio || null,
      university_id: req.body.university_id || null
    });

    // 4. Return success response (without password)
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.signin = async (req, res) => {
  try {
    // 1. Find the user by email
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify the password
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3. Generate a JWT token
    const token = jwt.sign(
      { id: user.user_id },
      authConfig.secret,
      { expiresIn: authConfig.expiresIn }
    );

    // 4. Return user info and token (without password)
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      ...userWithoutPassword,
      accessToken: token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};