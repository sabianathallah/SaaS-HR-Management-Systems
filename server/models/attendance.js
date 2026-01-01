'use strict';
const {
  Model
} = require('sequelize');

// Define attendance status constants
const ATTENDANCE_STATUS = {
  ON_PROGRESS: 'ON_PROGRESS',
  ON_TIME: 'ON_TIME',
  LATE: 'LATE',
  ABSENT: 'ABSENT',
  LEAVE: 'LEAVE',
  HOLIDAY: 'HOLIDAY'
};

module.exports = (sequelize, DataTypes) => {
  class Attandance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Attendance belongs to User
      Attandance.belongsTo(models.User, { 
        foreignKey: 'UserId',
        as: 'User'
      });

      // Attendance belongs to WorkSchedule
      Attandance.belongsTo(models.WorkSchedule, { 
        foreignKey: 'WorkScheduleId',
        as: 'WorkSchedule'
      });

      // Attendance belongs to Holiday (only when status = HOLIDAY)
      Attandance.belongsTo(models.Holiday, { 
        foreignKey: 'HolidayId',
        as: 'Holiday'
      });
    }
  }
  Attandance.init({
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
    WorkScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'WorkSchedules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    HolidayId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Holidays',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        ATTENDANCE_STATUS.ON_PROGRESS,
        ATTENDANCE_STATUS.ON_TIME,
        ATTENDANCE_STATUS.LATE,
        ATTENDANCE_STATUS.ABSENT,
        ATTENDANCE_STATUS.LEAVE,
        ATTENDANCE_STATUS.HOLIDAY
      ),
      allowNull: false,
      defaultValue: ATTENDANCE_STATUS.ON_PROGRESS
    }
  }, {
    sequelize,
    modelName: 'Attandance',
  });
  
  // Export status constants for use in controllers
  Attandance.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
  
  return Attandance;
};