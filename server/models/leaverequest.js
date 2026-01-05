'use strict';
const {
  Model
} = require('sequelize');

// Define leave type and status constants
const LEAVE_TYPE = {
  ANNUAL_LEAVE: 'ANNUAL_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
  PERMISSION: 'PERMISSION'
};

const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

module.exports = (sequelize, DataTypes) => {
  class LeaveRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // LeaveRequest belongs to User (requester)
      LeaveRequest.belongsTo(models.User, { 
        foreignKey: 'UserId',
        as: 'employee'
      });

      // LeaveRequest belongs to User (approver)
      LeaveRequest.belongsTo(models.User, { 
        foreignKey: 'approvedBy',
        as: 'approver'
      });

      // LeaveRequest has many Attendances
      LeaveRequest.hasMany(models.Attendance, { 
        foreignKey: 'LeaveRequestId',
        as: 'attendances'
      });
    }
  }
  
  LeaveRequest.init({
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
    leaveType: {
      type: DataTypes.ENUM(
        LEAVE_TYPE.ANNUAL_LEAVE,
        LEAVE_TYPE.SICK_LEAVE,
        LEAVE_TYPE.PERMISSION
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Leave type cannot be empty'
        }
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Start date cannot be empty'
        },
        isDate: {
          msg: 'Start date must be a valid date'
        }
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'End date cannot be empty'
        },
        isDate: {
          msg: 'End date must be a valid date'
        },
        isAfterOrEqualStart(value) {
          if (new Date(value) < new Date(this.startDate)) {
            throw new Error('End date must be after or equal to start date');
          }
        }
      }
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Total days must be at least 1'
        }
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reason cannot be empty'
        },
        len: {
          args: [10, 500],
          msg: 'Reason must be between 10 and 500 characters'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.APPROVED,
        REQUEST_STATUS.REJECTED,
        REQUEST_STATUS.CANCELLED
      ),
      allowNull: false,
      defaultValue: REQUEST_STATUS.PENDING
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    approvalNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LeaveRequest',
  });

  // Export constants for use in controllers
  LeaveRequest.LEAVE_TYPE = LEAVE_TYPE;
  LeaveRequest.REQUEST_STATUS = REQUEST_STATUS;

  return LeaveRequest;
};
