'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaxSetting extends Model {
    static associate(models) {
      TaxSetting.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    }
  }

  TaxSetting.init({
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [2000],
          msg: 'Year must be 2000 or later'
        }
      }
    },
    ptkpStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'PTKP status cannot be empty'
        }
      }
    },
    ptkpAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'PTKP amount cannot be negative'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
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
    }
  }, {
    sequelize,
    modelName: 'TaxSetting',
    tableName: 'TaxSettings'
  });

  return TaxSetting;
};
