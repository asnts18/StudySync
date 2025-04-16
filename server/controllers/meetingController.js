// server/controllers/meetingController.js
const meetingService = require('../services/meetingService');

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

module.exports = {
  createMeeting,
  getGroupMeetings
};
