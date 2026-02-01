'use strict';
const {
  Model
} = require('sequelize');

// Define location type constants
const LOCATION_TYPE = {
  ONSITE: 'ONSITE',
  WFH: 'WFH',
  REMOTE: 'REMOTE'
};

// Day of week mapping (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const DAY_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

module.exports = (sequelize, DataTypes) => {
  class HybridSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // HybridSchedule belongs to User
      HybridSchedule.belongsTo(models.User, { 
        foreignKey: 'UserId',
        as: 'employee'
      });
    }
  }
  HybridSchedule.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        },
        max: {
          args: [6],
          msg: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        }
      },
      comment: '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday'
    },
    locationType: {
      type: DataTypes.ENUM(
        LOCATION_TYPE.ONSITE,
        LOCATION_TYPE.WFH,
        LOCATION_TYPE.REMOTE
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Location type cannot be empty'
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
    modelName: 'HybridSchedule',
    tableName: 'HybridSchedules',
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'dayOfWeek'],
        name: 'user_day_unique_idx'
      }
    ]
  });
  
  // Export constants for use in controllers
  HybridSchedule.LOCATION_TYPE = LOCATION_TYPE;
  HybridSchedule.DAY_OF_WEEK = DAY_OF_WEEK;
  
  return HybridSchedule;
};