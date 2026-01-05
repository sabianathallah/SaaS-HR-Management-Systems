const express = require('express');
const router = express.Router();
const OvertimeController = require('../controllers/overtimeController');

// Employee routes (authenticated users)

// Request new overtime
router.post('/request', OvertimeController.requestOvertime);

// Get my overtime requests (with optional status filter)
router.get('/my-requests', OvertimeController.getMyOvertimeRequests);

// Get my overtime history (approved overtimes)
router.get('/my-history', OvertimeController.getMyOvertimeHistory);

// Cancel overtime request (only pending)
router.delete('/:id', OvertimeController.cancelOvertimeRequest);

module.exports = router;
