const { AuditLog } = require('../models');

/**
 * Helper untuk mencatat audit log
 * Digunakan di controller untuk tracking manual actions
 */
class AuditLogger {
  /**
   * Catat audit log
   * @param {Object} options - Audit log options
   * @param {number} options.userId - ID user yang melakukan aksi
   * @param {string} options.action - Action type (CREATE, UPDATE, DELETE, etc)
   * @param {string} options.tableName - Nama tabel yang diubah
   * @param {number} options.recordId - ID record yang diubah
   * @param {Object} options.oldData - Data sebelum perubahan
   * @param {Object} options.newData - Data sesudah perubahan
   * @param {string} options.ipAddress - IP address user
   * @param {string} options.userAgent - User agent info
   * @param {string} options.description - Deskripsi tambahan
   * @returns {Promise<AuditLog>}
   */
  static async log({
    userId,
    action,
    tableName,
    recordId,
    oldData = null,
    newData = null,
    ipAddress = null,
    userAgent = null,
    description = null
  }) {
    try {
      // Calculate changes if both oldData and newData exist
      let changes = null;
      if (oldData && newData) {
        changes = this.calculateChanges(oldData, newData);
      }

      const auditLog = await AuditLog.create({
        userId,
        action,
        tableName,
        recordId,
        oldData,
        newData,
        changes,
        ipAddress,
        userAgent,
        description
      });

      return auditLog;
    } catch (error) {
      // Log error tapi jangan break aplikasi
      console.error('❌ Error creating audit log:', error);
      return null;
    }
  }

  /**
   * Shortcut untuk log CREATE action
   */
  static async logCreate({ userId, tableName, recordId, newData, req }) {
    return this.log({
      userId,
      action: 'CREATE',
      tableName,
      recordId,
      newData: this.sanitizeData(newData),
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description: `Created new ${tableName} record`
    });
  }

  /**
   * Shortcut untuk log UPDATE action
   */
  static async logUpdate({ userId, tableName, recordId, oldData, newData, req }) {
    return this.log({
      userId,
      action: 'UPDATE',
      tableName,
      recordId,
      oldData: this.sanitizeData(oldData),
      newData: this.sanitizeData(newData),
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description: `Updated ${tableName} record`
    });
  }

  /**
   * Shortcut untuk log DELETE action
   */
  static async logDelete({ userId, tableName, recordId, oldData, req }) {
    return this.log({
      userId,
      action: 'DELETE',
      tableName,
      recordId,
      oldData: this.sanitizeData(oldData),
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description: `Deleted ${tableName} record`
    });
  }

  /**
   * Shortcut untuk log LOGIN action
   */
  static async logLogin({ userId, req, description = 'User logged in' }) {
    return this.log({
      userId,
      action: 'LOGIN',
      tableName: 'Users',
      recordId: userId,
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description
    });
  }

  /**
   * Shortcut untuk log LOGOUT action
   */
  static async logLogout({ userId, req, description = 'User logged out' }) {
    return this.log({
      userId,
      action: 'LOGOUT',
      tableName: 'Users',
      recordId: userId,
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description
    });
  }

  /**
   * Shortcut untuk log APPROVE action
   */
  static async logApprove({ userId, tableName, recordId, oldData, newData, req, description }) {
    return this.log({
      userId,
      action: 'APPROVE',
      tableName,
      recordId,
      oldData: this.sanitizeData(oldData),
      newData: this.sanitizeData(newData),
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description: description || `Approved ${tableName} record`
    });
  }

  /**
   * Shortcut untuk log REJECT action
   */
  static async logReject({ userId, tableName, recordId, oldData, newData, req, description }) {
    return this.log({
      userId,
      action: 'REJECT',
      tableName,
      recordId,
      oldData: this.sanitizeData(oldData),
      newData: this.sanitizeData(newData),
      ipAddress: this.getIpAddress(req),
      userAgent: this.getUserAgent(req),
      description: description || `Rejected ${tableName} record`
    });
  }

  /**
   * Calculate changes between old and new data
   * @param {Object} oldData 
   * @param {Object} newData 
   * @returns {Object} Changes object
   */
  static calculateChanges(oldData, newData) {
    const changes = {};
    
    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {})
    ]);

    for (const key of allKeys) {
      const oldValue = oldData?.[key];
      const newValue = newData?.[key];

      // Skip if values are the same
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }

      // Skip sensitive fields
      if (this.isSensitiveField(key)) {
        changes[key] = {
          from: '***REDACTED***',
          to: '***REDACTED***'
        };
        continue;
      }

      changes[key] = {
        from: oldValue,
        to: newValue
      };
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Sanitize data - remove sensitive information
   * @param {Object} data 
   * @returns {Object}
   */
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Check if field is sensitive
   * @param {string} fieldName 
   * @returns {boolean}
   */
  static isSensitiveField(fieldName) {
    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken'];
    return sensitiveFields.includes(fieldName);
  }

  /**
   * Get IP address from request
   * @param {Object} req - Express request object
   * @returns {string|null}
   */
  static getIpAddress(req) {
    if (!req) return null;

    // 1. Try Express req.ip (works with trust proxy enabled)
    if (req.ip) {
      // Remove ::ffff: prefix from IPv6-mapped IPv4 addresses
      return req.ip.replace(/^::ffff:/, '');
    }

    // 2. Try x-forwarded-for header (for proxies/load balancers)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      // We want the first one (client IP)
      const ips = forwarded.split(',');
      return ips[0].trim();
    }

    // 3. Try x-real-ip header (used by some proxies like Nginx)
    if (req.headers['x-real-ip']) {
      return req.headers['x-real-ip'];
    }

    // 4. Fallback to connection remote address
    if (req.connection?.remoteAddress) {
      return req.connection.remoteAddress.replace(/^::ffff:/, '');
    }

    // 5. Fallback to socket remote address
    if (req.socket?.remoteAddress) {
      return req.socket.remoteAddress.replace(/^::ffff:/, '');
    }

    return null;
  }

  /**
   * Get User Agent from request
   * @param {Object} req - Express request object
   * @returns {string|null}
   */
  static getUserAgent(req) {
    if (!req) return null;
    return req.headers['user-agent'] || null;
  }

  /**
   * Get audit logs with filters
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  static async getAuditLogs(filters = {}) {
    const where = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.tableName) where.tableName = filters.tableName;
    if (filters.recordId) where.recordId = filters.recordId;

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt[Op.gte] = filters.startDate;
      if (filters.endDate) where.createdAt[Op.lte] = filters.endDate;
    }

    const logs = await AuditLog.findAll({
      where,
      include: [{
        model: require('../models').User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 100,
      offset: filters.offset || 0
    });

    return logs;
  }
}

module.exports = AuditLogger;
