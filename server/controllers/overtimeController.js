const { Overtime, User, Attendance } = require('../models');
const { Op } = require('sequelize');

class OvertimeController {
  
  /**
   * Employee request overtime
   * POST /overtimes/request
   */
  static async requestOvertime(req, res, next) {
    try {
      const userId = req.user.id;
      const { overtimeDate, requestedHours, reason, attendanceId } = req.body;

      // Validate required fields
      if (!overtimeDate || !requestedHours || !reason) {
        return res.status(400).json({
          message: "Overtime date, requested hours, and reason are required"
        });
      }

      // Validate requested hours
      if (requestedHours < 0.5 || requestedHours > 12) {
        return res.status(400).json({
          message: "Requested hours must be between 0.5 and 12 hours"
        });
      }

      // Check if attendance exists (optional, for validation)
      let attendance = null;
      if (attendanceId) {
        attendance = await Attendance.findOne({
          where: {
            id: attendanceId,
            UserId: userId
          }
        });

        if (!attendance) {
          return res.status(404).json({
            message: "Attendance record not found or doesn't belong to you"
          });
        }

        // Validate that overtime is requested for the same date as attendance
        const attDate = new Date(attendance.date).toISOString().split('T')[0];
        const otDate = new Date(overtimeDate).toISOString().split('T')[0];
        
        if (attDate !== otDate) {
          return res.status(400).json({
            message: "Overtime date must match attendance date"
          });
        }
      }

      // Check if overtime already requested for this date
      const existingOvertime = await Overtime.findOne({
        where: {
          UserId: userId,
          overtimeDate: {
            [Op.gte]: new Date(overtimeDate).setHours(0, 0, 0, 0),
            [Op.lte]: new Date(overtimeDate).setHours(23, 59, 59, 999)
          }
        }
      });

      if (existingOvertime) {
        return res.status(400).json({
          message: "Overtime request already exists for this date"
        });
      }

      // Create overtime request
      const overtime = await Overtime.create({
        UserId: userId,
        AttendanceId: attendanceId || null,
        overtimeDate: new Date(overtimeDate),
        requestedHours: parseFloat(requestedHours),
        reason: reason.trim(),
        status: Overtime.STATUS.PENDING
      });

      res.status(201).json({
        message: "Overtime request submitted successfully",
        data: {
          id: overtime.id,
          overtimeDate: overtime.overtimeDate,
          requestedHours: overtime.requestedHours,
          reason: overtime.reason,
          status: overtime.status,
          createdAt: overtime.createdAt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my overtime requests (pending/approved/rejected)
   * GET /overtimes/my-requests
   */
  static async getMyOvertimeRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const whereClause = { UserId: userId };
      
      if (status) {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
          return res.status(400).json({
            message: "Invalid status. Must be: pending, approved, or rejected"
          });
        }
        whereClause.status = status;
      }

      const overtimes = await Overtime.findAll({
        where: whereClause,
        include: [
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
        order: [['overtimeDate', 'DESC']]
      });

      res.status(200).json({
        message: "My overtime requests",
        total: overtimes.length,
        data: overtimes.map(ot => ({
          id: ot.id,
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
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my overtime history (only approved)
   * GET /overtimes/my-history
   */
  static async getMyOvertimeHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { month, year } = req.query;

      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      // Validate month and year
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          message: "Invalid month. Must be between 1 and 12"
        });
      }

      if (targetYear < 2000 || targetYear > 2100) {
        return res.status(400).json({
          message: "Invalid year"
        });
      }

      // Calculate date range
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

      const overtimes = await Overtime.findAll({
        where: {
          UserId: userId,
          status: Overtime.STATUS.APPROVED,
          overtimeDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['overtimeDate', 'DESC']]
      });

      // Calculate total overtime hours
      const totalHours = overtimes.reduce((sum, ot) => {
        return sum + parseFloat(ot.actualHours || ot.requestedHours || 0);
      }, 0);

      res.status(200).json({
        message: "My overtime history",
        period: {
          month: targetMonth,
          year: targetYear
        },
        summary: {
          totalOvertimes: overtimes.length,
          totalHours: parseFloat(totalHours.toFixed(2))
        },
        data: overtimes.map(ot => ({
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

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel overtime request (only pending)
   * DELETE /overtimes/:id
   */
  static async cancelOvertimeRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const overtime = await Overtime.findOne({
        where: {
          id,
          UserId: userId
        }
      });

      if (!overtime) {
        return res.status(404).json({
          message: "Overtime request not found"
        });
      }

      if (overtime.status !== Overtime.STATUS.PENDING) {
        return res.status(400).json({
          message: "Can only cancel pending overtime requests"
        });
      }

      await overtime.destroy();

      res.status(200).json({
        message: "Overtime request cancelled successfully"
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = OvertimeController;
