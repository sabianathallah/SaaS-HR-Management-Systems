const { Notification } = require('../models');
const notificationHelper = require('../helpers/notificationHelper');
const response = require('../helpers/responseHelper');

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

      return response.ok(res, 'My notifications', notifications, {
        total: notifications.length,
        unreadCount,
        limit: options.limit,
        offset: options.offset
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

      return response.ok(res, 'Unread notification count', { unreadCount: count });

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
        return response.notFound(res, 'Notification not found');
      }

      // Check ownership
      if (notification.UserId !== userId) {
        return response.forbidden(res, "You don't have permission to access this notification");
      }

      const updatedNotification = await notificationHelper.markAsRead(id);

      return response.ok(res, 'Notification marked as read', updatedNotification);

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

      return response.ok(res, `${count} notification(s) marked as read`, { updatedCount: count });

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
        return response.notFound(res, 'Notification not found');
      }

      // Check ownership
      if (notification.UserId !== userId) {
        return response.forbidden(res, "You don't have permission to delete this notification");
      }

      await notification.destroy();

      return response.ok(res, 'Notification deleted successfully');

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

      return response.ok(res, `${deletedCount} read notification(s) cleared`, { deletedCount });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
