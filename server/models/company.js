'use strict';

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Company has many Users
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'users',
        onDelete: 'CASCADE'
      });

      // Company has many Attendances
      Company.hasMany(models.Attendance, {
        foreignKey: 'companyId',
        as: 'attendances',
        onDelete: 'CASCADE'
      });

      // Company has many LeaveRequests
      Company.hasMany(models.LeaveRequest, {
        foreignKey: 'companyId',
        as: 'leaveRequests',
        onDelete: 'CASCADE'
      });

      // Company has many Overtimes
      Company.hasMany(models.Overtime, {
        foreignKey: 'companyId',
        as: 'overtimes',
        onDelete: 'CASCADE'
      });

      // Company has many Shifts
      Company.hasMany(models.Shift, {
        foreignKey: 'companyId',
        as: 'shifts',
        onDelete: 'CASCADE'
      });

      // Company has many WorkSchedules
      Company.hasMany(models.WorkSchedule, {
        foreignKey: 'companyId',
        as: 'workSchedules',
        onDelete: 'CASCADE'
      });

      // Company has many Holidays
      Company.hasMany(models.Holiday, {
        foreignKey: 'companyId',
        as: 'holidays',
        onDelete: 'CASCADE'
      });

      // Company has many OfficeLocations
      Company.hasMany(models.OfficeLocation, {
        foreignKey: 'companyId',
        as: 'officeLocations',
        onDelete: 'CASCADE'
      });

      // Company has many Notifications
      Company.hasMany(models.Notification, {
        foreignKey: 'companyId',
        as: 'notifications',
        onDelete: 'CASCADE'
      });

      // Company has many AuditLogs
      Company.hasMany(models.AuditLog, {
        foreignKey: 'companyId',
        as: 'auditLogs',
        onDelete: 'CASCADE'
      });

      // Company has many WorkLocationChangeRequests
      Company.hasMany(models.WorkLocationChangeRequest, {
        foreignKey: 'companyId',
        as: 'workLocationChangeRequests',
        onDelete: 'CASCADE'
      });

      // Company has many HybridSchedules
      Company.hasMany(models.HybridSchedule, {
        foreignKey: 'companyId',
        as: 'hybridSchedules',
        onDelete: 'CASCADE'
      });

      // Company has many PayrollComponents
      Company.hasMany(models.PayrollComponent, {
        foreignKey: 'companyId',
        as: 'payrollComponents',
        onDelete: 'CASCADE'
      });

      // Company has many EmployeeSalaryComponents
      Company.hasMany(models.EmployeeSalaryComponent, {
        foreignKey: 'companyId',
        as: 'employeeSalaryComponents',
        onDelete: 'CASCADE'
      });

      // Company has many PayrollPeriods
      Company.hasMany(models.PayrollPeriod, {
        foreignKey: 'companyId',
        as: 'payrollPeriods',
        onDelete: 'CASCADE'
      });

      // Company has many Payrolls
      Company.hasMany(models.Payroll, {
        foreignKey: 'companyId',
        as: 'payrolls',
        onDelete: 'CASCADE'
      });

      // Company has many PayrollDetails
      Company.hasMany(models.PayrollDetail, {
        foreignKey: 'companyId',
        as: 'payrollDetails',
        onDelete: 'CASCADE'
      });

      // Company has many PayrollAdjustments
      Company.hasMany(models.PayrollAdjustment, {
        foreignKey: 'companyId',
        as: 'payrollAdjustments',
        onDelete: 'CASCADE'
      });

      // Company has many PayrollHistories
      Company.hasMany(models.PayrollHistory, {
        foreignKey: 'companyId',
        as: 'payrollHistories',
        onDelete: 'CASCADE'
      });

      // Company has many TaxSettings
      Company.hasMany(models.TaxSetting, {
        foreignKey: 'companyId',
        as: 'taxSettings',
        onDelete: 'CASCADE'
      });

      // Company has many BPJSSettings
      Company.hasMany(models.BPJSSetting, {
        foreignKey: 'companyId',
        as: 'bpjsSettings',
        onDelete: 'CASCADE'
      });
    }
  }

  Company.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Company name cannot be empty'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Company slug already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Company slug cannot be empty'
        },
        isLowercase: {
          msg: 'Slug must be lowercase'
        },
        is: {
          args: /^[a-z0-9-]+$/,
          msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
        }
      }
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taxIdentificationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Employee count cannot be negative'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    subscriptionPlan: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'basic'
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Company',
  });

  return Company;
};
