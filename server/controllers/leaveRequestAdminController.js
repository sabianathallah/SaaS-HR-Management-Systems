const { LeaveRequest, User, Attendance, WorkSchedule, Notification } = require('../models');
const { Op } = require('sequelize');
const notificationHelper = require('../helpers/notificationHelper');
const AuditLogger = require('../helpers/auditLogger');

class LeaveRequestAdminController {

  // Admin: Get all leave requests
  static async getAllRequests(req, res, next) {
    try {
      const { status, leaveType, userId } = req.query;

      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (leaveType) {
        whereClause.leaveType = leaveType;
      }

      if (userId) {
        whereClause.UserId = userId;
      }

      const leaveRequests = await LeaveRequest.findAll({
        where: whereClause,
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
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        message: "All leave requests",
        data: leaveRequests
      });

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

      const leaveRequest = await LeaveRequest.findByPk(id, {
        include: [{
          model: User,
          as: 'employee'
        }]
      });

      if (!leaveRequest) {
        return res.status(404).json({
          message: "Leave request not found"
        });
      }

      if (leaveRequest.status !== LeaveRequest.REQUEST_STATUS.PENDING) {
        return res.status(400).json({
          message: `Cannot approve request with status: ${leaveRequest.status}. Only PENDING requests can be approved.`
        });
      }

      // Check quota ONLY for ANNUAL_LEAVE (SICK_LEAVE and PERMISSION don't deduct quota)
      if (leaveRequest.leaveType === LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE) {
        
        const employee = leaveRequest.employee;
        const remainingQuota = employee.annualLeaveQuota - employee.usedLeaveQuota;
        
        if (leaveRequest.totalDays > remainingQuota) {
          return res.status(400).json({
            message: `Cannot approve. Employee has insufficient leave quota. Remaining: ${remainingQuota} days, Requested: ${leaveRequest.totalDays} days.`,
            remainingQuota,
            requestedDays: leaveRequest.totalDays
          });
        }

        // Deduct quota only for ANNUAL_LEAVE
        employee.usedLeaveQuota += leaveRequest.totalDays;
        await employee.save();
      }

      // Update leave request status
      leaveRequest.status = LeaveRequest.REQUEST_STATUS.APPROVED;
      leaveRequest.approvedBy = adminId;
      leaveRequest.approvalNote = approvalNote || null;
      leaveRequest.approvalDate = new Date();
      await leaveRequest.save();

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
        where: { isActive: true }
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

      // Loop through each day and create attendance
      let createdCount = 0;
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        try {
          const attendanceDate = new Date(date);
          const startOfDay = new Date(attendanceDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(attendanceDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          // Check if attendance already exists for this date
          const existingAttendance = await Attendance.findOne({
            where: {
              UserId: leaveRequest.UserId,
              date: {
                [Op.between]: [startOfDay, endOfDay]
              }
            }
          });

          if (!existingAttendance) {
            await Attendance.create({
              UserId: leaveRequest.UserId,
              WorkScheduleId: workSchedule ? workSchedule.id : null,
              HolidayId: null,
              LeaveRequestId: leaveRequest.id,
              date: new Date(date),
              clockIn: new Date(date),
              clockOut: new Date(date),
              status: attendanceStatus
            });
            createdCount++;
          }
        } catch (err) {
          // Log but continue to next date
          console.error('Error creating attendance for date:', new Date(date).toISOString(), '-', err.message);
        }
      }

      // Return success response with simple data
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

      // Send notification to employee
      await notificationHelper.sendNotification(
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
      );

      res.status(200).json({
        message: "Leave request approved successfully. Attendance records created.",
        data: responseData
      });

    } catch (error) {
      console.error('Error in approveRequest:', error);
      console.error('Error stack:', error.stack);
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
        return res.status(404).json({
          message: "Leave request not found"
        });
      }

      if (leaveRequest.status !== LeaveRequest.REQUEST_STATUS.PENDING) {
        return res.status(400).json({
          message: `Cannot reject request with status: ${leaveRequest.status}. Only PENDING requests can be rejected.`
        });
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
      // This handles cases where user submitted leave for today and attendance was auto-created
      const deletedCount = await Attendance.destroy({
        where: {
          LeaveRequestId: leaveRequest.id
        }
      });

      // Send notification to employee
      await notificationHelper.sendNotification(
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
      );

      res.status(200).json({
        message: "Leave request rejected successfully",
        data: leaveRequest,
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
      const { annualLeaveQuota, usedLeaveQuota, reason } = req.body;

      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const oldQuota = {
        annualLeaveQuota: user.annualLeaveQuota,
        usedLeaveQuota: user.usedLeaveQuota,
        remainingLeaveQuota: user.remainingLeaveQuota
      };

      // Update quota
      if (annualLeaveQuota !== undefined) {
        if (annualLeaveQuota < 0) {
          return res.status(400).json({
            message: "Annual leave quota cannot be negative"
          });
        }
        user.annualLeaveQuota = annualLeaveQuota;
      }

      if (usedLeaveQuota !== undefined) {
        if (usedLeaveQuota < 0) {
          return res.status(400).json({
            message: "Used leave quota cannot be negative"
          });
        }
        user.usedLeaveQuota = usedLeaveQuota;
      }

      await user.save();

      // Send notification to employee
      await notificationHelper.sendNotification(
        userId,
        Notification.NOTIFICATION_TYPE.LEAVE_QUOTA_ADJUSTMENT,
        '📊 Leave Quota Adjusted',
        `Your annual leave quota has been adjusted. You now have ${user.remainingLeaveQuota} days remaining.`,
        {
          annualLeaveQuota: user.annualLeaveQuota,
          usedLeaveQuota: user.usedLeaveQuota,
          remainingLeaveQuota: user.remainingLeaveQuota,
          reason: reason || "Manual adjustment by admin"
        },
        true // Send email
      );

      res.status(200).json({
        message: "Leave quota adjusted successfully",
        reason: reason || "Manual adjustment by admin",
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

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'annualLeaveQuota', 'usedLeaveQuota', 'remainingLeaveQuota']
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
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

      res.status(200).json({
        message: "Employee leave balance",
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

  // Admin: View/Download leave request attachment
  static async viewAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const path = require('path');
      const fs = require('fs');

      const leaveRequest = await LeaveRequest.findByPk(id);

      if (!leaveRequest) {
        return res.status(404).json({
          message: "Leave request not found"
        });
      }

      if (!leaveRequest.attachmentPath) {
        return res.status(404).json({
          message: "No attachment found for this leave request"
        });
      }

      // Check if file exists
      if (!fs.existsSync(leaveRequest.attachmentPath)) {
        return res.status(404).json({
          message: "Attachment file not found on server",
          attachmentPath: leaveRequest.attachmentPath
        });
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
      const path = require('path');
      const fs = require('fs');

      const leaveRequest = await LeaveRequest.findByPk(id);

      if (!leaveRequest) {
        return res.status(404).json({
          message: "Leave request not found"
        });
      }

      if (!leaveRequest.attachmentPath) {
        return res.status(404).json({
          message: "No attachment found for this leave request"
        });
      }

      // Check if file exists
      if (!fs.existsSync(leaveRequest.attachmentPath)) {
        return res.status(404).json({
          message: "Attachment file not found on server"
        });
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
