const { LeaveRequest, User, Attendance, WorkSchedule } = require('../models');
const { Op } = require('sequelize');
const { deleteFile } = require('../helpers/fileUploadHelper');

class LeaveRequestController {
  
  // Employee submit leave/permission request (with optional file attachment)
  static async submitRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { leaveType, startDate, endDate, reason } = req.body;
      const file = req.file; // Optional file from multer

      console.log('📝 Leave Request Submission Started');
      console.log('User ID:', userId);
      console.log('Body:', { leaveType, startDate, endDate, reason: reason?.substring(0, 50) });
      console.log('File:', file ? { name: file.originalname, size: file.size, type: file.mimetype } : 'No file');

      // Validate required fields
      if (!leaveType || !startDate || !endDate || !reason) {
        console.log('❌ Validation failed: Missing required fields');
        // Delete uploaded file if validation fails
        if (file) {
          deleteFile(file.path);
        }
        return res.status(400).json({
          message: "All fields are required: leaveType, startDate, endDate, reason"
        });
      }

      // Validate leave type
      const validLeaveTypes = Object.values(LeaveRequest.LEAVE_TYPE);
      if (!validLeaveTypes.includes(leaveType)) {
        console.log('❌ Validation failed: Invalid leave type');
        // Delete uploaded file if validation fails
        if (file) {
          deleteFile(file.path);
        }
        return res.status(400).json({
          message: `Invalid leave type. Valid types: ${validLeaveTypes.join(', ')}`
        });
      }

      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate dates
      if (end < start) {
        return res.status(400).json({
          message: "End date must be after or equal to start date"
        });
      }

