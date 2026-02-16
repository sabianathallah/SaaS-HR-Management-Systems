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
      // User belongs to Company
      User.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      });

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

      // User has many EmployeeSalaryComponents
      User.hasMany(models.EmployeeSalaryComponent, {
        foreignKey: 'UserId',
        as: 'salaryComponents',
        onDelete: 'CASCADE'
      });

      // User has many Payrolls (as employee)
      User.hasMany(models.Payroll, {
        foreignKey: 'UserId',
        as: 'payrolls',
        onDelete: 'CASCADE'
      });

      // User has many PayrollPeriods they generated
      User.hasMany(models.PayrollPeriod, {
        foreignKey: 'generatedBy',
        as: 'generatedPayrollPeriods',
        onDelete: 'SET NULL'
      });

      // User has many PayrollPeriods they approved
      User.hasMany(models.PayrollPeriod, {
        foreignKey: 'approvedBy',
        as: 'approvedPayrollPeriods',
        onDelete: 'SET NULL'
      });

      // User has many PayrollPeriods they processed
      User.hasMany(models.PayrollPeriod, {
        foreignKey: 'processedBy',
        as: 'processedPayrollPeriods',
        onDelete: 'SET NULL'
      });

      // User has many PayrollAdjustments they created
      User.hasMany(models.PayrollAdjustment, {
        foreignKey: 'createdBy',
        as: 'createdAdjustments',
        onDelete: 'CASCADE'
      });

      // User has many PayrollAdjustments they approved
      User.hasMany(models.PayrollAdjustment, {
        foreignKey: 'approvedBy',
        as: 'approvedAdjustments',
        onDelete: 'SET NULL'
      });

      // User has many PayrollHistories
      User.hasMany(models.PayrollHistory, {
        foreignKey: 'performedBy',
        as: 'payrollHistories',
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
      validate: {
        notEmpty: {
          msg: 'Role cannot be empty'
        },
        isIn: {
          args: [['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE']],
          msg: 'Role must be SUPER_ADMIN, COMPANY_ADMIN, or EMPLOYEE'
        }
      }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id'
      },
      validate: {
        isCompanyRequired(value) {
          if (this.role !== 'SUPER_ADMIN' && !value) {
            throw new Error('Company is required for non-super admin users');
          }
        }
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
    },
    employmentStatus: {
      type: DataTypes.ENUM('probation', 'permanent', 'contract', 'internship'),
      allowNull: false,
      defaultValue: 'probation'
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankAccountHolderName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    baseSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Base salary cannot be negative'
        }
      }
    },
    maritalStatus: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: false,
      defaultValue: 'single'
    },
    numberOfDependents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Number of dependents cannot be negative'
        },
        max: {
          args: [10],
          msg: 'Number of dependents cannot exceed 10'
        }
      }
    },
    taxIdentificationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'NPWP - Nomor Pokok Wajib Pajak'
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