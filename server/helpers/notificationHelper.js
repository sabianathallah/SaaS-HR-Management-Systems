const { Notification, User } = require('../models');
const emailNotification = require('./emailNotification');

/**
 * Notification Helper
 * Handles both in-app and email notifications
 */

/**
 * Create in-app notification
 * @param {number} userId - User ID to receive notification
 * @param {string} type - Notification type (from NOTIFICATION_TYPE)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} metadata - Additional data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      UserId: userId,
      type,
      title,
      message,
      isRead: false,
      metadata
    });

    console.log(`✅ In-app notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error.message);
    throw error;
  }
};

/**
 * Send notification (both in-app and email)
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Title
 * @param {string} message - Message
 * @param {object} metadata - Metadata
 * @param {boolean} sendEmail - Whether to send email (default: true)
 * @returns {Promise<Object>} Result
 */
const sendNotification = async (userId, type, title, message, metadata = {}, sendEmail = true) => {
  try {
    // Create in-app notification
    const notification = await createNotification(userId, type, title, message, metadata);

    // Send email if enabled
    if (sendEmail) {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        await sendEmailByType(type, user, metadata);
      }
    }

    return { success: true, notification };
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email based on notification type
 */
const sendEmailByType = async (type, user, data) => {
  const { email, name } = user;

  switch (type) {
    case Notification.NOTIFICATION_TYPE.LEAVE_APPROVED:
      await emailNotification.sendLeaveApprovalEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.LEAVE_REJECTED:
      await emailNotification.sendLeaveRejectionEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.OVERTIME_APPROVED:
      await emailNotification.sendOvertimeApprovalEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.OVERTIME_REJECTED:
      await emailNotification.sendOvertimeRejectionEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.ATTENDANCE_CORRECTION:
      await emailNotification.sendAttendanceCorrectionEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.CLOCK_IN_REMINDER:
      await emailNotification.sendClockInReminderEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.WORK_SCHEDULE_CHANGE:
      await emailNotification.sendWorkScheduleChangeEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.HOLIDAY_ANNOUNCEMENT:
      await emailNotification.sendHolidayAnnouncementEmail(email, name, data);
      break;
    
    case Notification.NOTIFICATION_TYPE.LEAVE_QUOTA_ADJUSTMENT:
      await emailNotification.sendLeaveQuotaAdjustmentEmail(email, name, data);
      break;
    
    default:
      console.log(`No email template for notification type: ${type}`);
  }
};

/**
 * Send notification to multiple users
 * @param {Array<number>} userIds - Array of user IDs
 * @param {string} type - Notification type
 * @param {string} title - Title
 * @param {string} message - Message
 * @param {object} metadata - Metadata
 * @param {boolean} sendEmail - Whether to send email
 * @returns {Promise<Object>} Result
 */
const sendBulkNotification = async (userIds, type, title, message, metadata = {}, sendEmail = true) => {
  try {
    const results = await Promise.allSettled(
      userIds.map(userId => sendNotification(userId, type, title, message, metadata, sendEmail))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`✅ Bulk notification: ${successful} sent, ${failed} failed`);
    return { success: true, sent: successful, failed };
  } catch (error) {
    console.error('❌ Error sending bulk notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to all active employees
 * @param {string} type - Notification type
 * @param {string} title - Title
 * @param {string} message - Message
 * @param {object} metadata - Metadata
 * @param {boolean} sendEmail - Whether to send email
 * @returns {Promise<Object>} Result
 */
const sendToAllEmployees = async (type, title, message, metadata = {}, sendEmail = true) => {
  try {
    const activeUsers = await User.findAll({
      where: { 
        isActive: true,
        role: 'EMPLOYEE'
      },
      attributes: ['id']
    });

    const userIds = activeUsers.map(u => u.id);
    return await sendBulkNotification(userIds, type, title, message, metadata, sendEmail);
  } catch (error) {
    console.error('❌ Error sending to all employees:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to all users (including admins)
 * @param {string} type - Notification type
 * @param {string} title - Title
 * @param {string} message - Message
 * @param {object} metadata - Metadata
 * @param {boolean} sendEmail - Whether to send email
 * @returns {Promise<Object>} Result
 */
const sendToAllUsers = async (type, title, message, metadata = {}, sendEmail = true) => {
  try {
    const activeUsers = await User.findAll({
      where: { isActive: true },
      attributes: ['id']
    });

    const userIds = activeUsers.map(u => u.id);
    return await sendBulkNotification(userIds, type, title, message, metadata, sendEmail);
  } catch (error) {
    console.error('❌ Error sending to all users:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error.message);
    throw error;
  }
};

/**
 * Mark all user notifications as read
 * @param {number} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
const markAllAsRead = async (userId) => {
  try {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      { 
        where: { 
          UserId: userId,
          isRead: false
        }
      }
    );

    console.log(`✅ Marked ${updatedCount} notifications as read for user ${userId}`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Error marking all as read:', error.message);
    throw error;
  }
};

/**
 * Get user notifications
 * @param {number} userId - User ID
 * @param {object} options - Filter options
 * @returns {Promise<Array>} Notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { isRead, type, limit = 50, offset = 0 } = options;

    const whereClause = { UserId: userId };
    if (isRead !== undefined) {
      whereClause.isRead = isRead;
    }
    if (type) {
      whereClause.type = type;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error getting notifications:', error.message);
    throw error;
  }
};

/**
 * Get unread notification count
 * @param {number} userId - User ID
 * @returns {Promise<number>} Unread count
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        UserId: userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    console.error('❌ Error getting unread count:', error.message);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotification,
  sendBulkNotification,
  sendToAllEmployees,
  sendToAllUsers,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  getUnreadCount
};
