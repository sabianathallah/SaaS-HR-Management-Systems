const { LeaveRequest, User, Attendance, WorkSchedule, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const notificationHelper = require('../helpers/notificationHelper');
const AuditLogger = require('../helpers/auditLogger');
const response = require('../helpers/responseHelper');

class LeaveRequestAdminController {

  // Admin: Get all leave requests
  static async getAllRequests(req, res, next) {
    try {
      const { status, leaveType, userId, startDate, endDate, page = 1, limit = 20 } = req.query;

      // FIX 1: Multi-tenant isolation
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const where = { ...companyFilter };

      if (status) {
        where.status = status;
      }

      if (leaveType) {
        where.leaveType = leaveType;
      }

      if (userId) {
        where.UserId = userId;
      }

      // FIX 7: Date range filter
      if (startDate && endDate) {
        where.startDate = { [Op.gte]: new Date(startDate) };
        where.endDate = { [Op.lte]: new Date(endDate) };
      }

      // FIX 6: Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

      const { count: total, rows: leaveRequests } = await LeaveRequest.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      const totalPages = Math.ceil(total / limitNum);

      // FIX 2: Use responseHelper
      return response.ok(
        res,
        'All leave requests',
        leaveRequests,
        { total, page: pageNum, limit: limitNum, totalPages }
      );

    } catch (error) {
      next(error);
    }
  }

  // Admin: Approve leave request
  static async approveRequest(req, res, next) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { approvalNote } = req.body;

      // FIX 1: Multi-tenant isolation
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      // FIX 3: Wrap all DB operations in a Sequelize transaction
      const result = await sequelize.transaction(async (t) => {
        const leaveRequest = await LeaveRequest.findByPk(id, {
          include: [{
            model: User,
            as: 'employee'
          }],
          transaction: t
        });

        if (!leaveRequest) {
          return next({ name: 'NotFound', message: 'Leave request not found' });
        }

        // FIX 1: Company ownership check
        if (req.user.role !== 'SUPER_ADMIN' && leaveRequest.companyId !== req.user.companyId) {
          return res.status(403).json({ success: false, message: 'Access forbidden: leave request belongs to a different company' });
        }

        if (leaveRequest.status !== LeaveRequest.REQUEST_STATUS.PENDING) {
          return next({ name: 'BadRequest', message: `Cannot approve request with status: ${leaveRequest.status}. Only PENDING requests can be approved.` });
        }

        // Check quota ONLY for ANNUAL_LEAVE (SICK_LEAVE and PERMISSION don't deduct quota)
        if (leaveRequest.leaveType === LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE) {
          const employee = leaveRequest.employee;
          const remainingQuota = employee.annualLeaveQuota - employee.usedLeaveQuota;

          if (leaveRequest.totalDays > remainingQuota) {
            return next({
              name: 'BadRequest',
              message: `Cannot approve. Employee has insufficient leave quota. Remaining: ${remainingQuota} days, Requested: ${leaveRequest.totalDays} days.`
            });
          }

          // Deduct quota only for ANNUAL_LEAVE
          employee.usedLeaveQuota += leaveRequest.totalDays;
          await employee.save({ transaction: t });
        }

        // Update leave request status
        leaveRequest.status = LeaveRequest.REQUEST_STATUS.APPROVED;
        leaveRequest.approvedBy = adminId;
        leaveRequest.approvalNote = approvalNote || null;
        leaveRequest.approvalDate = new Date();
        await leaveRequest.save({ transaction: t });

        // ===== AUDIT LOG =====
        await AuditLogger.logApprove({
          userId: adminId,
          tableName: 'LeaveRequests',
          recordId: leaveRequest.id,
          oldData: { status: 'PENDING' },
          newData: leaveRequest.toJSON(),
          req,
          description: `Approved ${leaveRequest.leaveType} leave for ${leaveRequest.employee?.name || 'user'}`
        });

        // Get active work schedule
        const workSchedule = await WorkSchedule.findOne({
          where: { isActive: true, ...companyFilter },
          transaction: t
        });

        // Create attendance records for each day
        const start = new Date(leaveRequest.startDate);
        const end = new Date(leaveRequest.endDate);

        // Determine attendance status based on leave type
        let attendanceStatus;
        switch (leaveRequest.leaveType) {
          case LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE:
            attendanceStatus = Attendance.ATTENDANCE_STATUS.LEAVE;
            break;
          case LeaveRequest.LEAVE_TYPE.SICK_LEAVE:
            attendanceStatus = Attendance.ATTENDANCE_STATUS.SICK_LEAVE;
            break;
          case LeaveRequest.LEAVE_TYPE.PERMISSION:
            attendanceStatus = Attendance.ATTENDANCE_STATUS.PERMISSION;
            break;
          default:
            attendanceStatus = Attendance.ATTENDANCE_STATUS.LEAVE;
        }

        // Collect all dates in range (bulk approach - avoids N+1 queries)
        const allDates = [];
        const tempDate = new Date(start);
        while (tempDate <= end) {
          allDates.push(new Date(tempDate));
          tempDate.setDate(tempDate.getDate() + 1);
        }

        // Single query: check existing attendances for all dates at once
        const effectiveCompanyId = req.user.role === 'SUPER_ADMIN' ? leaveRequest.companyId : req.user.companyId;
        const existingAttendances = await Attendance.findAll({
          where: {
            UserId: leaveRequest.UserId,
            companyId: effectiveCompanyId,
            date: { [Op.between]: [new Date(start), new Date(end)] }
          },
          attributes: ['date'],
          transaction: t
        });

        // Build set of existing dates (as ISO date strings for comparison)
        const existingDateStrings = new Set(
          existingAttendances.map(a => new Date(a.date).toISOString().split('T')[0])
        );

        // Build records to create (only missing dates)
        const attendancesToCreate = [];
        for (const date of allDates) {
          const dateStr = date.toISOString().split('T')[0];
          if (!existingDateStrings.has(dateStr)) {
            attendancesToCreate.push({
              UserId: leaveRequest.UserId,
              WorkScheduleId: workSchedule ? workSchedule.id : null,
              HolidayId: null,
              LeaveRequestId: leaveRequest.id,
              companyId: effectiveCompanyId,
              date: date,
              clockIn: date,
              clockOut: date,
              status: attendanceStatus,
            });
          }
        }

        // Single bulk insert for all missing dates
        if (attendancesToCreate.length > 0) {
          await Attendance.bulkCreate(attendancesToCreate, { transaction: t });
        }
        const createdCount = attendancesToCreate.length;

        // Build response data
        const responseData = {
          id: leaveRequest.id,
          UserId: leaveRequest.UserId,
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          totalDays: leaveRequest.totalDays,
          reason: leaveRequest.reason,
          status: leaveRequest.status,
          approvedBy: leaveRequest.approvedBy,
          approvalNote: leaveRequest.approvalNote,
          approvalDate: leaveRequest.approvalDate,
          attendanceRecordsCreated: createdCount
        };

        // Send notification to employee (outside transaction is fine — non-critical side-effect)
        notificationHelper.sendNotification(
          leaveRequest.UserId,
          Notification.NOTIFICATION_TYPE.LEAVE_APPROVED,
          '✅ Leave Request Approved',
          `Your ${leaveRequest.leaveType.replace('_', ' ').toLowerCase()} request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been approved.`,
          {
            leaveRequestId: leaveRequest.id,
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            totalDays: leaveRequest.totalDays,
            approvalNote: leaveRequest.approvalNote
          },
          true // Send email
        ).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error('Error sending approval notification:', err);
        });

        return responseData;
      });

      // If result is undefined the handler already responded (next was called)
      if (result === undefined) return;

      // FIX 2: Use responseHelper
      return response.ok(res, 'Leave request approved successfully. Attendance records created.', result);

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Error in approveRequest:', error);
      if (process.env.NODE_ENV !== 'production') console.error('Error stack:', error.stack);
      next(error);
    }
  }

  // Admin: Reject leave request
  static async rejectRequest(req, res, next) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { approvalNote } = req.body;

      const leaveRequest = await LeaveRequest.findByPk(id);

      if (!leaveRequest) {
        return next({ name: 'NotFound', message: 'Leave request not found' });
      }

      // FIX 1: Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && leaveRequest.companyId !== req.user.companyId) {
        return res.status(403).json({ success: false, message: 'Access forbidden: leave request belongs to a different company' });
      }

      if (leaveRequest.status !== LeaveRequest.REQUEST_STATUS.PENDING) {
        return next({ name: 'BadRequest', message: `Cannot reject request with status: ${leaveRequest.status}. Only PENDING requests can be rejected.` });
      }

      leaveRequest.status = LeaveRequest.REQUEST_STATUS.REJECTED;
      leaveRequest.approvedBy = adminId;
      leaveRequest.approvalNote = approvalNote || 'Request rejected by admin';
      leaveRequest.approvalDate = new Date();
      await leaveRequest.save();

      // ===== AUDIT LOG =====
      await AuditLogger.logReject({
        userId: adminId,
        tableName: 'LeaveRequests',
        recordId: leaveRequest.id,
        oldData: { status: 'PENDING' },
        newData: leaveRequest.toJSON(),
        req,
        description: `Rejected ${leaveRequest.leaveType} leave: ${approvalNote || 'No reason'}`
      });

      // Delete any attendance records created for this leave request
      const deletedCount = await Attendance.destroy({
        where: {
          LeaveRequestId: leaveRequest.id
        }
      });

      // Send notification to employee
      notificationHelper.sendNotification(
        leaveRequest.UserId,
        Notification.NOTIFICATION_TYPE.LEAVE_REJECTED,
        '❌ Leave Request Rejected',
        `Your ${leaveRequest.leaveType.replace('_', ' ').toLowerCase()} request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been rejected.${approvalNote ? `\n\n📝 Reason: ${approvalNote}` : ''}${deletedCount > 0 ? '\n\nRelated attendance records have been removed.' : ''}`,
        {
          leaveRequestId: leaveRequest.id,
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          totalDays: leaveRequest.totalDays,
          approvalNote: leaveRequest.approvalNote,
          attendanceRecordsDeleted: deletedCount
        },
        true // Send email
      ).catch(err => {
        if (process.env.NODE_ENV !== 'production') console.error('Error sending rejection notification:', err);
      });

      // FIX 2: Use responseHelper
      return response.ok(res, 'Leave request rejected successfully', {
        leaveRequest,
        attendanceRecordsDeleted: deletedCount
      });

    } catch (error) {
      next(error);
    }
  }

  // Admin: Manually adjust employee leave quota
  static async adjustQuota(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      let { annualLeaveQuota, usedLeaveQuota } = req.body;

      // FIX 1: Multi-tenant isolation
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const user = await User.findOne({ where: { id: userId, ...companyFilter } });

      if (!user) {
        return next({ name: 'NotFound', message: 'User not found' });
      }

      // FIX 1: Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && user.companyId !== req.user.companyId) {
        return res.status(403).json({ success: false, message: 'Access forbidden: user belongs to a different company' });
      }

      // Parse values if provided
      if (annualLeaveQuota !== undefined) {
        annualLeaveQuota = parseInt(annualLeaveQuota, 10);
        if (isNaN(annualLeaveQuota) || annualLeaveQuota < 0) {
          return next({ name: 'BadRequest', message: 'Annual leave quota cannot be negative' });
        }
      }

      if (usedLeaveQuota !== undefined) {
        usedLeaveQuota = parseInt(usedLeaveQuota, 10);
        if (isNaN(usedLeaveQuota) || usedLeaveQuota < 0) {
          return next({ name: 'BadRequest', message: 'Used leave quota cannot be negative' });
        }
      }

      // FIX 4: Validate quota consistency
      if (usedLeaveQuota !== undefined && annualLeaveQuota !== undefined) {
        if (usedLeaveQuota > annualLeaveQuota) {
          return next({ name: 'BadRequest', message: 'Used leave quota cannot exceed annual leave quota' });
        }
      }

      // Also check against the user's current value when only one is provided
      const effectiveAnnual = annualLeaveQuota !== undefined ? annualLeaveQuota : user.annualLeaveQuota;
      const effectiveUsed = usedLeaveQuota !== undefined ? usedLeaveQuota : user.usedLeaveQuota;
      if (effectiveUsed > effectiveAnnual) {
        return next({ name: 'BadRequest', message: 'Used leave quota cannot exceed annual leave quota' });
      }

      // FIX 5: Capture old values BEFORE update for audit log
      const oldAnnual = user.annualLeaveQuota;
      const oldUsed = user.usedLeaveQuota;

      const oldQuota = {
        annualLeaveQuota: user.annualLeaveQuota,
        usedLeaveQuota: user.usedLeaveQuota,
        remainingLeaveQuota: user.remainingLeaveQuota
      };

      // Apply updates
      if (annualLeaveQuota !== undefined) {
        user.annualLeaveQuota = annualLeaveQuota;
      }

      if (usedLeaveQuota !== undefined) {
        user.usedLeaveQuota = usedLeaveQuota;
      }

      await user.save();

      // FIX 5: Audit log for adjustQuota
      await AuditLogger.logUpdate({
        userId: req.user.id,
        tableName: 'Users',
        recordId: userId,
        oldData: { annualLeaveQuota: oldAnnual, usedLeaveQuota: oldUsed },
        newData: { annualLeaveQuota: user.annualLeaveQuota, usedLeaveQuota: user.usedLeaveQuota },
        req,
        description: `Admin adjusted leave quota for user ${user.name}`
      });

      // Send notification to employee
      notificationHelper.sendNotification(
        userId,
        Notification.NOTIFICATION_TYPE.LEAVE_QUOTA_ADJUSTMENT,
        '📊 Leave Quota Adjusted',
        `Your annual leave quota has been adjusted. You now have ${user.remainingLeaveQuota} days remaining.`,
        {
          annualLeaveQuota: user.annualLeaveQuota,
          usedLeaveQuota: user.usedLeaveQuota,
          remainingLeaveQuota: user.remainingLeaveQuota,
          reason: reason || 'Manual adjustment by admin'
        },
        true // Send email
      ).catch(err => {
        if (process.env.NODE_ENV !== 'production') console.error('Error sending quota adjustment notification:', err);
      });

      // FIX 2: Use responseHelper
      return response.ok(res, 'Leave quota adjusted successfully', {
        reason: reason || 'Manual adjustment by admin',
        oldQuota,
        newQuota: {
          annualLeaveQuota: user.annualLeaveQuota,
          usedLeaveQuota: user.usedLeaveQuota,
          remainingLeaveQuota: user.remainingLeaveQuota
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Admin: Get employee leave balance
  static async getEmployeeBalance(req, res, next) {
    try {
      const { userId } = req.params;

      // FIX 1 & FIX 8: Multi-tenant isolation on User lookup
      const companyFilter = req.user.role === 'SUPER_ADMIN' ? {} : { companyId: req.user.companyId };

      const user = await User.findOne({
        where: { id: userId, ...companyFilter },
        attributes: ['id', 'name', 'email', 'annualLeaveQuota', 'usedLeaveQuota', 'remainingLeaveQuota']
      });

      if (!user) {
        return next({ name: 'NotFound', message: 'User not found' });
      }

      // Get leave request statistics
      const leaveStats = await LeaveRequest.findAll({
        where: { UserId: userId },
        attributes: [
          'status',
          'leaveType',
          [require('sequelize').fn('SUM', require('sequelize').col('totalDays')), 'totalDays']
        ],
        group: ['status', 'leaveType'],
        raw: true
      });

      // FIX 2: Use responseHelper
      return response.ok(res, 'Employee leave balance', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        balance: {
          annualLeaveQuota: user.annualLeaveQuota,
          usedLeaveQuota: user.usedLeaveQuota,
          remainingLeaveQuota: user.remainingLeaveQuota
        },
        statistics: leaveStats
      });

    } catch (error) {
      next(error);
    }
  }

  // Admin: View leave request attachment (inline)
  static async viewAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const fs = require('fs');

      const leaveRequest = await LeaveRequest.findByPk(id);

      if (!leaveRequest) {
        return next({ name: 'NotFound', message: 'Leave request not found' });
      }

      // FIX 1: Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && leaveRequest.companyId !== req.user.companyId) {
        return res.status(403).json({ success: false, message: 'Access forbidden: leave request belongs to a different company' });
      }

      if (!leaveRequest.attachmentPath) {
        return next({ name: 'NotFound', message: 'No attachment found for this leave request' });
      }

      // Check if file exists
      if (!fs.existsSync(leaveRequest.attachmentPath)) {
        return next({ name: 'NotFound', message: 'Attachment file not found on server' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', leaveRequest.attachmentMimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${leaveRequest.attachmentOriginalName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(leaveRequest.attachmentPath);
      fileStream.pipe(res);

    } catch (error) {
      next(error);
    }
  }

  // Admin: Download leave request attachment
  static async downloadAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const fs = require('fs');

      const leaveRequest = await LeaveRequest.findByPk(id);

      if (!leaveRequest) {
        return next({ name: 'NotFound', message: 'Leave request not found' });
      }

      // FIX 1: Company ownership check
      if (req.user.role !== 'SUPER_ADMIN' && leaveRequest.companyId !== req.user.companyId) {
        return res.status(403).json({ success: false, message: 'Access forbidden: leave request belongs to a different company' });
      }

      if (!leaveRequest.attachmentPath) {
        return next({ name: 'NotFound', message: 'No attachment found for this leave request' });
      }

      // Check if file exists
      if (!fs.existsSync(leaveRequest.attachmentPath)) {
        return next({ name: 'NotFound', message: 'Attachment file not found on server' });
      }

      // Set appropriate headers for download
      res.setHeader('Content-Type', leaveRequest.attachmentMimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${leaveRequest.attachmentOriginalName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(leaveRequest.attachmentPath);
      fileStream.pipe(res);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaveRequestAdminController;
