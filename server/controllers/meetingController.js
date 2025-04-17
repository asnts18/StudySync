// server/controllers/meetingController.js
const meetingService = require('../services/meetingService');
const studyGroupService = require('../services/studygroupService');

const createMeeting = async (req, res) => {
  try {
    // Attach the authenticated user id as created_by
    const meetingData = {
      ...req.body,
      created_by: req.userId  // provided by auth middleware
    };
    
    const meeting = await meetingService.createMeeting(meetingData);
    res.status(201).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Failed to create meeting", error: error.message });
  }
};

const getGroupMeetings = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const meetings = await meetingService.getGroupMeetings(groupId);
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching group meetings:", error);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    const meeting = await meetingService.getMeetingById(meetingId);
    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    
    if (error.message === 'Meeting not found') {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch meeting details" });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    const userId = req.userId; // From auth middleware
    
    const meeting = await meetingService.updateMeeting(meetingId, req.body, userId);
    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    
    if (error.message === 'Meeting not found') {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    if (error.message === 'Not authorized to update this meeting') {
      return res.status(403).json({ message: "You do not have permission to update this meeting" });
    }
    
    res.status(500).json({ message: "Failed to update meeting" });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    const userId = req.userId; // From auth middleware
    
    const result = await meetingService.deleteMeeting(meetingId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting meeting:", error);
    
    if (error.message === 'Meeting not found') {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    if (error.message === 'Not authorized to delete this meeting') {
      return res.status(403).json({ message: "You do not have permission to delete this meeting" });
    }
    
    res.status(500).json({ message: "Failed to delete meeting" });
  }
};

module.exports = {
  createMeeting,
  getGroupMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
};