const express = require('express');
const router = express.Router();
const OvertimeAdminController = require('../controllers/overtimeAdminController');

// Admin routes (admin only)

// Get pending requests count (for notifications)
router.get('/pending-count', OvertimeAdminController.getPendingCount);

// Get all overtime requests (with filters)
router.get('/requests', OvertimeAdminController.getAllOvertimeRequests);

// Get overtime summary (with period filter)
router.get('/summary', OvertimeAdminController.getOvertimeSummary);

// Approve overtime request
router.patch('/:id/approve', OvertimeAdminController.approveOvertime);

// Reject overtime request
router.patch('/:id/reject', OvertimeAdminController.rejectOvertime);

module.exports = router;
