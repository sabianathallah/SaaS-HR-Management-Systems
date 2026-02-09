const { Payroll, PayrollPeriod, PayrollDetail, User } = require('../models');
const { Op } = require('sequelize');

class PayrollController {
  /**
   * Get employee's own payslips
   */
  static async getMyPayslips(req, res, next) {
    try {
      const userId = req.user.id;
      const { year, status, page = 1, limit = 12 } = req.query;

      const where = { UserId: userId };
      
      if (status) {
        where.status = status;
      }

      // Join with period to filter by year
      const include = [{
        model: PayrollPeriod,
        as: 'period',
        where: {},
        required: true
      }];

      if (year) {
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);
        include[0].where.periodStart = {
          [Op.between]: [yearStart, yearEnd]
        };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Payroll.findAndCountAll({
        where,
        include,
        order: [[{ model: PayrollPeriod, as: 'period' }, 'periodStart', 'DESC']],
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
   * Get payslip detail
   */
  static async getPayslipDetail(req, res, next) {
    try {
      const { payslipId } = req.params;
      const userId = req.user.id;

      const payroll = await Payroll.findOne({
        where: {
          id: payslipId,
          UserId: userId // Ensure employee can only see their own
        },
        include: [
          {
            model: PayrollPeriod,
            as: 'period'
          },
          {
            model: PayrollDetail,
            as: 'details',
            order: [['componentType', 'ASC'], ['componentName', 'ASC']]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found'
        });
      }

      // Group details by type
      const earnings = payroll.details.filter(d => d.componentType === 'earning');
      const deductions = payroll.details.filter(d => d.componentType === 'deduction');

      const response = {
        ...payroll.toJSON(),
        groupedDetails: {
          earnings,
          deductions
        }
      };

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download payslip PDF/HTML
   */
  static async downloadPayslip(req, res, next) {
    try {
      const { payslipId } = req.params;
      const userId = req.user.id;

      const payroll = await Payroll.findOne({
        where: {
          id: payslipId,
          UserId: userId
        }
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found'
        });
      }

      if (!payroll.payslipUrl) {
        return res.status(404).json({
          success: false,
          message: 'Payslip file not generated yet'
        });
      }

      // Return the URL (frontend can open it in new tab or download)
      res.status(200).json({
        success: true,
        data: {
          payslipUrl: payroll.payslipUrl,
          employeeName: payroll.employeeName,
          periodName: payroll.period?.periodName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment proof/receipt
   */
  static async getPaymentProof(req, res, next) {
    try {
      const { payslipId } = req.params;
      const userId = req.user.id;

      const payroll = await Payroll.findOne({
        where: {
          id: payslipId,
          UserId: userId
        }
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found'
        });
      }

      if (payroll.status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Payment has not been completed yet'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          paymentProofUrl: payroll.paymentProofUrl,
          paidAt: payroll.paidAt,
          midtransReferenceId: payroll.midtransReferenceId,
          amount: payroll.netSalary,
          bankName: payroll.bankName,
          bankAccountNumber: payroll.bankAccountNumber
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payslip summary (for dashboard)
   */
  static async getPayslipSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const currentYear = new Date().getFullYear();

      // Get latest payslip
      const latestPayslip = await Payroll.findOne({
        where: { UserId: userId },
        include: [{ model: PayrollPeriod, as: 'period' }],
        order: [[{ model: PayrollPeriod, as: 'period' }, 'periodStart', 'DESC']]
      });

      // Get year-to-date totals
      const yearStart = new Date(`${currentYear}-01-01`);
      const ytdPayslips = await Payroll.findAll({
        where: { UserId: userId },
        include: [{
          model: PayrollPeriod,
          as: 'period',
          where: {
            periodStart: { [Op.gte]: yearStart }
          },
          required: true
        }]
      });

      const ytdGross = ytdPayslips.reduce((sum, p) => sum + parseFloat(p.totalEarnings || 0), 0);
      const ytdNet = ytdPayslips.reduce((sum, p) => sum + parseFloat(p.netSalary || 0), 0);
      const ytdTax = ytdPayslips.reduce((sum, p) => sum + parseFloat(p.incomeTax || 0), 0);
      const ytdBPJS = ytdPayslips.reduce((sum, p) => 
        sum + parseFloat(p.bpjsHealthEmployee || 0) + parseFloat(p.bpjsEmploymentEmployee || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          latestPayslip: latestPayslip ? {
            id: latestPayslip.id,
            periodName: latestPayslip.period?.periodName,
            grossSalary: parseFloat(latestPayslip.totalEarnings),
            netSalary: parseFloat(latestPayslip.netSalary),
            status: latestPayslip.status,
            paidAt: latestPayslip.paidAt
          } : null,
          yearToDate: {
            year: currentYear,
            totalMonths: ytdPayslips.length,
            totalGross: Math.round(ytdGross),
            totalNet: Math.round(ytdNet),
            totalTax: Math.round(ytdTax),
            totalBPJS: Math.round(ytdBPJS),
            averageGross: ytdPayslips.length > 0 ? Math.round(ytdGross / ytdPayslips.length) : 0,
            averageNet: ytdPayslips.length > 0 ? Math.round(ytdNet / ytdPayslips.length) : 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PayrollController;
