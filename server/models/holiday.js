'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Holiday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Holiday has many Attendances (employees who marked as HOLIDAY)
      Holiday.hasMany(models.Attandance, { 
        foreignKey: 'HolidayId',
        as: 'Attendances'
      });
    }
  }
  Holiday.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: {
        msg: 'Holiday date already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Date cannot be empty'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Description cannot be empty'
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
    modelName: 'Holiday',
  });
  return Holiday;
};