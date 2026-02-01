const express = require('express');
const router = express.Router();
const WorkLocationChangeRequestAdminController = require('../controllers/workLocationChangeRequestAdminController');

// Admin endpoints
router.get('/', WorkLocationChangeRequestAdminController.getAllRequests);
router.get('/pending', WorkLocationChangeRequestAdminController.getPendingRequests);
router.get('/statistics', WorkLocationChangeRequestAdminController.getStatistics);
router.patch('/:id/approve', WorkLocationChangeRequestAdminController.approveRequest);
router.patch('/:id/reject', WorkLocationChangeRequestAdminController.rejectRequest);

module.exports = router;
