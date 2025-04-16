// server/controllers/notificationController.js
const notificationService = require('../services/notificationService');

// GET /api/notifications - retrieve all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.userId; // Auth middleware should attach userId
    const notifications = await notificationService.getNotificationsForUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// PUT /api/notifications/:id - mark a notification as read
const updateNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await notificationService.markNotificationAsRead(notificationId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// DELETE /api/notifications/:id - delete a notification
const removeNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const result = await notificationService.deleteNotification(notificationId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

module.exports = { 
  getNotifications, 
  updateNotification, 
  removeNotification 
};
