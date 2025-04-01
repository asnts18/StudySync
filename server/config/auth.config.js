// config/auth.config.js
module.exports = {
    secret: process.env.JWT_SECRET || "your-secret-key-for-development",
    expiresIn: 86400 // 24 hours
  };