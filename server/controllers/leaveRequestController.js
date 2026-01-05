const { LeaveRequest, User, Attandance, WorkSchedule } = require('../models');
const { Op } = require('sequelize');

class LeaveRequestController {
  
  // Employee submit leave/permission request
  static async submitRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { leaveType, startDate, endDate, reason } = req.body;

      // Validate required fields
      if (!leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({
          message: "All fields are required: leaveType, startDate, endDate, reason"
        });
      }

      // Validate leave type
      const validLeaveTypes = Object.values(LeaveRequest.LEAVE_TYPE);
      if (!validLeaveTypes.includes(leaveType)) {
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
      
      // Check quota only for ANNUAL_LEAVE and SICK_LEAVE
      if (leaveType === LeaveRequest.LEAVE_TYPE.ANNUAL_LEAVE || 
          leaveType === LeaveRequest.LEAVE_TYPE.SICK_LEAVE) {
        
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
        return res.status(400).json({
          message: "You already have a leave request for overlapping dates",
          existingRequest: overlappingRequest
        });
      }

      // Create leave request
      const leaveRequest = await LeaveRequest.create({
        UserId: userId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        status: LeaveRequest.REQUEST_STATUS.PENDING
      });

      res.status(201).json({
        message: "Leave request submitted successfully. Waiting for admin approval.",
        data: leaveRequest
      });

    } catch (error) {
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