      // Calculate total days (including start and end date)
      const diffTime = Math.abs(end - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Get user data
      const user = await User.findByPk(userId);
      
      // Check quota ONLY for ANNUAL_LEAVE (SICK_LEAVE and PERMISSION don't deduct quota)
      if (leaveType === LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE) {
        
        const remainingQuota = user.annualLeaveQuota - user.usedLeaveQuota;
        
        if (totalDays > remainingQuota) {
          return res.status(400).json({
            message: `Insufficient leave quota. You have ${remainingQuota} days remaining, but requested ${totalDays} days.`,
            remainingQuota,
            requestedDays: totalDays
          });
        }
      }

      // Check for overlapping leave requests (PENDING or APPROVED)
      const overlappingRequest = await LeaveRequest.findOne({
        where: {
          UserId: userId,
          status: {
            [Op.in]: [LeaveRequest.REQUEST_STATUS.PENDING, LeaveRequest.REQUEST_STATUS.APPROVED]
          },
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate]
              }
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate]
              }
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: startDate } },
                { endDate: { [Op.gte]: endDate } }
              ]
            }
          ]
        }
      });

      if (overlappingRequest) {
        // Delete uploaded file if validation fails
        if (file) {
          deleteFile(file.path);
        }
        return res.status(400).json({
          message: "You already have a leave request for overlapping dates",
          existingRequest: overlappingRequest
        });
      }

      // Prepare leave request data
      const leaveRequestData = {
        UserId: userId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        status: LeaveRequest.REQUEST_STATUS.PENDING
      };

      // Add attachment info if file was uploaded
      if (file) {
        leaveRequestData.attachmentPath = file.path;
        leaveRequestData.attachmentOriginalName = file.originalname;
        leaveRequestData.attachmentMimeType = file.mimetype;
        leaveRequestData.attachmentSize = file.size;
      }

      // Create leave request
      const leaveRequest = await LeaveRequest.create(leaveRequestData);

      // Auto-create attendance for TODAY if leave request includes today
      const todayDateOnly = new Date();
      todayDateOnly.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const endDateOnly = new Date(endDate);
      endDateOnly.setHours(0, 0, 0, 0);

      let attendanceCreated = false;
      
      // Check if today is within the leave request range
      if (todayDateOnly >= startDateOnly && todayDateOnly <= endDateOnly) {
        // Get active work schedule
        const workSchedule = await WorkSchedule.findOne({
          where: { isActive: true }
        });

        // Determine attendance status based on leave type
        let attendanceStatus;
        switch (leaveType) {
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

        // Check if attendance already exists for today
        const startOfToday = new Date(todayDateOnly);
        const endOfToday = new Date(todayDateOnly);
        endOfToday.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
          where: {
            UserId: userId,
            date: {
              [Op.between]: [startOfToday, endOfToday]
            }
          }
        });

        // Only create if attendance doesn't exist yet
        if (!existingAttendance) {
          await Attendance.create({
            UserId: userId,
            WorkScheduleId: workSchedule ? workSchedule.id : null,
            HolidayId: null,
            LeaveRequestId: leaveRequest.id,
            date: new Date(todayDateOnly),
            clockIn: new Date(todayDateOnly),
            clockOut: new Date(todayDateOnly),
            status: attendanceStatus
          });
          attendanceCreated = true;
        }
      }

      console.log('✅ Leave request created successfully:', leaveRequest.id);
      console.log('Attachment uploaded:', file ? 'Yes' : 'No');
      console.log('Attendance auto-created:', attendanceCreated);

      res.status(201).json({
        message: attendanceCreated 
          ? "Leave request submitted successfully. Attendance record created for today. Waiting for admin approval."
          : "Leave request submitted successfully. Waiting for admin approval.",
        data: leaveRequest,
        attendanceCreatedForToday: attendanceCreated,
        attachmentUploaded: file ? true : false,
        attachmentInfo: file ? {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        } : null
      });

    } catch (error) {
      console.error('❌ Leave Request Submission Error:', error);
      // Delete uploaded file if error occurs
      if (req.file) {
        deleteFile(req.file.path);
      }
      next(error);
    }
  }

  // Get my leave requests
  static async getMyRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, leaveType } = req.query;

      const whereClause = { UserId: userId };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (leaveType) {
        whereClause.leaveType = leaveType;
      }

      const leaveRequests = await LeaveRequest.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        message: "My leave requests",
        data: leaveRequests
      });

    } catch (error) {
      next(error);
    }
  }

  // Get my leave balance
  static async getMyBalance(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'annualLeaveQuota', 'usedLeaveQuota', 'remainingLeaveQuota']
      });

      // Get pending requests that will deduct quota if approved
      const pendingRequests = await LeaveRequest.findAll({
        where: {
          UserId: userId,
          status: LeaveRequest.REQUEST_STATUS.PENDING,
          leaveType: {
            [Op.in]: [LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE, LeaveRequest.LEAVE_TYPE.SICK_LEAVE]
          }
        }
      });

      const pendingDays = pendingRequests.reduce((sum, req) => sum + req.totalDays, 0);

      res.status(200).json({
        message: "My leave balance",
        data: {
          annualLeaveQuota: user.annualLeaveQuota,
          usedLeaveQuota: user.usedLeaveQuota,
          remainingLeaveQuota: user.remainingLeaveQuota,
          pendingLeaveDays: pendingDays,
          availableAfterPending: user.remainingLeaveQuota - pendingDays
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Cancel my leave request (only if still PENDING)
  static async cancelRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const leaveRequest = await LeaveRequest.findOne({
        where: {
          id,
          UserId: userId
        }
      });

      if (!leaveRequest) {
        return res.status(404).json({
          message: "Leave request not found"
        });
      }

      if (leaveRequest.status !== LeaveRequest.REQUEST_STATUS.PENDING) {
        return res.status(400).json({
          message: `Cannot cancel request with status: ${leaveRequest.status}. Only PENDING requests can be cancelled.`
        });
      }

      leaveRequest.status = LeaveRequest.REQUEST_STATUS.CANCELLED;
      await leaveRequest.save();

      res.status(200).json({
        message: "Leave request cancelled successfully",
        data: leaveRequest
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaveRequestController;
