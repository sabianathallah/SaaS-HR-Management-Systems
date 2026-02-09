'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaxBracket extends Model {
    static associate(models) {
      // No associations needed for now
    }
  }

  TaxBracket.init({
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
    bracketLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Bracket level must be at least 1'
        }
      }
    },
    minIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Minimum income cannot be negative'
        }
      }
    },
    maxIncome: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Tax rate cannot be negative'
        },
        max: {
          args: [100],
          msg: 'Tax rate cannot exceed 100%'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'TaxBracket',
    tableName: 'TaxBrackets'
  });

  return TaxBracket;
};
