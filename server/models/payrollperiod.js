'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayrollPeriod extends Model {
    static associate(models) {
      // PayrollPeriod has many Payrolls
      PayrollPeriod.hasMany(models.Payroll, {
        foreignKey: 'PayrollPeriodId',
        as: 'payrolls',
        onDelete: 'CASCADE'
      });

      // PayrollPeriod has many PayrollHistories
      PayrollPeriod.hasMany(models.PayrollHistory, {
        foreignKey: 'PayrollPeriodId',
        as: 'histories',
        onDelete: 'CASCADE'
      });

      // PayrollPeriod belongs to User (generatedBy)
      PayrollPeriod.belongsTo(models.User, {
        foreignKey: 'generatedBy',
        as: 'generator',
        onDelete: 'SET NULL'
      });

      // PayrollPeriod belongs to User (approvedBy)
      PayrollPeriod.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver',
        onDelete: 'SET NULL'
      });

      // PayrollPeriod belongs to User (processedBy)
      PayrollPeriod.belongsTo(models.User, {
        foreignKey: 'processedBy',
        as: 'processor',
        onDelete: 'SET NULL'
      });
    }
  }

  PayrollPeriod.init({
    periodName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Period name cannot be empty'
        }
      }
    },
    periodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value && this.periodStart) {
            if (new Date(value) <= new Date(this.periodStart)) {
              throw new Error('Period end must be after period start');
            }
          }
        }
      }
    },
    cutoffDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'processing', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft'
    },
    totalEmployees: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total employees cannot be negative'
        }
      }
    },
    totalGrossSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalNetSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    generatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    midtransBatchId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PayrollPeriod',
    tableName: 'PayrollPeriods'
  });

  return PayrollPeriod;
};
