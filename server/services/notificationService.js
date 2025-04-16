// server/services/notificationService.js
const db = require('../config/db.config');

// Fetch notifications for a specific user, ordered by created_at descending
const getNotificationsForUser = async (userId) => {
  try {
    const sql = `SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC`;
    const notifications = await db.query(sql, [userId]);
    return notifications;
  } catch (error) {
    console.error("DB error fetching notifications:", error);
    throw error;
  }
};

// Mark a notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    const sql = `UPDATE Notifications SET status='read' WHERE notification_id = ?`;
    await db.query(sql, [notificationId]);
    return { message: "Notification marked as read" };
  } catch (error) {
    console.error("DB error updating notification:", error);
    throw error;
  }
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  try {
    const sql = `DELETE FROM Notifications WHERE notification_id = ?`;
    await db.query(sql, [notificationId]);
    return { message: "Notification deleted" };
  } catch (error) {
    console.error("DB error deleting notification:", error);
    throw error;
  }
};

module.exports = { 
  getNotificationsForUser, 
  markNotificationAsRead, 
  deleteNotification 
};
