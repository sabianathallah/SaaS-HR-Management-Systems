const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authentication');
const isAdmin = require('../middlewares/authorization');

/**
 * All routes require authentication and admin role
 */
router.use(authenticateToken);
router.use(isAdmin);

/**
 * Export Routes
 */

// Export attendance to Excel
router.get('/export/excel', reportController.exportAttendanceExcel);

// Export attendance to CSV
router.get('/export/csv', reportController.exportAttendanceCSV);

/**
 * Report Routes
 */

// Generate monthly report
router.get('/monthly', reportController.generateMonthlyReport);

// Get report preview (JSON)
router.get('/preview', reportController.getReportPreview);

// Get employee performance report
router.get('/employee-performance', reportController.getEmployeePerformanceReport);

module.exports = router;
