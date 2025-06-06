// server/controllers/userController.js
const userService = require('../services/userService');

const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Assuming req.user is set by auth middleware
    const userProfile = await userService.getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error in getProfile controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // Assuming req.user is set by auth middleware
    const updatedProfile = await userService.updateUserProfile(userId, req.body);
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserMetrics = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching metrics for user ID:", userId);
    
    // Call the service method
    const metrics = await userService.getUserMetrics(userId);
    console.log("Retrieved metrics:", metrics);
    
    // Send the response
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in getUserMetrics controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserMetrics
};