'use strict';
const {
  Model
} = require('sequelize');

// Define attendance status constants
// Complete list of all possible attendance statuses
const ATTENDANCE_STATUS = {
  ON_PROGRESS: 'ON_PROGRESS',    // User has clocked in but not yet clocked out
  ON_TIME: 'ON_TIME',            // User clocked out on time
  LATE: 'LATE',                  // User clocked in late
  ABSENT: 'ABSENT',              // User did not attend work
  LEAVE: 'LEAVE',                // User is on annual leave (deducts quota)
  SICK_LEAVE: 'SICK_LEAVE',      // User is on sick leave (deducts quota)
  PERMISSION: 'PERMISSION',      // User has permission to be absent (no quota deduction)
  HOLIDAY: 'HOLIDAY'             // National/company holiday
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

      // Attendance belongs to OfficeLocation
      Attendance.belongsTo(models.OfficeLocation, { 
        foreignKey: 'office_location_id',
        as: 'office_location'
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
      allowNull: true  
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
    },
    photoCheckIn: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path/URL foto selfie saat check-in'
    },
    photoCheckOut: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path/URL foto selfie saat check-out'
    },
    clockInLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'clock_in_latitude',
      comment: 'Latitude saat clock-in'
    },
    clockInLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'clock_in_longitude',
      comment: 'Longitude saat clock-in'
    },
    clockOutLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      field: 'clock_out_latitude',
      comment: 'Latitude saat clock-out'
    },
    clockOutLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      field: 'clock_out_longitude',
      comment: 'Longitude saat clock-out'
    },
    officeLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'office_location_id',
      references: {
        model: 'office_locations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    locationValidationStatus: {
      type: DataTypes.ENUM('valid', 'outside_radius', 'gps_error', 'not_checked'),
      allowNull: false,
      defaultValue: 'not_checked',
      field: 'location_validation_status',
      comment: 'Status validasi lokasi'
    },
    distanceFromOffice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'distance_from_office',
      comment: 'Jarak dari kantor dalam meter'
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  
  // Export status constants for use in controllers
  Attendance.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
  
  return Attendance;
};