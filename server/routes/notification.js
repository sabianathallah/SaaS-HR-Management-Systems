const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");

// Note: Authentication already applied in routes/index.js
// All routes here are already protected

// Get unread count (must come before /:id routes)
router.get("/unread-count", NotificationController.getUnreadCount);

// Mark all as read
router.patch("/read-all", NotificationController.markAllAsRead);

// Clear all read notifications
router.delete("/clear-read", NotificationController.clearReadNotifications);

// Get my notifications
router.get("/", NotificationController.getMyNotifications);

// Mark specific notification as read
router.patch("/:id/read", NotificationController.markAsRead);

// Delete specific notification
router.delete("/:id", NotificationController.deleteNotification);

module.exports = router;
