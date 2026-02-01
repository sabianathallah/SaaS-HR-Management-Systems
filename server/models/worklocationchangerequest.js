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

// Define request status constants
const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

module.exports = (sequelize, DataTypes) => {
  class WorkLocationChangeRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // WorkLocationChangeRequest belongs to User (requester)
      WorkLocationChangeRequest.belongsTo(models.User, { 
        foreignKey: 'UserId',
        as: 'employee'
      });

      // WorkLocationChangeRequest belongs to User (approver)
      WorkLocationChangeRequest.belongsTo(models.User, { 
        foreignKey: 'approvedBy',
        as: 'approver'
      });
    }
  }
  WorkLocationChangeRequest.init({
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
    requestDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Request date cannot be empty'
        },
        isDate: {
          msg: 'Request date must be a valid date'
        }
      }
    },
    originalLocationType: {
      type: DataTypes.ENUM(
        LOCATION_TYPE.ONSITE,
        LOCATION_TYPE.WFH,
        LOCATION_TYPE.REMOTE
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Original location type cannot be empty'
        }
      }
    },
    requestedLocationType: {
      type: DataTypes.ENUM(
        LOCATION_TYPE.ONSITE,
        LOCATION_TYPE.WFH,
        LOCATION_TYPE.REMOTE
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Requested location type cannot be empty'
        }
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reason cannot be empty'
        },
        len: {
          args: [10, 500],
          msg: 'Reason must be between 10 and 500 characters'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.APPROVED,
        REQUEST_STATUS.REJECTED,
        REQUEST_STATUS.CANCELLED
      ),
      allowNull: false,
      defaultValue: REQUEST_STATUS.PENDING
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Rejection reason must not exceed 500 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'WorkLocationChangeRequest',
    tableName: 'WorkLocationChangeRequests',
    indexes: [
      {
        fields: ['UserId', 'requestDate'],
        name: 'user_request_date_idx'
      },
      {
        fields: ['status'],
        name: 'status_idx'
      }
    ]
  });
  
  // Export constants for use in controllers
  WorkLocationChangeRequest.LOCATION_TYPE = LOCATION_TYPE;
  WorkLocationChangeRequest.REQUEST_STATUS = REQUEST_STATUS;
  
  return WorkLocationChangeRequest;
};