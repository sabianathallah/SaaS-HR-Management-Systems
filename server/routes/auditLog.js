const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');

// All routes require admin authorization
// Authorization middleware sudah di-apply di index.js

/**
 * GET /admin/audit-logs/stats
 * Get audit statistics (action count, table count, active users)
 */
router.get('/stats', AuditLogController.getAuditStats);

/**
 * GET /admin/audit-logs/recent
 * Get recent activities (latest audit logs)
 */
router.get('/recent', AuditLogController.getRecentActivities);

/**
 * GET /admin/audit-logs/record/:tableName/:recordId
 * Get audit logs for specific record
 */
router.get('/record/:tableName/:recordId', AuditLogController.getAuditLogsByRecord);

/**
 * GET /admin/audit-logs/user/:userId
 * Get audit logs for specific user
 */
router.get('/user/:userId', AuditLogController.getAuditLogsByUser);

/**
 * GET /admin/audit-logs/:id
 * Get single audit log by ID
 */
router.get('/:id', AuditLogController.getAuditLogById);

/**
 * GET /admin/audit-logs
 * Get all audit logs with filters
 * Query params: userId, action, tableName, recordId, startDate, endDate, page, limit
 */
router.get('/', AuditLogController.getAuditLogs);

module.exports = router;
