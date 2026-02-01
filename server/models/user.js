'use strict';

const hashPassword = require('../helpers/bcrypt').hashPassword;

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Attendance, { foreignKey: 'UserId', onDelete: 'CASCADE' });
      User.hasMany(models.LeaveRequest, { foreignKey: 'UserId', as: 'leaveRequests', onDelete: 'CASCADE' });
      User.hasMany(models.LeaveRequest, { foreignKey: 'approvedBy', as: 'approvedLeaves', onDelete: 'SET NULL' });
      User.hasMany(models.Overtime, { foreignKey: 'UserId', as: 'overtimeRequests', onDelete: 'CASCADE' });
      User.hasMany(models.Overtime, { foreignKey: 'approvedBy', as: 'approvedOvertimes', onDelete: 'SET NULL' });
      
      // User belongs to Shift (default shift)
      User.belongsTo(models.Shift, { 
        foreignKey: 'ShiftId',
        as: 'shift'
      });

      // User has many AuditLogs (activities performed by this user)
      User.hasMany(models.AuditLog, {
        foreignKey: 'userId',
        as: 'auditLogs',
        onDelete: 'SET NULL'
      });

      // User has many WorkLocationChangeRequests
      User.hasMany(models.WorkLocationChangeRequest, {
        foreignKey: 'UserId',
        as: 'workLocationChangeRequests',
        onDelete: 'CASCADE'
      });

      // User has many WorkLocationChangeRequests they approved
      User.hasMany(models.WorkLocationChangeRequest, {
        foreignKey: 'approvedBy',
        as: 'approvedWorkLocationChanges',
        onDelete: 'SET NULL'
      });

      // User has many HybridSchedules
      User.hasMany(models.HybridSchedule, {
        foreignKey: 'UserId',
        as: 'hybridSchedules',
        onDelete: 'CASCADE'
      });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address already in use!'
      },
      validate: {
        notEmpty: {
          msg: 'Email cannot be empty'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EMPLOYEE',
      notEmpty: {
        msg: 'Role cannot be empty'
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    annualLeaveQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
      validate: {
        min: {
          args: [0],
          msg: 'Annual leave quota cannot be negative'
        }
      }
    },
    usedLeaveQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Used leave quota cannot be negative'
        }
      }
    },
    remainingLeaveQuota: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.annualLeaveQuota - this.usedLeaveQuota;
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    leaveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterJoinDate(value) {
          if (value && this.joinDate) {
            const leaveDateTime = new Date(value).getTime();
            const joinDateTime = new Date(this.joinDate).getTime();
            if (leaveDateTime <= joinDateTime) {
              throw new Error('Leave date must be after join date');
            }
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate((user) => {
    user.password = hashPassword(user.password);
  });

  return User;
};