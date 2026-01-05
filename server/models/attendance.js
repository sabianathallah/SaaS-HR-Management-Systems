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
  SICK_LEAVE: 'SICK_LEAVE',
  PERMISSION: 'PERMISSION',
  HOLIDAY: 'HOLIDAY'
};

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Attendance belongs to User
      Attendance.belongsTo(models.User, { 
        foreignKey: 'UserId'
      });

      // Attendance belongs to WorkSchedule
      Attendance.belongsTo(models.WorkSchedule, { 
        foreignKey: 'WorkScheduleId'
      });

      // Attendance belongs to Holiday (only when status = HOLIDAY)
      Attendance.belongsTo(models.Holiday, { 
        foreignKey: 'HolidayId'
      });

      // Attendance belongs to LeaveRequest (only when status = LEAVE/SICK_LEAVE/PERMISSION)
      Attendance.belongsTo(models.LeaveRequest, { 
        foreignKey: 'LeaveRequestId'
      });

      // Attendance has one Overtime
      Attendance.hasOne(models.Overtime, { 
        foreignKey: 'AttendanceId',
        as: 'overtime'
      });

      // Attendance belongs to Shift
      Attendance.belongsTo(models.Shift, { 
        foreignKey: 'ShiftId',
        as: 'shift'
      });
    }
  }
  Attendance.init({
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
    LeaveRequestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'LeaveRequests',
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
        ATTENDANCE_STATUS.SICK_LEAVE,
        ATTENDANCE_STATUS.PERMISSION,
        ATTENDANCE_STATUS.HOLIDAY
      ),
      allowNull: false,
      defaultValue: ATTENDANCE_STATUS.ON_PROGRESS
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  
  // Export status constants for use in controllers
  Attendance.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
  
  return Attendance;
};