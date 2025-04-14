// controllers/studyGroupController.js
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
      is_private,
      tags,
      location,
      meeting_time
    } = req.body;

    const newGroup = await groupService.createStudyGroup({
      name,
      description,
      owner_id,
      course_code,
      university_id,
      max_capacity,
      is_private: is_private ? 1 : 0,
      tags,
      location,
      meeting_time
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ message: 'Failed to create study group' });
  }
};

// Filter group listing and API
const listStudyGroups = async (req, res) => {
  try {
    // Retrieve filters from query parameters
    const filters = {
      name: req.query.name,
      course_code: req.query.course_code,
      university_id: req.query.university_id,
      is_private: req.query.is_private,
      tag: req.query.tag
    };

    // Convert university_id to number (if provided)
    if (filters.university_id) {
      filters.university_id = Number(filters.university_id);
    }

    // Convert is_private from string to boolean (if provided)
    if (filters.is_private !== undefined) {
      filters.is_private = filters.is_private === 'true';
    }

    const groups = await groupService.listStudyGroups(filters);
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error listing study groups:', error);
    res.status(500).json({ message: 'Failed to list study groups' });
  }
};

module.exports = { createStudyGroup, listStudyGroups };