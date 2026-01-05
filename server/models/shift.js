'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Shift has many Users (user dengan shift default ini)
      Shift.hasMany(models.User, { 
        foreignKey: 'ShiftId',
        as: 'users'
      });

      // Shift has many Attendances
      Shift.hasMany(models.Attendance, { 
        foreignKey: 'ShiftId',
        as: 'attendances'
      });
    }
  }
  
  Shift.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Shift name must be unique'
      },
      validate: {
        notEmpty: {
          msg: 'Shift name cannot be empty'
        }
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Start time cannot be empty'
        }
      }
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'End time cannot be empty'
        }
      }
    },
    breakDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: {
          args: [0],
          msg: 'Break duration cannot be negative'
        }
      }
    },
    lateTolerance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      validate: {
        min: {
          args: [0],
          msg: 'Late tolerance cannot be negative'
        }
      }
    },
    overtimeThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      validate: {
        min: {
          args: [0],
          msg: 'Overtime threshold cannot be negative'
        }
      }
    },
    isFlexible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Shift',
    tableName: 'Shifts'
  });
  
  return Shift;
};
