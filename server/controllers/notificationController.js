const { Notification } = require('../models');
const notificationHelper = require('../helpers/notificationHelper');

class NotificationController {

  /**
   * Get my notifications
   * GET /notifications
   */
  static async getMyNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { isRead, type, limit, offset } = req.query;

      const options = {
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      };

      if (isRead !== undefined) {
        options.isRead = isRead === 'true';
      }

      if (type) {
        options.type = type;
      }

      const notifications = await notificationHelper.getUserNotifications(userId, options);
      const unreadCount = await notificationHelper.getUnreadCount(userId);

      res.status(200).json({
        message: "My notifications",
        data: notifications,
        meta: {
          total: notifications.length,
          unreadCount,
          limit: options.limit,
          offset: options.offset
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  static async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await notificationHelper.getUnreadCount(userId);

      res.status(200).json({
        message: "Unread notification count",
        data: {
          unreadCount: count
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PATCH /notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found"
        });
      }

      // Check ownership
      if (notification.UserId !== userId) {
        return res.status(403).json({
          message: "You don't have permission to access this notification"
        });
      }

      const updatedNotification = await notificationHelper.markAsRead(id);

      res.status(200).json({
        message: "Notification marked as read",
        data: updatedNotification
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await notificationHelper.markAllAsRead(userId);

      res.status(200).json({
        message: `${count} notification(s) marked as read`,
        data: {
          updatedCount: count
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   * DELETE /notifications/:id
   */
  static async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found"
        });
      }

      // Check ownership
      if (notification.UserId !== userId) {
        return res.status(403).json({
          message: "You don't have permission to delete this notification"
        });
      }

      await notification.destroy();

      res.status(200).json({
        message: "Notification deleted successfully"
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all read notifications
   * DELETE /notifications/clear-read
   */
  static async clearReadNotifications(req, res, next) {
    try {
      const userId = req.user.id;

      const deletedCount = await Notification.destroy({
        where: {
          UserId: userId,
          isRead: true
        }
      });

      res.status(200).json({
        message: `${deletedCount} read notification(s) cleared`,
        data: {
          deletedCount
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
