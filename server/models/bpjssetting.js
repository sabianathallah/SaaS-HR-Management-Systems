'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BPJSSetting extends Model {
    static associate(models) {
      BPJSSetting.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    }
  }

  BPJSSetting.init({
    type: {
      type: DataTypes.ENUM('kesehatan', 'ketenagakerjaan_jkk', 'ketenagakerjaan_jkm', 'ketenagakerjaan_jht', 'ketenagakerjaan_jp'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        }
      }
    },
    employeePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Employee percentage cannot be negative'
        },
        max: {
          args: [100],
          msg: 'Employee percentage cannot exceed 100%'
        }
      }
    },
    companyPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Company percentage cannot be negative'
        },
        max: {
          args: [100],
          msg: 'Company percentage cannot exceed 100%'
        }
      }
    },
    maxSalaryBase: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    minSalaryBase: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Companies', key: 'id' }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BPJSSetting',
    tableName: 'BPJSSettings'
  });

  return BPJSSetting;
};
