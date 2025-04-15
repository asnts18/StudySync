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

const getAllMeetings = async (req, res) => {
  try {
    const meetings = await meetingService.listMeetings();
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error listing meetings:", error);
    res.status(500).json({ message: "Failed to list meetings" });
  }
};

module.exports = {
  createMeeting,
  getAllMeetings
};
