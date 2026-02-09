'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    static associate(models) {
      // Payroll belongs to PayrollPeriod
      Payroll.belongsTo(models.PayrollPeriod, {
        foreignKey: 'PayrollPeriodId',
        as: 'period',
        onDelete: 'CASCADE'
      });

      // Payroll belongs to User (employee)
      Payroll.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'employee',
        onDelete: 'CASCADE'
      });

      // Payroll has many PayrollDetails
      Payroll.hasMany(models.PayrollDetail, {
        foreignKey: 'PayrollId',
        as: 'details',
        onDelete: 'CASCADE'
      });

      // Payroll has many PayrollAdjustments
      Payroll.hasMany(models.PayrollAdjustment, {
        foreignKey: 'PayrollId',
        as: 'adjustments',
        onDelete: 'CASCADE'
      });

      // Payroll has many PayrollHistories
      Payroll.hasMany(models.PayrollHistory, {
        foreignKey: 'PayrollId',
        as: 'histories',
        onDelete: 'CASCADE'
      });
    }
  }

  Payroll.init({
    PayrollPeriodId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeePosition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employeeDepartment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employmentStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    baseSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    workingDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalDaysInPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    proratedSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    overtimePay: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalAllowances: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalBonuses: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    thr: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    bpjsHealthEmployee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    bpjsHealthCompany: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    bpjsEmploymentEmployee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    bpjsEmploymentCompany: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    incomeTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    netSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
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
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'processing', 'paid', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'bank_transfer'
    },
    midtransReferenceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentProofUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payslipUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payroll',
    tableName: 'Payrolls'
  });

  return Payroll;
};
