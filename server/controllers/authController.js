// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../config/auth.config');

exports.signup = async (req, res) => {
  try {
    // Instead of multiple queries and validations
    const userData = {
      email: req.body.email,
      password: req.body.password, // This should already be hashed
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      bio: req.body.bio || null,
      university_id: req.body.university_id || null
    };
    
    // Call the stored procedure
    const result = await db.callProcedure('sp_RegisterUser', [
      userData.email,
      userData.password,
      userData.first_name,
      userData.last_name,
      userData.bio,
      userData.university_id
    ]);
    
    // Check if registration was successful
    if (!result || !result[0] || !result[0].user_id) {
      throw new Error('Registration failed');
    }
    
    // Return success response
    res.status(201).json({
      message: "User registered successfully",
      user_id: result[0].user_id
    });
  } catch (err) {
    // Error handling
    console.error("Registration error:", err);
    
    // Check for specific error message from the procedure
    const errorMessage = err.message.includes('User with this email already exists') 
      ? 'Email is already in use' 
      : 'Server error during registration';
    
    res.status(400).json({ message: errorMessage });
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