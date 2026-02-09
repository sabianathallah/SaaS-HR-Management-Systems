const express = require('express');
const router = express.Router();
const PayrollSettingsController = require('../controllers/payrollSettingsController');

// Payroll Components
router.get('/components', PayrollSettingsController.getPayrollComponents);
router.post('/components', PayrollSettingsController.createPayrollComponent);
router.put('/components/:componentId', PayrollSettingsController.updatePayrollComponent);
router.delete('/components/:componentId', PayrollSettingsController.deletePayrollComponent);

// Employee Salary Components
router.get('/employees/:employeeId/components', PayrollSettingsController.getEmployeeSalaryComponents);
router.post('/employees/:employeeId/components', PayrollSettingsController.assignComponentToEmployee);
router.put('/employees/components/:salaryComponentId', PayrollSettingsController.updateEmployeeSalaryComponent);
router.delete('/employees/components/:salaryComponentId', PayrollSettingsController.removeComponentFromEmployee);
router.put('/employees/:employeeId/base-salary', PayrollSettingsController.updateEmployeeBaseSalary);

// Tax Settings
router.get('/tax', PayrollSettingsController.getTaxSettings);
router.put('/tax', PayrollSettingsController.updateTaxSettings);

// BPJS Settings
router.get('/bpjs', PayrollSettingsController.getBPJSSettings);
router.put('/bpjs', PayrollSettingsController.updateBPJSSettings);

module.exports = router;
