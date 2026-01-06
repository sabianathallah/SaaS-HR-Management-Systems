'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // AuditLog belongs to User (who performed the action)
      AuditLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    /**
     * Helper method to get formatted changes
     */
    getFormattedChanges() {
      if (!this.changes) return null;
      
      const formatted = [];
      for (const [field, change] of Object.entries(this.changes)) {
        formatted.push({
          field,
          from: change.from,
          to: change.to
        });
      }
      return formatted;
    }

    /**
     * Helper method to check if specific field was changed
     */
    wasFieldChanged(fieldName) {
      return this.changes && this.changes[fieldName] !== undefined;
    }

    /**
     * Get human-readable action description
     */
    getActionDescription() {
      const actionMap = {
        'CREATE': 'dibuat',
        'UPDATE': 'diubah',
        'DELETE': 'dihapus',
        'LOGIN': 'login',
        'LOGOUT': 'logout',
        'APPROVE': 'disetujui',
        'REJECT': 'ditolak',
        'EXPORT': 'diekspor'
      };
      return actionMap[this.action] || this.action;
    }
  }

  AuditLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User yang melakukan aksi (null untuk system action)'
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Action cannot be empty'
        }
      }
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Table name cannot be empty'
        }
      }
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    oldData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Data sebelum perubahan'
    },
    newData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Data sesudah perubahan'
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Summary perubahan per field'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'AuditLogs',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tableName'] },
      { fields: ['recordId'] },
      { fields: ['action'] },
      { fields: ['createdAt'] }
    ]
  });

  return AuditLog;
};
