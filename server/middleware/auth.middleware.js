// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const User = require('../models/user.model');

exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    
    // Verify token
    jwt.verify(token, authConfig.secret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }
      
      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      
      // Add user ID to request for use in protected routes
      req.userId = decoded.id;
      next();
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};