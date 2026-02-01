const express = require('express');
const router = express.Router();
const HybridScheduleAdminController = require('../controllers/hybridScheduleAdminController');

// Admin endpoints
router.get('/', HybridScheduleAdminController.getAllSchedules);
router.get('/statistics', HybridScheduleAdminController.getStatistics);
router.get('/user/:userId', HybridScheduleAdminController.getScheduleByUserId);
router.put('/user/:userId', HybridScheduleAdminController.upsertScheduleForUser);
router.delete('/user/:userId', HybridScheduleAdminController.deleteScheduleForUser);

module.exports = router;
