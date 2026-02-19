const {
  PayrollPeriod,
  Payroll,
  PayrollDetail,
  PayrollAdjustment,
  PayrollHistory,
  User,
  PayrollComponent,
  EmployeeSalaryComponent
} = require('../models');
const { Op } = require('sequelize');
const PayrollCalculationService = require('../helpers/payrollCalculation');
const PayslipGeneratorService = require('../helpers/payslipGenerator');
const MidtransService = require('../helpers/midtransService');
const AuditLogger = require('../helpers/auditLogger');

class PayrollAdminController {
  /**
   * Get all payroll periods
   */
  static async getPayrollPeriods(req, res, next) {
    try {
      const { status, year, page = 1, limit = 10 } = req.query;

      const where = {};
      where.companyId = req.user.companyId;
      if (status) where.status = status;
      if (year) {
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);
        where.periodStart = { [Op.between]: [yearStart, yearEnd] };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await PayrollPeriod.findAndCountAll({
        where,
        include: [
          { model: User, as: 'generator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'processor', attributes: ['id', 'name', 'email'] }
        ],
        order: [['periodStart', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new payroll period
   */
  static async createPayrollPeriod(req, res, next) {
    try {
      const { periodName, periodStart, periodEnd, cutoffDate, paymentDate, notes } = req.body;

      // Validate dates
      if (new Date(periodEnd) <= new Date(periodStart)) {
        return res.status(400).json({
          success: false,
          message: 'Period end must be after period start'
        });
      }

      // Check for overlapping periods
      const overlapping = await PayrollPeriod.findOne({
        where: {
          [Op.or]: [
            {
              periodStart: { [Op.between]: [periodStart, periodEnd] }
            },
            {
              periodEnd: { [Op.between]: [periodStart, periodEnd] }
            },
            {
              [Op.and]: [
                { periodStart: { [Op.lte]: periodStart } },
                { periodEnd: { [Op.gte]: periodEnd } }
              ]
            }
          ],
          status: { [Op.ne]: 'cancelled' },
          companyId: req.user.companyId
        }
      });

      if (overlapping) {
        return res.status(400).json({
          success: false,
          message: 'A payroll period already exists for this date range'
        });
      }

      const period = await PayrollPeriod.create({
        periodName,
        periodStart,
        periodEnd,
        cutoffDate,
        paymentDate,
        notes,
        status: 'draft',
        generatedBy: req.user.id,
        companyId: req.user.companyId
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_period_created',
        description: `Created payroll period: ${periodName}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        message: 'Payroll period created successfully',
        data: period
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate payrolls for a period
   */
  static async generatePayrolls(req, res, next) {
    try {
      const { periodId } = req.params;

      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Payroll period not found'
        });
      }

      if (period.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Can only generate payrolls for draft periods'
        });
      }

      // Get all active employees
      const employees = await User.findAll({
        where: {
          isActive: true,
          role: { [Op.ne]: 'SUPERADMIN' }, // Exclude superadmin
          companyId: req.user.companyId
        }
      });

      const generatedPayrolls = [];
      const errors = [];
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const employee of employees) {
        try {
          // Calculate payroll
          const calculation = await PayrollCalculationService.calculateEmployeePayroll(
            employee.id,
            period.periodStart,
            period.periodEnd
          );

          // Create payroll record
          const payroll = await Payroll.create({
            PayrollPeriodId: period.id,
            UserId: employee.id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            employeePosition: employee.position,
            employeeDepartment: employee.department,
            employmentStatus: employee.employmentStatus,
            baseSalary: calculation.salary.base,
            workingDays: calculation.salary.workingDays,
            totalDaysInPeriod: calculation.salary.totalDaysInPeriod,
            proratedSalary: calculation.salary.proratedSalary,
            overtimeHours: calculation.overtime.hours,
            overtimePay: calculation.overtime.pay,
            totalAllowances: calculation.allowances,
            totalBonuses: calculation.bonuses,
            thr: calculation.thr,
            totalEarnings: calculation.gross,
            bpjsHealthEmployee: calculation.deductions.bpjsHealthEmployee,
            bpjsHealthCompany: calculation.deductions.bpjsHealthCompany,
            bpjsEmploymentEmployee: calculation.deductions.bpjsEmploymentEmployee,
            bpjsEmploymentCompany: calculation.deductions.bpjsEmploymentCompany,
            incomeTax: calculation.deductions.incomeTax,
            otherDeductions: calculation.deductions.other,
            totalDeductions: calculation.deductions.total,
            netSalary: calculation.net,
            bankName: employee.bankName,
            bankAccountNumber: employee.bankAccountNumber,
            bankAccountHolderName: employee.bankAccountHolderName,
            status: 'draft',
            companyId: req.user.companyId
          });

          // Create payroll details
          const details = [];
          
          // Add base salary detail
          details.push({
            PayrollId: payroll.id,
            componentCode: 'BASE_SALARY',
            componentName: 'Gaji Pokok',
            componentType: 'earning',
            amount: calculation.salary.proratedSalary,
            calculationNotes: `${calculation.salary.workingDays} hari dari ${calculation.salary.totalDaysInPeriod} hari`
          });

          // Add overtime if any
          if (calculation.overtime.pay > 0) {
            details.push({
              PayrollId: payroll.id,
              componentCode: 'OVERTIME_PAY',
              componentName: 'Uang Lembur',
              componentType: 'earning',
              amount: calculation.overtime.pay,
              calculationNotes: `${calculation.overtime.hours} jam @ 1% gaji pokok`
            });
          }

          // Add component details
          for (const comp of calculation.details.components) {
            details.push({
              PayrollId: payroll.id,
              PayrollComponentId: comp.componentId,
              componentCode: comp.code,
              componentName: comp.name,
              componentType: comp.type,
              amount: comp.amount
            });
          }

          // Add BPJS details
          if (calculation.deductions.bpjsHealthEmployee > 0) {
            details.push({
              PayrollId: payroll.id,
              componentCode: 'BPJS_HEALTH_EMP',
              componentName: 'BPJS Kesehatan (Karyawan)',
              componentType: 'deduction',
              amount: calculation.deductions.bpjsHealthEmployee
            });
          }

          if (calculation.deductions.bpjsEmploymentEmployee > 0) {
            details.push({
              PayrollId: payroll.id,
              componentCode: 'BPJS_EMPLOYMENT_EMP',
              componentName: 'BPJS Ketenagakerjaan (Karyawan)',
              componentType: 'deduction',
              amount: calculation.deductions.bpjsEmploymentEmployee
            });
          }

          // Add tax detail
          if (calculation.deductions.incomeTax > 0) {
            details.push({
              PayrollId: payroll.id,
              componentCode: 'INCOME_TAX',
              componentName: 'PPh 21',
              componentType: 'deduction',
              amount: calculation.deductions.incomeTax,
              calculationNotes: `PTKP: ${calculation.details.tax.ptkpStatus}`
            });
          }

          await PayrollDetail.bulkCreate(details);

          // Log history
          await PayrollHistory.create({
            PayrollId: payroll.id,
            PayrollPeriodId: period.id,
            action: 'generated',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            notes: 'Payroll generated automatically'
          });

          generatedPayrolls.push(payroll);
          totalGross += calculation.gross;
          totalDeductions += calculation.deductions.total;
          totalNet += calculation.net;

        } catch (error) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.name,
            error: error.message
          });
        }
      }

      // Update period summary
      await period.update({
        status: 'pending_review',
        totalEmployees: generatedPayrolls.length,
        totalGrossSalary: Math.round(totalGross),
        totalDeductions: Math.round(totalDeductions),
        totalNetSalary: Math.round(totalNet),
        generatedAt: new Date()
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_generated',
        description: `Generated ${generatedPayrolls.length} payrolls for period ${period.periodName}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: `Generated ${generatedPayrolls.length} payrolls successfully`,
        data: {
          period,
          totalGenerated: generatedPayrolls.length,
          totalErrors: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payrolls for a period
   */
  static async getPayrollsByPeriod(req, res, next) {
    try {
      const { periodId } = req.params;
      const { status, search, page = 1, limit = 50 } = req.query;

      const where = { PayrollPeriodId: periodId };
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { employeeName: { [Op.like]: `%${search}%` } },
          { employeeEmail: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Payroll.findAndCountAll({
        where,
        include: [
          { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'position', 'department'] },
          { model: PayrollDetail, as: 'details' },
          { model: PayrollAdjustment, as: 'adjustments' }
        ],
        order: [['employeeName', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single payroll detail
   */
  static async getPayrollDetail(req, res, next) {
    try {
      const { payrollId } = req.params;

      const payroll = await Payroll.findByPk(payrollId, {
        include: [
          { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'position', 'department'] },
          { model: PayrollPeriod, as: 'period' },
          { model: PayrollDetail, as: 'details' },
          {
            model: PayrollAdjustment,
            as: 'adjustments',
            include: [
              { model: User, as: 'creator', attributes: ['id', 'name'] },
              { model: User, as: 'approver', attributes: ['id', 'name'] }
            ]
          },
          {
            model: PayrollHistory,
            as: 'histories',
            include: [{ model: User, as: 'performer', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: 'Payroll not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payroll
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add adjustment to payroll
   */
  static async addAdjustment(req, res, next) {
    try {
      const { payrollId } = req.params;
      const { adjustmentType, reason, amount, description, isBackpay, referenceMonth } = req.body;

      const payroll = await Payroll.findByPk(payrollId);
      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: 'Payroll not found'
        });
      }

      if (payroll.status !== 'draft' && payroll.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot adjust payroll that is already approved or processed'
        });
      }

      // Create adjustment
      const adjustment = await PayrollAdjustment.create({
        PayrollId: payroll.id,
        adjustmentType,
        reason,
        amount: parseFloat(amount),
        description,
        isBackpay: isBackpay || false,
        referenceMonth,
        createdBy: req.user.id
      });

      // Recalculate payroll totals
      let newGross = parseFloat(payroll.totalEarnings);
      let newDeductions = parseFloat(payroll.totalDeductions);

      if (adjustmentType === 'earning') {
        newGross += parseFloat(amount);
      } else {
        newDeductions += parseFloat(amount);
      }

      const newNet = newGross - newDeductions;

      await payroll.update({
        totalEarnings: Math.round(newGross),
        totalDeductions: Math.round(newDeductions),
        netSalary: Math.round(newNet),
        otherDeductions: adjustmentType === 'deduction' 
          ? parseFloat(payroll.otherDeductions) + parseFloat(amount)
          : payroll.otherDeductions,
        totalBonuses: adjustmentType === 'earning'
          ? parseFloat(payroll.totalBonuses) + parseFloat(amount)
          : payroll.totalBonuses
      });

      // Log history
      await PayrollHistory.create({
        PayrollId: payroll.id,
        PayrollPeriodId: payroll.PayrollPeriodId,
        action: 'adjusted',
        performedBy: req.user.id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        notes: `Added ${adjustmentType}: ${reason} - ${amount}`,
        metadata: { adjustmentId: adjustment.id }
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_adjusted',
        description: `Added ${adjustmentType} adjustment to payroll for ${payroll.employeeName}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        message: 'Adjustment added successfully',
        data: { adjustment, payroll }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit payroll period for approval
   */
  static async submitForApproval(req, res, next) {
    try {
      const { periodId } = req.params;

      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Payroll period not found'
        });
      }

      if (period.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: 'Can only submit periods with pending_review status'
        });
      }

      // Update all payrolls in this period
      await Payroll.update(
        { status: 'pending' },
        { where: { PayrollPeriodId: period.id, status: 'draft' } }
      );

      await period.update({
        status: 'approved' // Auto-approve for now (can add approval flow later)
      });

      // Log history
      await PayrollHistory.create({
        PayrollPeriodId: period.id,
        action: 'submitted',
        performedBy: req.user.id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        notes: 'Payroll period submitted for approval'
      });

      res.status(200).json({
        success: true,
        message: 'Payroll period submitted successfully',
        data: period
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve payroll period (Finance action)
   */
  static async approvePayroll(req, res, next) {
    try {
      const { periodId } = req.params;
      const { notes } = req.body;

      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Payroll period not found'
        });
      }

      if (period.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          message: 'Only pending_review periods can be approved'
        });
      }

      // Update period
      await period.update({
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        notes: notes || period.notes
      });

      // Update all payrolls
      await Payroll.update(
        { status: 'approved' },
        { where: { PayrollPeriodId: period.id } }
      );

      // Log history
      await PayrollHistory.create({
        PayrollPeriodId: period.id,
        action: 'approved',
        performedBy: req.user.id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        notes: notes || 'Payroll period approved'
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_approved',
        description: `Approved payroll period: ${period.periodName}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Payroll period approved successfully',
        data: period
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process payment via Midtrans (Finance action)
   */
  static async processPayment(req, res, next) {
    try {
      const { periodId } = req.params;

      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Payroll period not found'
        });
      }

      if (period.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Only approved periods can be processed'
        });
      }

      // Get all approved payrolls
      const payrolls = await Payroll.findAll({
        where: {
          PayrollPeriodId: period.id,
          status: 'approved'
        },
        include: [{ model: User, as: 'employee' }]
      });

      if (payrolls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No approved payrolls to process'
        });
      }

      // Prepare batch payout data
      const payoutData = payrolls
        .filter(p => p.bankAccountNumber && p.netSalary > 0)
        .map(p => ({
          employeeId: p.UserId,
          employeeName: p.employeeName,
          amount: parseFloat(p.netSalary),
          accountNumber: p.bankAccountNumber,
          bankName: p.bankName,
          bankCode: this.getBankCode(p.bankName),
          email: p.employeeEmail,
          notes: `Gaji ${period.periodName}`
        }));

      if (payoutData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid bank accounts found for payout'
        });
      }

      // Create batch payout via Midtrans
      const batchResult = await MidtransService.createBatchPayout(
        payoutData,
        `Payroll ${period.periodName}`
      );

      // Update period with batch ID
      await period.update({
        status: 'processing',
        processedBy: req.user.id,
        processedAt: new Date(),
        midtransBatchId: batchResult.batchId
      });

      // Update payrolls with reference IDs
      for (const result of batchResult.results) {
        await Payroll.update(
          {
            status: 'processing',
            midtransReferenceId: result.referenceId
          },
          { where: { UserId: result.employeeId, PayrollPeriodId: period.id } }
        );
      }

      // Log history
      await PayrollHistory.create({
        PayrollPeriodId: period.id,
        action: 'payment_processed',
        performedBy: req.user.id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        notes: `Payment processed via Midtrans. Batch ID: ${batchResult.batchId}`,
        metadata: batchResult
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_payment_processed',
        description: `Processed payment for ${payoutData.length} employees`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Payment processing initiated successfully',
        data: {
          period,
          batchResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Get bank code from bank name
   */
  static getBankCode(bankName) {
    if (!bankName) return 'bca';
    
    const name = bankName.toLowerCase();
    if (name.includes('bca')) return 'bca';
    if (name.includes('mandiri')) return 'mandiri';
    if (name.includes('bni')) return 'bni';
    if (name.includes('bri')) return 'bri';
    if (name.includes('cimb')) return 'cimb';
    if (name.includes('permata')) return 'permata';
    if (name.includes('danamon')) return 'danamon';
    if (name.includes('btn')) return 'btn';
    if (name.includes('mega')) return 'mega';
    if (name.includes('bsi') || name.includes('syariah')) return 'bsi';
    
    return 'bca'; // default
  }

  /**
   * Generate payslips for a period
   */
  static async generatePayslips(req, res, next) {
    try {
      const { periodId } = req.params;

      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) {
        return res.status(404).json({
          success: false,
          message: 'Payroll period not found'
        });
      }

      const payrolls = await Payroll.findAll({
        where: { PayrollPeriodId: period.id },
        include: [
          { model: User, as: 'employee' },
          { model: PayrollDetail, as: 'details' }
        ]
      });

      const payslipResults = [];

      for (const payroll of payrolls) {
        try {
          // Format data for payslip
          const payrollData = {
            employee: {
              id: payroll.UserId,
              name: payroll.employeeName,
              email: payroll.employeeEmail,
              position: payroll.employeePosition,
              department: payroll.employeeDepartment,
              employmentStatus: payroll.employmentStatus,
              bankName: payroll.bankName,
              bankAccountNumber: payroll.bankAccountNumber,
              bankAccountHolderName: payroll.bankAccountHolderName
            },
            salary: {
              base: parseFloat(payroll.baseSalary),
              workingDays: payroll.workingDays,
              totalDaysInPeriod: payroll.totalDaysInPeriod,
              proratedSalary: parseFloat(payroll.proratedSalary)
            },
            overtime: {
              hours: parseFloat(payroll.overtimeHours),
              pay: parseFloat(payroll.overtimePay)
            },
            allowances: parseFloat(payroll.totalAllowances),
            bonuses: parseFloat(payroll.totalBonuses),
            thr: parseFloat(payroll.thr),
            gross: parseFloat(payroll.totalEarnings),
            deductions: {
              bpjsHealthEmployee: parseFloat(payroll.bpjsHealthEmployee),
              bpjsHealthCompany: parseFloat(payroll.bpjsHealthCompany),
              bpjsEmploymentEmployee: parseFloat(payroll.bpjsEmploymentEmployee),
              bpjsEmploymentCompany: parseFloat(payroll.bpjsEmploymentCompany),
              incomeTax: parseFloat(payroll.incomeTax),
              other: parseFloat(payroll.otherDeductions),
              total: parseFloat(payroll.totalDeductions)
            },
            net: parseFloat(payroll.netSalary),
            details: {
              components: payroll.details.map(d => ({
                code: d.componentCode,
                name: d.componentName,
                type: d.componentType,
                amount: parseFloat(d.amount)
              }))
            }
          };

          const periodData = {
            periodName: period.periodName,
            periodStart: period.periodStart,
            periodEnd: period.periodEnd
          };

          const payslipUrl = await PayslipGeneratorService.generatePayslip(payrollData, periodData);

          await payroll.update({ payslipUrl });

          payslipResults.push({
            employeeId: payroll.UserId,
            employeeName: payroll.employeeName,
            payslipUrl,
            success: true
          });
        } catch (error) {
          payslipResults.push({
            employeeId: payroll.UserId,
            employeeName: payroll.employeeName,
            error: error.message,
            success: false
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payslips generated',
        data: payslipResults
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PayrollAdminController;
