// server/controllers/studygroupController.js

const groupService = require('../services/studygroupService');

const createStudyGroup = async (req, res) => {
  try {
    const owner_id = req.userId;
    const {
      name,
      description,
      course_code,
      university_id,
      max_capacity,
      is_private
    } = req.body;

    const newGroup = await groupService.createStudyGroup({
      name,
      description,
      owner_id,
      course_code,
      university_id,
      max_capacity,
      is_private: is_private ? 1 : 0
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ message: 'Failed to create study group' });
  }
};

module.exports = { createStudyGroup };
