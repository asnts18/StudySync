// controllers/userController.js
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

// TODO 
const getProfileWithAchievements = async (req, res) => {
  try {
    const userId = req.userId;
    const fullProfile = await userService.getFullUserProfile(userId);
    
    if (!fullProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(fullProfile);
  } catch (error) {
    console.error('Error in getProfileWithAchievements controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// TODO
const getCompleteProfile = async (req, res) => {
    try {
      const userId = req.userId;
      const completeProfile = await userService.getCompleteUserProfileUsingProcedures(userId);
      
      if (!completeProfile) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(completeProfile);
    } catch (error) {
      console.error('Error in getCompleteProfile controller:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = {
  getProfile,
  updateProfile,
  getProfileWithAchievements,
  getCompleteProfile
};