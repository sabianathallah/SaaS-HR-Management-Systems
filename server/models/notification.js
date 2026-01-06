'use strict';
const {
  Model
} = require('sequelize');

// Define notification type constants
const NOTIFICATION_TYPE = {
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_REJECTED: 'LEAVE_REJECTED',
  OVERTIME_APPROVED: 'OVERTIME_APPROVED',
  OVERTIME_REJECTED: 'OVERTIME_REJECTED',
  ATTENDANCE_CORRECTION: 'ATTENDANCE_CORRECTION',
  WORK_SCHEDULE_CHANGE: 'WORK_SCHEDULE_CHANGE',
  HOLIDAY_ANNOUNCEMENT: 'HOLIDAY_ANNOUNCEMENT',
  LEAVE_QUOTA_ADJUSTMENT: 'LEAVE_QUOTA_ADJUSTMENT',
  CLOCK_IN_REMINDER: 'CLOCK_IN_REMINDER'
};

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Notification belongs to User
      Notification.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user'
      });
    }
  }
  Notification.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM(
        NOTIFICATION_TYPE.LEAVE_APPROVED,
        NOTIFICATION_TYPE.LEAVE_REJECTED,
        NOTIFICATION_TYPE.OVERTIME_APPROVED,
        NOTIFICATION_TYPE.OVERTIME_REJECTED,
        NOTIFICATION_TYPE.ATTENDANCE_CORRECTION,
        NOTIFICATION_TYPE.WORK_SCHEDULE_CHANGE,
        NOTIFICATION_TYPE.HOLIDAY_ANNOUNCEMENT,
        NOTIFICATION_TYPE.LEAVE_QUOTA_ADJUSTMENT,
        NOTIFICATION_TYPE.CLOCK_IN_REMINDER
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Type cannot be empty'
        }
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        },
        len: {
          args: [5, 200],
          msg: 'Title must be between 5 and 200 characters'
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Message cannot be empty'
        },
        len: {
          args: [10, 1000],
          msg: 'Message must be between 10 and 1000 characters'
        }
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });

  // Export constants for use in controllers
  Notification.NOTIFICATION_TYPE = NOTIFICATION_TYPE;

  return Notification;
};