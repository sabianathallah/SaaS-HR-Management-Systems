'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Overtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Overtime belongs to User (employee who requested)
      Overtime.belongsTo(models.User, { 
        foreignKey: 'UserId', 
        as: 'employee',
        onDelete: 'CASCADE' 
      });
      
      // Overtime belongs to User (admin who approved/rejected)
      Overtime.belongsTo(models.User, { 
        foreignKey: 'approvedBy', 
        as: 'approver',
        onDelete: 'SET NULL' 
      });
      
      // Overtime belongs to Attendance
      Overtime.belongsTo(models.Attendance, {
        foreignKey: 'AttendanceId',
        as: 'attendance',
        onDelete: 'SET NULL'
      });

      // Overtime belongs to Company
      Overtime.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    }

    // Status constants
    static get STATUS() {
      return {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected'
      };
    }
  }

  Overtime.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'User ID is required'
        }
      }
    },
    AttendanceId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    overtimeDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Overtime date is required'
        },
        isDate: {
          msg: 'Invalid date format'
        }
      }
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    requestedHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Requested hours is required'
        },
        min: {
          args: [0.5],
          msg: 'Minimum overtime is 0.5 hours'
        },
        max: {
          args: [12],
          msg: 'Maximum overtime is 12 hours'
        }
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Actual hours cannot be negative'
        }
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reason for overtime is required'
        },
        len: {
          args: [10, 1000],
          msg: 'Reason must be between 10 and 1000 characters'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'approved', 'rejected']],
          msg: 'Status must be pending, approved, or rejected'
        }
      }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' }
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        customValidator(value) {
          if (this.status === 'rejected' && !value) {
            throw new Error('Rejection reason is required when rejecting overtime');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Overtime',
  });

  return Overtime;
};
