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
 * ============================================
 * ADVANCED REPORT ROUTES
 * ============================================
 */

// Get report metadata (untuk preview)
router.get('/metadata', reportController.getReportMetadata);

// A. Attendance Report (most used)
router.get('/attendance', reportController.getAttendanceReport);

// B. Monthly Recap Report (for payroll)
router.get('/monthly-recap', reportController.getMonthlyRecapReport);

// C. Overtime Report
router.get('/overtime', reportController.getOvertimeReport);

// D. Leave Report
router.get('/leave', reportController.getLeaveReport);

// E. Payroll Support Report
router.get('/payroll-support', reportController.getPayrollSupportReport);

// F. Location & GPS Report (Premium)
router.get('/location-gps', reportController.getLocationGPSReport);

// G. Audit Log Report (Enterprise)
router.get('/audit-log', reportController.getAuditLogReport);

// H. Compliance / Violation Report
router.get('/compliance', reportController.getComplianceReport);

/**
 * ============================================
 * LEGACY EXPORT ROUTES (Keep for backward compatibility)
 * ============================================
 */

// Export attendance to Excel (legacy)
router.get('/export/excel', reportController.exportAttendanceExcel);

// Export attendance to CSV (legacy)
router.get('/export/csv', reportController.exportAttendanceCSV);

// Generate monthly report (legacy)
router.get('/monthly', reportController.generateMonthlyReport);

// Get report preview (JSON) (legacy)
router.get('/preview', reportController.getReportPreview);

// Get employee performance report (legacy)
router.get('/employee-performance', reportController.getEmployeePerformanceReport);

module.exports = router;
