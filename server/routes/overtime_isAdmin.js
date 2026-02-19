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

// Update overtime status (re-approve or re-reject) - MUST BE BEFORE /:id routes
router.patch('/:id/update-status', OvertimeAdminController.updateOvertimeStatus);

// Approve overtime request
router.patch('/:id/approve', OvertimeAdminController.approveOvertime);

// Reject overtime request
router.patch('/:id/reject', OvertimeAdminController.rejectOvertime);

// Delete overtime record
router.delete('/:id', OvertimeAdminController.deleteOvertime);

module.exports = router;
