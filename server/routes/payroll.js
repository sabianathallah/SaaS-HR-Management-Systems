const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payrollController');

// Employee payslips
router.get('/my-payslips', PayrollController.getMyPayslips);
router.get('/my-payslips/summary', PayrollController.getPayslipSummary);
router.get('/my-payslips/:payslipId', PayrollController.getPayslipDetail);
router.get('/my-payslips/:payslipId/download', PayrollController.downloadPayslip);
router.get('/my-payslips/:payslipId/payment-proof', PayrollController.getPaymentProof);

module.exports = router;
