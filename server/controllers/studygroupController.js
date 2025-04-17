// controllers/studyGroupController.js
const groupService = require('../services/studygroupService');
const db = require('../config/db.config');



const createStudyGroup = async (req, res) => {
  try {
    const owner_id = req.userId; // From auth middleware
    const {
      name,
      description,
      course_code,
      university_id,
      max_capacity,
      is_private,
    } = req.body;

    // Basic validation (could be moved to validator middleware)
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const newGroup = await groupService.createStudyGroup({
      name,
      description: description || null,
      owner_id,
      course_code: course_code || null,
      university_id,
      max_capacity: max_capacity || 8,
      is_private: is_private || false
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


const getUniversityGroups = async (req, res) => {
  try {
    const universityId = req.params.universityId;
    const groups = await groupService.getStudyGroupsByUniversity(universityId);
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching university study groups:', error);
    res.status(500).json({ message: 'Failed to fetch university study groups' });
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

// List all members of a study group
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
// Remove a specific member from a study group
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

const updateStudyGroup = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { groupId } = req.params;
    const { name, description } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Call service to update the group
    const updatedGroup = await groupService.updateStudyGroup(groupId, userId, {
      name,
      description: description || null
    });

    res.status(200).json({
      message: 'Study group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error updating study group:', error);
    
    // Check for specific error types
    if (error.message === 'Study group not found') {
      return res.status(404).json({ message: 'Study group not found' });
    } else if (error.message === 'Only the owner can update the group') {
      return res.status(403).json({ message: 'Only the owner can update this group' });
    }
    
    res.status(500).json({ message: 'Failed to update study group' });
  }
};

const deleteStudyGroup = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const groupId = req.params.id;
    
    const result = await groupService.deleteStudyGroup(groupId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting study group:', error);
    
    // Check for specific error types
    if (error.message === 'Study group not found') {
      return res.status(404).json({ message: 'Study group not found' });
    } else if (error.message === 'Only the owner can delete the group') {
      return res.status(403).json({ message: 'Only the owner can delete this group' });
    }
    
    res.status(500).json({ message: 'Failed to delete study group' });
  }
};


const requestJoinGroup = async (req, res) => {
  try {
    const study_group_id = req.params.id; // The group ID from the URL parameter
    const user_id = req.userId;           // Authenticated user ID from auth middleware
    
    const result = await groupService.requestJoinGroup({ study_group_id, user_id });
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error requesting to join study group:', error);
    res.status(500).json({ message: 'Failed to submit join request' });
  }
};

const getUserPendingRequests = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    // Query the database for pending join requests for groups OWNED by this user
    const pendingRequests = await db.query(
      `SELECT gjr.request_id, gjr.study_group_id, gjr.user_id, gjr.request_date, 
              sg.name as group_name, sg.course_code, c.name as course_name,
              u.first_name, u.last_name
       FROM GroupJoinRequests gjr
       JOIN StudyGroup sg ON gjr.study_group_id = sg.study_group_id
       JOIN User u ON gjr.user_id = u.user_id
       LEFT JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
       WHERE sg.owner_id = ? AND gjr.status = 'pending'
       ORDER BY gjr.request_date DESC`,
      [userId]
    );
    
    console.log('Pending requests for owner:', pendingRequests);
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching owner pending requests:', error);
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};

module.exports = { 
  createStudyGroup, 
  listStudyGroups,
  updateStudyGroup,
  deleteStudyGroup,
  getUniversityGroups,
  getUserGroups,
  getGroupDetail,
  joinStudyGroup,
  leaveStudyGroup,
  listMembers,
  removeMember,
  requestJoinGroup,
  getUserPendingRequests
};