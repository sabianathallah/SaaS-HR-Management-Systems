'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayrollDetail extends Model {
    static associate(models) {
      // PayrollDetail belongs to Payroll
      PayrollDetail.belongsTo(models.Payroll, {
        foreignKey: 'PayrollId',
        as: 'payroll',
        onDelete: 'CASCADE'
      });

      // PayrollDetail belongs to PayrollComponent
      PayrollDetail.belongsTo(models.PayrollComponent, {
        foreignKey: 'PayrollComponentId',
        as: 'component',
        onDelete: 'SET NULL'
      });
    }
  }

  PayrollDetail.init({
    PayrollId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PayrollComponentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    componentCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    componentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    componentType: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    calculationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PayrollDetail',
    tableName: 'PayrollDetails'
  });

  return PayrollDetail;
};
