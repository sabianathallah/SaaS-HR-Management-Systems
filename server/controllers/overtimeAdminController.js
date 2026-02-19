const { Overtime, User, Attendance, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getDateRangeForPeriod } = require('../helpers/utils');
const notificationHelper = require('../helpers/notificationHelper');
const response = require('../helpers/responseHelper');
const AuditLogger = require('../helpers/auditLogger');

class OvertimeAdminController {

  /**
   * Get all overtime requests (with filters and pagination)
   * GET /overtimes/admin/requests
   */
  static async getAllOvertimeRequests(req, res) {
    try {
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const { status, userId, startDate, endDate } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const whereClause = { ...companyFilter };

      // Filter by status
      if (status) {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
          return response.badRequest(res, 'Invalid status. Must be: pending, approved, or rejected');
        }
        whereClause.status = status;
      }

      // Filter by user
      if (userId) {
        whereClause.UserId = userId;
      }

      // Filter by date range
      if (startDate && endDate) {
        whereClause.overtimeDate = {
          [Op.between]: [
            new Date(startDate),
            new Date(new Date(endDate).setHours(23, 59, 59, 999))
          ]
        };
      }

      const { count: total, rows } = await Overtime.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Attendance,
            as: 'attendance',
            attributes: ['id', 'date', 'clockIn', 'clockOut', 'status']
          }
        ],
        order: [['overtimeDate', 'DESC'], ['createdAt', 'DESC']],
        limit,
        offset
      });

      // Group by status for summary
      const summary = {
        total,
        pending: rows.filter(ot => ot.status === 'pending').length,
        approved: rows.filter(ot => ot.status === 'approved').length,
        rejected: rows.filter(ot => ot.status === 'rejected').length
      };

      const requests = rows.map(ot => ({
        id: ot.id,
        employee: {
          id: ot.employee.id,
          name: ot.employee.name,
          email: ot.employee.email
        },
        overtimeDate: ot.overtimeDate,
        requestedHours: ot.requestedHours,
        actualHours: ot.actualHours,
        reason: ot.reason,
        status: ot.status,
        approver: ot.approver ? {
          id: ot.approver.id,
          name: ot.approver.name
        } : null,
        approvedAt: ot.approvedAt,
        rejectionReason: ot.rejectionReason,
        attendance: ot.attendance,
        createdAt: ot.createdAt
      }));

      return response.ok(res, 'Overtime requests fetched', { requests, summary }, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Approve overtime request
   * PATCH /overtimes/admin/:id/approve
   */
  static async approveOvertime(req, res) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { actualHours } = req.body;
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const overtime = await Overtime.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!overtime) {
        return response.notFound(res, 'Overtime request not found');
      }

      // Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && overtime.companyId !== req.user.companyId) {
        return response.forbidden(res, 'Access denied');
      }

      if (overtime.status !== Overtime.STATUS.PENDING) {
        return response.badRequest(res, `Cannot approve overtime with status: ${overtime.status}`);
      }

      // Validate actual hours if provided
      let finalActualHours = overtime.requestedHours;
      if (actualHours !== undefined) {
        if (actualHours < 0 || actualHours > 12) {
          return response.badRequest(res, 'Actual hours must be between 0 and 12');
        }
        finalActualHours = parseFloat(actualHours);
      }

      const oldSnapshot = overtime.toJSON();

      // Wrap update in transaction
      await sequelize.transaction(async (t) => {
        overtime.status = Overtime.STATUS.APPROVED;
        overtime.actualHours = finalActualHours;
        overtime.approvedBy = adminId;
        overtime.approvedAt = new Date();
        await overtime.save({ transaction: t });
      });

      // Audit log
      await AuditLogger.logUpdate({
        userId: req.user.id,
        tableName: 'Overtimes',
        recordId: overtime.id,
        oldData: oldSnapshot,
        newData: { status: 'APPROVED', actualHours: finalActualHours },
        req,
        description: `Admin approved overtime for user ${overtime.UserId} - ${finalActualHours} hours`
      });

      // Send notification to employee
      await notificationHelper.sendNotification(
        overtime.UserId,
        Notification.NOTIFICATION_TYPE.OVERTIME_APPROVED,
        'Overtime Request Approved',
        `Your overtime request for ${overtime.overtimeDate} has been approved. Approved hours: ${overtime.actualHours} hours.`,
        {
          overtimeId: overtime.id,
          overtimeDate: overtime.overtimeDate,
          requestedHours: overtime.requestedHours,
          actualHours: overtime.actualHours
        },
        true // Send email
      );

      return response.ok(res, 'Overtime approved successfully', {
        id: overtime.id,
        employee: {
          id: overtime.employee.id,
          name: overtime.employee.name,
          email: overtime.employee.email
        },
        overtimeDate: overtime.overtimeDate,
        requestedHours: overtime.requestedHours,
        actualHours: overtime.actualHours,
        status: overtime.status,
        approvedAt: overtime.approvedAt
      });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Reject overtime request
   * PATCH /overtimes/admin/:id/reject
   */
  static async rejectOvertime(req, res) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      if (!rejectionReason || rejectionReason.trim().length < 10) {
        return response.badRequest(res, 'Rejection reason is required (minimum 10 characters)');
      }

      const overtime = await Overtime.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!overtime) {
        return response.notFound(res, 'Overtime request not found');
      }

      // Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && overtime.companyId !== req.user.companyId) {
        return response.forbidden(res, 'Access denied');
      }

      if (overtime.status !== Overtime.STATUS.PENDING) {
        return response.badRequest(res, `Cannot reject overtime with status: ${overtime.status}`);
      }

      const oldSnapshot = overtime.toJSON();

      // Wrap update in transaction
      await sequelize.transaction(async (t) => {
        overtime.status = Overtime.STATUS.REJECTED;
        overtime.rejectionReason = rejectionReason.trim();
        overtime.approvedBy = adminId;
        overtime.approvedAt = new Date();
        await overtime.save({ transaction: t });
      });

      // Audit log
      await AuditLogger.logReject({
        userId: req.user.id,
        tableName: 'Overtimes',
        recordId: overtime.id,
        oldData: oldSnapshot,
        newData: overtime.toJSON(),
        req,
        description: `Admin rejected overtime for user ${overtime.UserId}: ${rejectionReason.substring(0, 50)}`
      });

      // Send notification to employee
      await notificationHelper.sendNotification(
        overtime.UserId,
        Notification.NOTIFICATION_TYPE.OVERTIME_REJECTED,
        'Overtime Request Rejected',
        `Your overtime request for ${overtime.overtimeDate} has been rejected. Reason: ${rejectionReason}`,
        {
          overtimeId: overtime.id,
          overtimeDate: overtime.overtimeDate,
          requestedHours: overtime.requestedHours,
          rejectionReason: overtime.rejectionReason
        },
        true // Send email
      );

      return response.ok(res, 'Overtime rejected successfully', {
        id: overtime.id,
        employee: {
          id: overtime.employee.id,
          name: overtime.employee.name,
          email: overtime.employee.email
        },
        overtimeDate: overtime.overtimeDate,
        requestedHours: overtime.requestedHours,
        status: overtime.status,
        rejectionReason: overtime.rejectionReason,
        approvedAt: overtime.approvedAt
      });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Get overtime summary with period filter
   * GET /overtimes/admin/summary
   */
  static async getOvertimeSummary(req, res) {
    try {
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const { period, userId, month, year, week, startDate, endDate } = req.query;

      // Default to monthly if no period specified
      const periodType = period || 'monthly';

      // Validate period
      const validPeriods = ['daily', 'weekly', 'monthly', 'custom'];
      if (!validPeriods.includes(periodType)) {
        return response.badRequest(res, `Invalid period. Must be one of: ${validPeriods.join(', ')}`);
      }

      // Validate custom period
      if (periodType === 'custom' && (!startDate || !endDate)) {
        return response.badRequest(res, 'For custom period, both startDate and endDate are required (format: YYYY-MM-DD)');
      }

      // Prepare options
      const options = {
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        week: week ? parseInt(week) : undefined,
        startDate,
        endDate
      };

      // Get date range
      const { startDate: rangeStart, endDate: rangeEnd, periodLabel } = getDateRangeForPeriod(periodType, options);

      // Build where clause
      const whereClause = {
        ...companyFilter,
        overtimeDate: {
          [Op.between]: [rangeStart, rangeEnd]
        },
        status: Overtime.STATUS.APPROVED // Only count approved overtimes
      };

      if (userId) {
        whereClause.UserId = userId;
      }

      // Get overtimes
      const overtimes = await Overtime.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name']
          }
        ],
        order: [['overtimeDate', 'DESC']]
      });

      // If userId is provided, return summary for that user
      if (userId) {
        const user = await User.findOne({ where: { id: userId, ...companyFilter } });
        if (!user) {
          return response.notFound(res, 'User not found');
        }

        const totalHours = overtimes.reduce((sum, ot) => {
          return sum + parseFloat(ot.actualHours || ot.requestedHours || 0);
        }, 0);

        return response.ok(res, 'Overtime summary for user', {
          period: periodLabel,
          dateRange: {
            start: rangeStart.toISOString().split('T')[0],
            end: rangeEnd.toISOString().split('T')[0]
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          summary: {
            totalOvertimes: overtimes.length,
            totalHours: parseFloat(totalHours.toFixed(2))
          },
          details: overtimes.map(ot => ({
            id: ot.id,
            overtimeDate: ot.overtimeDate,
            requestedHours: ot.requestedHours,
            actualHours: ot.actualHours,
            hours: ot.actualHours || ot.requestedHours,
            reason: ot.reason,
            approver: ot.approver ? {
              id: ot.approver.id,
              name: ot.approver.name
            } : null,
            approvedAt: ot.approvedAt
          }))
        });
      }

      // Get summary for all users (scoped to company)
      const userWhereClause = { role: 'Employee', ...companyFilter };
      const allUsers = await User.findAll({
        attributes: ['id', 'name', 'email'],
        where: userWhereClause
      });

      // Group overtimes by user
      const userOvertimeMap = {};
      overtimes.forEach(ot => {
        if (!userOvertimeMap[ot.UserId]) {
          userOvertimeMap[ot.UserId] = {
            user: {
              id: ot.employee.id,
              name: ot.employee.name,
              email: ot.employee.email
            },
            overtimes: [],
            totalHours: 0
          };
        }
        const hours = parseFloat(ot.actualHours || ot.requestedHours || 0);
        userOvertimeMap[ot.UserId].overtimes.push(ot);
        userOvertimeMap[ot.UserId].totalHours += hours;
      });

      // Calculate overall statistics
      const totalOvertimes = overtimes.length;
      const totalHours = overtimes.reduce((sum, ot) => {
        return sum + parseFloat(ot.actualHours || ot.requestedHours || 0);
      }, 0);
      const employeesWithOvertime = Object.keys(userOvertimeMap).length;

      // Build employee summaries
      const employeeSummaries = Object.values(userOvertimeMap).map(data => ({
        user: data.user,
        totalOvertimes: data.overtimes.length,
        totalHours: parseFloat(data.totalHours.toFixed(2))
      })).sort((a, b) => b.totalHours - a.totalHours); // Sort by total hours descending

      return response.ok(res, 'Overtime summary for all employees', {
        period: periodLabel,
        dateRange: {
          start: rangeStart.toISOString().split('T')[0],
          end: rangeEnd.toISOString().split('T')[0]
        },
        overall: {
          totalEmployees: allUsers.length,
          employeesWithOvertime,
          totalOvertimes,
          totalHours: parseFloat(totalHours.toFixed(2)),
          averageHoursPerEmployee: employeesWithOvertime > 0
            ? parseFloat((totalHours / employeesWithOvertime).toFixed(2))
            : 0
        },
        employees: employeeSummaries
      });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Get pending overtime requests count (for notifications)
   * GET /overtimes/admin/pending-count
   */
  static async getPendingCount(req, res) {
    try {
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const count = await Overtime.count({
        where: {
          ...companyFilter,
          status: Overtime.STATUS.PENDING
        }
      });

      return response.ok(res, 'Pending overtime requests count', { count });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Update overtime status (Re-approve or Re-reject)
   * PATCH /overtimes/admin/:id/update-status
   * This endpoint allows changing status from approved to rejected or vice versa
   */
  static async updateOvertimeStatus(req, res) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { status, rejectionReason, actualHours } = req.body;
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      // Validate status
      if (!status || !['approved', 'rejected'].includes(status)) {
        return response.badRequest(res, "Status is required and must be either 'approved' or 'rejected'");
      }

      const overtime = await Overtime.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!overtime) {
        return response.notFound(res, 'Overtime request not found');
      }

      // Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && overtime.companyId !== req.user.companyId) {
        return response.forbidden(res, 'Access denied');
      }

      // Check if status is being changed
      if (overtime.status === status) {
        return response.badRequest(res, `Overtime is already ${status}`);
      }

      const oldStatus = overtime.status;
      const oldSnapshot = overtime.toJSON();

      // If changing to rejected, require rejection reason
      if (status === 'rejected') {
        if (!rejectionReason || rejectionReason.trim().length < 10) {
          return response.badRequest(res, 'Rejection reason is required (minimum 10 characters)');
        }

        await sequelize.transaction(async (t) => {
          overtime.status = Overtime.STATUS.REJECTED;
          overtime.rejectionReason = rejectionReason.trim();
          overtime.approvedBy = adminId;
          overtime.approvedAt = new Date();
          await overtime.save({ transaction: t });
        });

        // Send notification
        await notificationHelper.sendNotification(
          overtime.UserId,
          Notification.NOTIFICATION_TYPE.OVERTIME_REJECTED,
          'Overtime Status Changed to Rejected',
          `Your overtime request for ${overtime.overtimeDate} status has been changed from ${oldStatus} to rejected. Reason: ${rejectionReason}`,
          {
            overtimeId: overtime.id,
            overtimeDate: overtime.overtimeDate,
            requestedHours: overtime.requestedHours,
            rejectionReason: overtime.rejectionReason,
            previousStatus: oldStatus
          },
          true
        );
      }
      // If changing to approved
      else if (status === 'approved') {
        let finalActualHours = overtime.actualHours || overtime.requestedHours;

        if (actualHours !== undefined) {
          if (actualHours < 0 || actualHours > 12) {
            return response.badRequest(res, 'Actual hours must be between 0 and 12');
          }
          finalActualHours = parseFloat(actualHours);
        }

        await sequelize.transaction(async (t) => {
          overtime.status = Overtime.STATUS.APPROVED;
          overtime.actualHours = finalActualHours;
          overtime.approvedBy = adminId;
          overtime.approvedAt = new Date();
          overtime.rejectionReason = null; // Clear rejection reason
          await overtime.save({ transaction: t });
        });

        // Send notification
        await notificationHelper.sendNotification(
          overtime.UserId,
          Notification.NOTIFICATION_TYPE.OVERTIME_APPROVED,
          'Overtime Status Changed to Approved',
          `Your overtime request for ${overtime.overtimeDate} status has been changed from ${oldStatus} to approved. Approved hours: ${overtime.actualHours} hours.`,
          {
            overtimeId: overtime.id,
            overtimeDate: overtime.overtimeDate,
            requestedHours: overtime.requestedHours,
            actualHours: overtime.actualHours,
            previousStatus: oldStatus
          },
          true
        );
      }

      // Audit log
      await AuditLogger.logUpdate({
        userId: req.user.id,
        tableName: 'Overtimes',
        recordId: overtime.id,
        oldData: oldSnapshot,
        newData: overtime.toJSON(),
        req,
        description: `Admin changed overtime status from ${oldStatus} to ${status} for user ${overtime.UserId}`
      });

      return response.ok(res, `Overtime status updated from ${oldStatus} to ${status} successfully`, {
        id: overtime.id,
        employee: {
          id: overtime.employee.id,
          name: overtime.employee.name,
          email: overtime.employee.email
        },
        overtimeDate: overtime.overtimeDate,
        requestedHours: overtime.requestedHours,
        actualHours: overtime.actualHours,
        status: overtime.status,
        rejectionReason: overtime.rejectionReason,
        approvedAt: overtime.approvedAt,
        previousStatus: oldStatus
      });

    } catch (error) {
      console.error(error);
      return response.serverError(res, 'Server error');
    }
  }

  /**
   * Delete overtime record (Admin only)
   * DELETE /overtimes/admin/:id
   */
  static async deleteOvertime(req, res) {
    try {
      const { id } = req.params;
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };
      const overtime = await Overtime.findOne({ where: { id, ...companyFilter } });
      if (!overtime) return response.notFound(res, 'Overtime record not found');
      const oldData = overtime.toJSON();
      await overtime.destroy();
      await AuditLogger.logDelete({
        userId: req.user.id,
        tableName: 'Overtimes',
        recordId: id,
        oldData,
        req,
        description: `Admin deleted overtime record for user ${overtime.UserId}`
      });
      return response.ok(res, 'Overtime record deleted successfully');
    } catch (err) {
      console.error(err);
      return response.serverError(res, 'Server error');
    }
  }
}

module.exports = OvertimeAdminController;
