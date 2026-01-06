const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

class AuditLogController {
  /**
   * Get all audit logs with filters and pagination
   * GET /admin/audit-logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const {
        userId,
        action,
        tableName,
        recordId,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // Build where clause
      const where = {};

      if (userId) {
        where.userId = userId;
      }

      if (action) {
        where.action = action;
      }

      if (tableName) {
        where.tableName = tableName;
      }

      if (recordId) {
        where.recordId = recordId;
      }

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      // Pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Query
      const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset
      });

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: {
          auditLogs,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          },
          filters: {
            userId,
            action,
            tableName,
            recordId,
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit log by ID
   * GET /admin/audit-logs/:id
   */
  static async getAuditLogById(req, res, next) {
    try {
      const { id } = req.params;

      const auditLog = await AuditLog.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }]
      });

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Audit log retrieved successfully',
        data: { auditLog }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for specific record
   * GET /admin/audit-logs/record/:tableName/:recordId
   */
  static async getAuditLogsByRecord(req, res, next) {
    try {
      const { tableName, recordId } = req.params;
      const { limit = 100 } = req.query;

      const auditLogs = await AuditLog.findAll({
        where: {
          tableName,
          recordId
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.status(200).json({
        success: true,
        message: `Audit logs for ${tableName} #${recordId} retrieved successfully`,
        data: {
          auditLogs,
          total: auditLogs.length,
          tableName,
          recordId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for specific user
   * GET /admin/audit-logs/user/:userId
   */
  static async getAuditLogsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { 
        page = 1, 
        limit = 50,
        startDate,
        endDate 
      } = req.query;

      // Check if user exists
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Build where clause
      const where = { userId };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // Pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.status(200).json({
        success: true,
        message: `Audit logs for user ${user.name} retrieved successfully`,
        data: {
          user,
          auditLogs,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit statistics
   * GET /admin/audit-logs/stats
   */
  static async getAuditStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // Count by action
      const actionStats = await AuditLog.findAll({
        where,
        attributes: [
          'action',
          [require('sequelize').fn('COUNT', require('sequelize').col('action')), 'count']
        ],
        group: ['action']
      });

      // Count by table
      const tableStats = await AuditLog.findAll({
        where,
        attributes: [
          'tableName',
          [require('sequelize').fn('COUNT', require('sequelize').col('tableName')), 'count']
        ],
        group: ['tableName'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('tableName')), 'DESC']],
        limit: 10
      });

      // Most active users
      const userStats = await AuditLog.findAll({
        where,
        attributes: [
          'userId',
          [require('sequelize').fn('COUNT', require('sequelize').col('userId')), 'count']
        ],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        group: ['userId', 'user.id'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('userId')), 'DESC']],
        limit: 10
      });

      // Total count
      const totalCount = await AuditLog.count({ where });

      res.status(200).json({
        success: true,
        message: 'Audit statistics retrieved successfully',
        data: {
          total: totalCount,
          byAction: actionStats,
          byTable: tableStats,
          mostActiveUsers: userStats,
          dateRange: {
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activities (latest audit logs)
   * GET /admin/audit-logs/recent
   */
  static async getRecentActivities(req, res, next) {
    try {
      const { limit = 20 } = req.query;

      const auditLogs = await AuditLog.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.status(200).json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: {
          activities: auditLogs,
          total: auditLogs.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditLogController;
