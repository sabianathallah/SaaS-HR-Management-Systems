'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayrollComponent extends Model {
    static associate(models) {
      // PayrollComponent has many EmployeeSalaryComponents
      PayrollComponent.hasMany(models.EmployeeSalaryComponent, {
        foreignKey: 'PayrollComponentId',
        as: 'employeeComponents',
        onDelete: 'CASCADE'
      });

      // PayrollComponent has many PayrollDetails
      PayrollComponent.hasMany(models.PayrollDetail, {
        foreignKey: 'PayrollComponentId',
        as: 'payrollDetails',
        onDelete: 'SET NULL'
      });
    }
  }

  PayrollComponent.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Component code cannot be empty'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Component name cannot be empty'
        }
      }
    },
    type: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['earning', 'deduction']],
          msg: 'Type must be either earning or deduction'
        }
      }
    },
    calculationType: {
      type: DataTypes.ENUM('fixed', 'percentage', 'custom'),
      allowNull: false,
      defaultValue: 'fixed'
    },
    defaultAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Default amount cannot be negative'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isSystemGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PayrollComponent',
    tableName: 'PayrollComponents'
  });

  return PayrollComponent;
};
