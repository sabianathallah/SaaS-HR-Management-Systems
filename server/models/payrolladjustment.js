'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayrollAdjustment extends Model {
    static associate(models) {
      // PayrollAdjustment belongs to Payroll
      PayrollAdjustment.belongsTo(models.Payroll, {
        foreignKey: 'PayrollId',
        as: 'payroll',
        onDelete: 'CASCADE'
      });

      // PayrollAdjustment belongs to User (createdBy)
      PayrollAdjustment.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator',
        onDelete: 'CASCADE'
      });

      // PayrollAdjustment belongs to User (approvedBy)
      PayrollAdjustment.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver',
        onDelete: 'SET NULL'
      });
    }
  }

  PayrollAdjustment.init({
    PayrollId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    adjustmentType: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reason cannot be empty'
        }
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Amount cannot be negative'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isBackpay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    referenceMonth: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PayrollAdjustment',
    tableName: 'PayrollAdjustments'
  });

  return PayrollAdjustment;
};
