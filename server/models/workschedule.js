'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // WorkSchedule has many Attendances
      WorkSchedule.hasMany(models.Attendance, { 
        foreignKey: 'WorkScheduleId',
        as: 'Attendances'
      });
    }
  }
  WorkSchedule.init({
    workStartTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '09:00',
      validate: {
        notEmpty: {
          msg: 'Work start time cannot be empty'
        }
      }
    },
    workEndTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '17:00',
      validate: {
        notEmpty: {
          msg: 'Work end time cannot be empty'
        }
      }
    },
    autoAbsentTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '18:00',
      validate: {
        notEmpty: {
          msg: 'Auto absent time cannot be empty'
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
    modelName: 'WorkSchedule',
  });
  return WorkSchedule;
};