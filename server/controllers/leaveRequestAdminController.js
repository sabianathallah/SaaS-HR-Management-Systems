const { LeaveRequest, User, Attandance, WorkSchedule } = require('../models');
const { Op } = require('sequelize');

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

      // Check quota again for ANNUAL_LEAVE and SICK_LEAVE
      if (leaveRequest.leaveType === LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE || 
          leaveRequest.leaveType === LeaveRequest.LEAVE_TYPE.SICK_LEAVE) {
        
        const employee = leaveRequest.employee;
        const remainingQuota = employee.annualLeaveQuota - employee.usedLeaveQuota;
        
        if (leaveRequest.totalDays > remainingQuota) {
          return res.status(400).json({
            message: `Cannot approve. Employee has insufficient leave quota. Remaining: ${remainingQuota} days, Requested: ${leaveRequest.totalDays} days.`,
            remainingQuota,
            requestedDays: leaveRequest.totalDays
          });
        }

        // Deduct quota
        employee.usedLeaveQuota += leaveRequest.totalDays;
        await employee.save();
      }

      // Update leave request status
      leaveRequest.status = LeaveRequest.REQUEST_STATUS.APPROVED;
      leaveRequest.approvedBy = adminId;
      leaveRequest.approvalNote = approvalNote || null;
      leaveRequest.approvalDate = new Date();
      await leaveRequest.save();

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
          attendanceStatus = Attandance.ATTENDANCE_STATUS.LEAVE;
          break;
        case LeaveRequest.LEAVE_TYPE.SICK_LEAVE:
          attendanceStatus = Attandance.ATTENDANCE_STATUS.SICK_LEAVE;
          break;
        case LeaveRequest.LEAVE_TYPE.PERMISSION:
          attendanceStatus = Attandance.ATTENDANCE_STATUS.PERMISSION;
          break;
        default:
          attendanceStatus = Attandance.ATTENDANCE_STATUS.LEAVE;
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
          const existingAttendance = await Attandance.findOne({
            where: {
              UserId: leaveRequest.UserId,
              date: {
                [Op.between]: [startOfDay, endOfDay]
              }
            }
          });

          if (!existingAttendance) {
            await Attandance.create({
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

      res.status(200).json({
        message: "Leave request rejected successfully",
        data: leaveRequest
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
}

module.exports = LeaveRequestAdminController;
