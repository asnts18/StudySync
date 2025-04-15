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

// Get all study groups with filters
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

// Get user's study groups (both those they own and have joined)
const getUserGroups = async (req, res) => {
  try {
    const userId = req.userId;
    const userGroups = await groupService.getUserStudyGroups(userId);
    res.status(200).json(userGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Failed to fetch user study groups' });
  }
};

// Get details of a specific study group
const getGroupDetail = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await groupService.getStudyGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching study group details:', error);
    res.status(500).json({ message: 'Failed to fetch study group details' });
  }
};

// Join a study group
const joinStudyGroup = async (req, res) => {
  try {
    const userId = req.userId;         // Comes from auth middleware
    const groupId = req.params.id;      // Extracted from URL parameter
    const result = await groupService.joinStudyGroup(userId, groupId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ message: 'Failed to join study group' });
  }
};

// Leave a study group
const leaveStudyGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const groupId = req.params.id;
    
    const result = await groupService.leaveStudyGroup(userId, groupId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error leaving study group:', error);
    res.status(500).json({ message: 'Failed to leave study group' });
  }
};

// NEW: List all members of a study group
const listMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const members = await groupService.listGroupMembers(groupId);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error listing group members:', error);
    res.status(500).json({ message: 'Failed to list group members' });
  }
};
// NEW: Remove a specific member from a study group
const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.memberId;
    const result = await groupService.removeGroupMember(groupId, memberId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ message: 'Failed to remove group member' });
  }
};

module.exports = { 
  createStudyGroup, 
  listStudyGroups,
  getUserGroups,
  getGroupDetail,
  joinStudyGroup,
  leaveStudyGroup,
  listMembers,
  removeMember
};