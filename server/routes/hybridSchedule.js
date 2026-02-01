const express = require('express');
const router = express.Router();
const HybridScheduleController = require('../controllers/hybridScheduleController');

// Employee endpoints
router.get('/', HybridScheduleController.getOwnSchedule);
router.put('/', HybridScheduleController.upsertSchedule);
router.delete('/', HybridScheduleController.deleteSchedule);

module.exports = router;
