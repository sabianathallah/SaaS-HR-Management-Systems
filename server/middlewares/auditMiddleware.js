const AuditLogger = require('../helpers/auditLogger');

/**
 * Middleware untuk auto-tracking semua perubahan data
 * Install ke model yang ingin di-track
 */
class AuditMiddleware {
  /**
   * Setup audit hooks untuk sebuah model
   * @param {Object} model - Sequelize model
   * @param {Object} options - Configuration options
   */
  static setupHooks(model, options = {}) {
    const {
      excludeFields = ['createdAt', 'updatedAt', 'deletedAt'],
      trackCreate = true,
      trackUpdate = true,
      trackDelete = true
    } = options;

    const modelName = model.name;

    // Hook: After Create
    if (trackCreate) {
      model.addHook('afterCreate', async (instance, hookOptions) => {
        try {
          const userId = this.getUserIdFromTransaction(hookOptions);
          const req = this.getRequestFromTransaction(hookOptions);

          if (!userId) return; // Skip jika tidak ada user context

          const newData = this.filterFields(instance.toJSON(), excludeFields);

          await AuditLogger.logCreate({
            userId,
            tableName: modelName,
            recordId: instance.id,
            newData,
            req
          });
        } catch (error) {
          console.error(`❌ Error in afterCreate hook for ${modelName}:`, error.message);
        }
      });
    }

    // Hook: After Update
    if (trackUpdate) {
      model.addHook('beforeUpdate', async (instance, hookOptions) => {
        // Store previous values before update
        hookOptions.auditPreviousValues = this.filterFields(
          instance._previousDataValues,
          excludeFields
        );
      });

      model.addHook('afterUpdate', async (instance, hookOptions) => {
        try {
          const userId = this.getUserIdFromTransaction(hookOptions);
          const req = this.getRequestFromTransaction(hookOptions);

          if (!userId) return;

          const oldData = hookOptions.auditPreviousValues;
          const newData = this.filterFields(instance.toJSON(), excludeFields);

          // Check if there are actual changes
          const changes = AuditLogger.calculateChanges(oldData, newData);
          if (!changes) return; // Skip jika tidak ada perubahan

          await AuditLogger.logUpdate({
            userId,
            tableName: modelName,
            recordId: instance.id,
            oldData,
            newData,
            req
          });
        } catch (error) {
          console.error(`❌ Error in afterUpdate hook for ${modelName}:`, error.message);
        }
      });
    }

    // Hook: After Delete
    if (trackDelete) {
      model.addHook('beforeDestroy', async (instance, hookOptions) => {
        // Store data before deletion
        hookOptions.auditDeletedData = this.filterFields(
          instance.toJSON(),
          excludeFields
        );
      });

      model.addHook('afterDestroy', async (instance, hookOptions) => {
        try {
          const userId = this.getUserIdFromTransaction(hookOptions);
          const req = this.getRequestFromTransaction(hookOptions);

          if (!userId) return;

          const oldData = hookOptions.auditDeletedData;

          await AuditLogger.logDelete({
            userId,
            tableName: modelName,
            recordId: instance.id,
            oldData,
            req
          });
        } catch (error) {
          console.error(`❌ Error in afterDestroy hook for ${modelName}:`, error.message);
        }
      });
    }
  }

  /**
   * Setup audit hooks untuk multiple models sekaligus
   * @param {Array} models - Array of Sequelize models
   * @param {Object} options - Configuration options
   */
  static setupMultipleHooks(models, options = {}) {
    for (const model of models) {
      this.setupHooks(model, options);
    }
  }

  /**
   * Get userId from transaction or options
   * @param {Object} hookOptions 
   * @returns {number|null}
   */
  static getUserIdFromTransaction(hookOptions) {
    // Check if userId passed through transaction
    if (hookOptions.transaction?.userId) {
      return hookOptions.transaction.userId;
    }

    // Check if userId passed through options
    if (hookOptions.userId) {
      return hookOptions.userId;
    }

    return null;
  }

  /**
   * Get request object from transaction or options
   * @param {Object} hookOptions 
   * @returns {Object|null}
   */
  static getRequestFromTransaction(hookOptions) {
    if (hookOptions.transaction?.req) {
      return hookOptions.transaction.req;
    }

    if (hookOptions.req) {
      return hookOptions.req;
    }

    return null;
  }

  /**
   * Filter out specified fields from data object
   * @param {Object} data 
   * @param {Array} excludeFields 
   * @returns {Object}
   */
  static filterFields(data, excludeFields = []) {
    if (!data) return null;

    const filtered = { ...data };
    
    for (const field of excludeFields) {
      delete filtered[field];
    }

    return filtered;
  }

  /**
   * Create middleware untuk attach userId ke transaction
   * Gunakan ini di Express route handler
   */
  static createTransactionMiddleware() {
    return (req, res, next) => {
      // Attach helper function ke req
      req.createAuditTransaction = async (callback) => {
        const { sequelize } = require('../models');
        
        return await sequelize.transaction(async (t) => {
          // Attach user context to transaction
          t.userId = req.user?.id;
          t.req = req;
          
          return await callback(t);
        });
      };

      next();
    };
  }
}

module.exports = AuditMiddleware;
