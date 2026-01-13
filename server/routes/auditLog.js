const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');

// All routes require admin authorization
// Authorization middleware sudah di-apply di index.js

// IMPORTANT: Urutan route sangat penting!
// Route dengan path spesifik harus di atas, route dengan parameter dinamis di bawah

/**
 * GET /audit-logs/stats
 * Get audit statistics (action count, table count, active users)
 */
router.get('/stats', AuditLogController.getAuditStats);

/**
 * GET /audit-logs/recent
 * Get recent activities (latest audit logs)
 */
router.get('/recent', AuditLogController.getRecentActivities);

/**
 * GET /audit-logs/record/:tableName/:recordId
 * Get audit logs for specific record
 */
router.get('/record/:tableName/:recordId', AuditLogController.getAuditLogsByRecord);

/**
 * GET /audit-logs/user/:userId
 * Get audit logs for specific user
 */
router.get('/user/:userId', AuditLogController.getAuditLogsByUser);

/**
 * GET /audit-logs
 * Get all audit logs with filters
 * Query params: userId, action, tableName, recordId, startDate, endDate, page, limit
 * MUST BE BEFORE /:id route
 */
router.get('/', AuditLogController.getAuditLogs);

/**
 * GET /audit-logs/:id
 * Get single audit log by ID
 * MUST BE LAST to avoid conflicts with other routes
 */
router.get('/:id', AuditLogController.getAuditLogById);

module.exports = router;
