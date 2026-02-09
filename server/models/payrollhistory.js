'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayrollHistory extends Model {
    static associate(models) {
      // PayrollHistory belongs to Payroll
      PayrollHistory.belongsTo(models.Payroll, {
        foreignKey: 'PayrollId',
        as: 'payroll',
        onDelete: 'CASCADE'
      });

      // PayrollHistory belongs to PayrollPeriod
      PayrollHistory.belongsTo(models.PayrollPeriod, {
        foreignKey: 'PayrollPeriodId',
        as: 'period',
        onDelete: 'CASCADE'
      });

      // PayrollHistory belongs to User (performedBy)
      PayrollHistory.belongsTo(models.User, {
        foreignKey: 'performedBy',
        as: 'performer',
        onDelete: 'CASCADE'
      });
    }
  }

  PayrollHistory.init({
    PayrollId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PayrollPeriodId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action: {
      type: DataTypes.ENUM(
        'created',
        'generated',
        'adjusted',
        'submitted',
        'approved',
        'rejected',
        'payment_processed',
        'payment_success',
        'payment_failed',
        'cancelled'
      ),
      allowNull: false
    },
    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    performedByName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    performedByRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PayrollHistory',
    tableName: 'PayrollHistories'
  });

  return PayrollHistory;
};
