const express = require('express');
const router = express.Router();
const WorkLocationChangeRequestController = require('../controllers/workLocationChangeRequestController');

// Employee endpoints
router.post('/', WorkLocationChangeRequestController.createRequest);
router.get('/', WorkLocationChangeRequestController.getOwnRequests);
router.patch('/:id/cancel', WorkLocationChangeRequestController.cancelRequest);

module.exports = router;
