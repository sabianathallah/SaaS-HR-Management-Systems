const express = require('express');
const router = express.Router();
const PayrollAdminController = require('../controllers/payrollAdminController');

// Payroll Periods
router.get('/periods', PayrollAdminController.getPayrollPeriods);
router.post('/periods', PayrollAdminController.createPayrollPeriod);
router.post('/periods/:periodId/generate', PayrollAdminController.generatePayrolls);
router.post('/periods/:periodId/submit', PayrollAdminController.submitForApproval);
router.post('/periods/:periodId/approve', PayrollAdminController.approvePayroll);
router.post('/periods/:periodId/process-payment', PayrollAdminController.processPayment);
router.post('/periods/:periodId/generate-payslips', PayrollAdminController.generatePayslips);

// Payrolls
router.get('/periods/:periodId/payrolls', PayrollAdminController.getPayrollsByPeriod);
router.get('/payrolls/:payrollId', PayrollAdminController.getPayrollDetail);
router.post('/payrolls/:payrollId/approve', PayrollAdminController.approveIndividualPayroll);
router.post('/payrolls/:payrollId/adjustments', PayrollAdminController.addAdjustment);
router.delete('/payrolls/:payrollId', PayrollAdminController.deletePayroll);

module.exports = router;
