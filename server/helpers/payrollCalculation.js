const { 
  User, 
  Attendance, 
  Overtime, 
  PayrollComponent, 
  EmployeeSalaryComponent,
  Payroll,
  PayrollDetail,
  PayrollAdjustment
} = require('../models');
const TaxCalculationService = require('./taxCalculation');
const BPJSCalculationService = require('./bpjsCalculation');
const { Op } = require('sequelize');

/**
 * Payroll Calculation Service
 * Core service for calculating employee payroll
 */
class PayrollCalculationService {
  /**
   * Calculate payroll for a single employee for a period
   * @param {number} userId - Employee user ID
   * @param {Date} periodStart - Period start date (21st prev month)
   * @param {Date} periodEnd - Period end date (20th current month)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Payroll calculation result
   */
  static async calculateEmployeePayroll(userId, periodStart, periodEnd, options = {}) {
    try {
      // Get employee data
      const employee = await User.findByPk(userId, {
        attributes: [
          'id', 'name', 'email', 'position', 'department', 
          'employmentStatus', 'baseSalary', 'joinDate', 'leaveDate',
          'maritalStatus', 'numberOfDependents', 'taxIdentificationNumber',
          'bankName', 'bankAccountNumber', 'bankAccountHolderName'
        ]
      });

      if (!employee) {
        throw new Error(`Employee with ID ${userId} not found`);
      }

      if (!employee.baseSalary || parseFloat(employee.baseSalary) === 0) {
        throw new Error(`Employee ${employee.name} has no base salary set`);
      }

      const baseSalary = parseFloat(employee.baseSalary);

      // Calculate working days (with pro-rata if needed)
      const workingDaysData = this.calculateWorkingDays(
        employee,
        periodStart,
        periodEnd
      );

      // Get overtime data
      const overtimeData = await this.calculateOvertimePay(
        userId,
        periodStart,
        periodEnd,
        baseSalary
      );

      // Get employee's allowances and bonuses
      const componentsData = await this.calculateEmployeeComponents(
        userId,
        periodStart,
        periodEnd
      );

      // Calculate THR if applicable
      const thrData = this.calculateTHR(
        employee,
        baseSalary,
        periodStart,
        periodEnd
      );

      // Calculate gross salary (before deductions)
      const grossSalary = 
        workingDaysData.proratedSalary +
        overtimeData.overtimePay +
        componentsData.totalAllowances +
        componentsData.totalBonuses +
        thrData.thrAmount;

      // Calculate BPJS
      const bpjsData = await BPJSCalculationService.calculateBPJS(grossSalary);

      // Calculate Tax (PPh21)
      const taxData = await TaxCalculationService.calculatePPh21(
        grossSalary,
        employee.maritalStatus || 'single',
        employee.numberOfDependents || 0
      );

      // Total deductions
      const totalDeductions = 
        bpjsData.totalEmployee +
        taxData.monthlyTax +
        componentsData.totalDeductions;

      // Net salary (take-home pay)
      const netSalary = grossSalary - totalDeductions;

      // Prepare result
      const result = {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          employmentStatus: employee.employmentStatus,
          bankName: employee.bankName,
          bankAccountNumber: employee.bankAccountNumber,
          bankAccountHolderName: employee.bankAccountHolderName
        },
        period: {
          start: periodStart,
          end: periodEnd
        },
        salary: {
          base: baseSalary,
          workingDays: workingDaysData.workingDays,
          totalDaysInPeriod: workingDaysData.totalDaysInPeriod,
          proratedSalary: Math.round(workingDaysData.proratedSalary)
        },
        overtime: {
          hours: overtimeData.totalHours,
          pay: Math.round(overtimeData.overtimePay)
        },
        allowances: Math.round(componentsData.totalAllowances),
        bonuses: Math.round(componentsData.totalBonuses),
        thr: Math.round(thrData.thrAmount),
        gross: Math.round(grossSalary),
        deductions: {
          bpjsHealthEmployee: Math.round(bpjsData.employee.kesehatan),
          bpjsHealthCompany: Math.round(bpjsData.company.kesehatan),
          bpjsEmploymentEmployee: Math.round(bpjsData.employee.total - bpjsData.employee.kesehatan),
          bpjsEmploymentCompany: Math.round(bpjsData.company.total - bpjsData.company.kesehatan),
          incomeTax: Math.round(taxData.monthlyTax),
          other: Math.round(componentsData.totalDeductions),
          total: Math.round(totalDeductions)
        },
        net: Math.round(netSalary),
        details: {
          components: componentsData.details,
          bpjs: bpjsData,
          tax: taxData
        }
      };

      return result;
    } catch (error) {
      console.error('Error calculating employee payroll:', error);
      throw error;
    }
  }

  /**
   * Calculate working days with pro-rata logic
   * @param {Object} employee - Employee object
   * @param {Date} periodStart - Period start
   * @param {Date} periodEnd - Period end
   * @returns {Object} Working days data
   */
  static calculateWorkingDays(employee, periodStart, periodEnd) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const joinDate = employee.joinDate ? new Date(employee.joinDate) : null;
    const leaveDate = employee.leaveDate ? new Date(employee.leaveDate) : null;

    // Total days in period
    const totalDaysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Determine actual working start/end dates
    let workStart = start;
    let workEnd = end;

    // If employee joined during this period
    if (joinDate && joinDate > start && joinDate <= end) {
      workStart = joinDate;
    }

    // If employee left during this period (resign/PHK)
    if (leaveDate && leaveDate >= start && leaveDate < end) {
      workEnd = leaveDate;
      // Don't pay for days after leave date
    }

    // Calculate working days
    const workingDays = Math.ceil((workEnd - workStart) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate pro-rated salary
    const baseSalary = parseFloat(employee.baseSalary);
    const proratedSalary = (baseSalary / totalDaysInPeriod) * workingDays;

    return {
      totalDaysInPeriod,
      workingDays: Math.max(0, workingDays),
      proratedSalary: Math.max(0, proratedSalary),
      isProrated: workingDays < totalDaysInPeriod
    };
  }

  /**
   * Calculate overtime pay
   * @param {number} userId - Employee ID
   * @param {Date} periodStart - Period start
   * @param {Date} periodEnd - Period end
   * @param {number} baseSalary - Base salary
   * @returns {Promise<Object>} Overtime data
   */
  static async calculateOvertimePay(userId, periodStart, periodEnd, baseSalary) {
    try {
      const overtimes = await Overtime.findAll({
        where: {
          UserId: userId,
          status: 'approved',
          overtimeDate: {
            [Op.between]: [periodStart, periodEnd]
          }
        }
      });

      let totalHours = 0;
      for (const ot of overtimes) {
        totalHours += parseFloat(ot.hours || 0);
      }

      // Overtime rate: 1% of base salary per hour
      const overtimePay = baseSalary * 0.01 * totalHours;

      return {
        totalHours,
        overtimePay,
        count: overtimes.length
      };
    } catch (error) {
      console.error('Error calculating overtime pay:', error);
      return {
        totalHours: 0,
        overtimePay: 0,
        count: 0
      };
    }
  }

  /**
   * Calculate employee-specific components (allowances, bonuses, deductions)
   * @param {number} userId - Employee ID
   * @param {Date} periodStart - Period start
   * @param {Date} periodEnd - Period end
   * @returns {Promise<Object>} Components data
   */
  static async calculateEmployeeComponents(userId, periodStart, periodEnd) {
    try {
      // Get employee's active salary components
      const salaryComponents = await EmployeeSalaryComponent.findAll({
        where: {
          UserId: userId,
          isActive: true,
          effectiveDate: {
            [Op.lte]: periodEnd
          },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: periodStart } }
          ]
        },
        include: [
          {
            model: PayrollComponent,
            as: 'component',
            where: { isActive: true }
          }
        ]
      });

      let totalAllowances = 0;
      let totalBonuses = 0;
      let totalDeductions = 0;
      const details = [];

      for (const sc of salaryComponents) {
        const component = sc.component;
        const amount = parseFloat(sc.amount);

        const detail = {
          componentId: component.id,
          code: component.code,
          name: component.name,
          type: component.type,
          amount
        };

        details.push(detail);

        if (component.type === 'earning') {
          // Categorize earnings
          if (component.code.startsWith('ALLOW_')) {
            totalAllowances += amount;
          } else if (component.code.startsWith('BONUS_')) {
            totalBonuses += amount;
          } else {
            totalAllowances += amount; // Default to allowances
          }
        } else if (component.type === 'deduction') {
          totalDeductions += amount;
        }
      }

      return {
        totalAllowances,
        totalBonuses,
        totalDeductions,
        details
      };
    } catch (error) {
      console.error('Error calculating employee components:', error);
      return {
        totalAllowances: 0,
        totalBonuses: 0,
        totalDeductions: 0,
        details: []
      };
    }
  }

  /**
   * Calculate THR (Tunjangan Hari Raya)
   * Pro-rated for probation employees
   * @param {Object} employee - Employee object
   * @param {number} baseSalary - Base salary
   * @param {Date} periodStart - Period start
   * @param {Date} periodEnd - Period end
   * @returns {Object} THR data
   */
  static calculateTHR(employee, baseSalary, periodStart, periodEnd) {
    // THR is typically paid in specific months (e.g., Ramadan/before Eid)
    // For now, we'll return 0 and can be triggered manually via adjustment
    // Or we can implement automatic THR based on month

    const currentMonth = new Date(periodEnd).getMonth(); // 0-11
    const isTHRMonth = false; // Set to true for specific months (e.g., month 3 for April/Ramadan)

    if (!isTHRMonth) {
      return { thrAmount: 0, isProrated: false };
    }

    // If employee is on probation, calculate pro-rated THR
    if (employee.employmentStatus === 'probation' && employee.joinDate) {
      const joinDate = new Date(employee.joinDate);
      const now = new Date(periodEnd);
      const monthsWorked = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                          (now.getMonth() - joinDate.getMonth());

      // Pro-rated THR (1 month salary * months worked / 12)
      const thrAmount = baseSalary * (monthsWorked / 12);

      return {
        thrAmount,
        isProrated: true,
        monthsWorked
      };
    }

    // Full THR for permanent employees
    return {
      thrAmount: isTHRMonth ? baseSalary : 0,
      isProrated: false
    };
  }

  /**
   * Apply manual adjustments to calculated payroll
   * @param {Object} calculatedPayroll - Calculated payroll data
   * @param {Array} adjustments - Array of adjustments
   * @returns {Object} Adjusted payroll
   */
  static applyAdjustments(calculatedPayroll, adjustments = []) {
    let adjustedGross = calculatedPayroll.gross;
    let adjustedDeductions = calculatedPayroll.deductions.total;

    const adjustmentDetails = [];

    for (const adj of adjustments) {
      const amount = parseFloat(adj.amount);

      if (adj.adjustmentType === 'earning') {
        adjustedGross += amount;
      } else if (adj.adjustmentType === 'deduction') {
        adjustedDeductions += amount;
      }

      adjustmentDetails.push({
        id: adj.id,
        type: adj.adjustmentType,
        reason: adj.reason,
        amount,
        isBackpay: adj.isBackpay,
        referenceMonth: adj.referenceMonth
      });
    }

    const adjustedNet = adjustedGross - adjustedDeductions;

    return {
      ...calculatedPayroll,
      gross: Math.round(adjustedGross),
      deductions: {
        ...calculatedPayroll.deductions,
        total: Math.round(adjustedDeductions)
      },
      net: Math.round(adjustedNet),
      adjustments: adjustmentDetails,
      hasAdjustments: adjustments.length > 0
    };
  }
}

module.exports = PayrollCalculationService;
