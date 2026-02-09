'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmployeeSalaryComponent extends Model {
    static associate(models) {
      // EmployeeSalaryComponent belongs to User
      EmployeeSalaryComponent.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'employee',
        onDelete: 'CASCADE'
      });

      // EmployeeSalaryComponent belongs to PayrollComponent
      EmployeeSalaryComponent.belongsTo(models.PayrollComponent, {
        foreignKey: 'PayrollComponentId',
        as: 'component',
        onDelete: 'CASCADE'
      });
    }
  }

  EmployeeSalaryComponent.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    PayrollComponentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PayrollComponents',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Amount cannot be negative'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterEffective(value) {
          if (value && this.effectiveDate) {
            if (new Date(value) <= new Date(this.effectiveDate)) {
              throw new Error('End date must be after effective date');
            }
          }
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'EmployeeSalaryComponent',
    tableName: 'EmployeeSalaryComponents'
  });

  return EmployeeSalaryComponent;
};
