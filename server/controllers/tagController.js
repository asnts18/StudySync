// server/controllers/tagController.js
const tagService = require('../services/tagService');

const getAllTags = async (req, res) => {
  try {
    const tags = await tagService.getAllTags();
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error in getAllTags controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTags
};