const { Attendance, User, WorkSchedule, Holiday } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange } = require('../helpers/utils');
const { 
  processAutoSetAbsent, 
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod 
} = require('../helpers/attendance');

class AttendanceAdminController {

  // Get all attendance records (Admin only)
  static async getAllAttendance(req, res, next) {
    try {
      const attendances = await Attendance.findAll({
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }],
        order: [['date', 'DESC']]
      });
      
      res.status(200).json({
        message: "All attendance records",
        data: attendances
      });
    } catch (error) {
      next(error);
    }
  }

  // Get today's attendance for specific user (Admin only)
  static async getTodayAttendance(req, res, next) {
    try {
      const { userId } = req.query;
      const { startOfDay, endOfDay } = getTodayRange();
      
      const whereClause = {
        date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      };

      if (userId) {
        whereClause.UserId = userId;
      }
      
      const attendances = await Attendance.findAll({
        where: whereClause,
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }]
      });
      
      res.status(200).json({ 
        message: "Today's attendance records",
        data: attendances
      });

    } catch (error) {
      next(error);
    }
  }

  // Auto set absent (Manual trigger by admin or cron job)
  static async autoSetAbsent(req, res, next) {
    try {
      const result = await processAutoSetAbsent();
      
      if (result.isHoliday) {
        return res.status(200).json({
          message: `Today is a holiday: ${result.holidayDescription}. ${result.absentCount} users marked as HOLIDAY.`,
          data: {
            isHoliday: true,
            holidayDescription: result.holidayDescription,
            markedCount: result.absentCount,
            markedUserIds: result.absentUserIds
          }
        });
      }
      
      res.status(200).json({ 
        message: `Auto set absent completed. ${result.absentCount} users marked as absent.`,
        data: {
          isHoliday: false,
          absentCount: result.absentCount,
          absentUserIds: result.absentUserIds
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #1: Admin manually create attendance for employee
  static async createManualAttendance(req, res, next) {
    try {
      const { userId, date, clockIn, clockOut, status } = req.body;

      // Validate required fields
      if (!userId || !date || !clockIn || !clockOut || !status) {
        return res.status(400).json({
          message: "All fields are required: userId, date, clockIn, clockOut, status"
        });
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Check if attendance already exists for this user on this date
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

      const existingAttendance = await Attendance.findOne({
        where: {
          UserId: userId,
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });

      if (existingAttendance) {
        return res.status(400).json({
          message: "Attendance record already exists for this user on this date"
        });
      }

      // Validate status
      const validStatuses = Object.values(Attendance.ATTENDANCE_STATUS);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
        });
      }

      // Get active work schedule
      const workSchedule = await WorkSchedule.findOne({
        where: { isActive: true }
      });

      // Check if date is a holiday
      const targetDate = new Date(date);
      const targetDateOnly = targetDate.toISOString().split('T')[0];
      const holiday = await Holiday.findOne({
        where: {
          date: targetDateOnly,
          isActive: true
        }
      });

      // Create manual attendance
      const manualAttendance = await Attendance.create({
        UserId: userId,
        WorkScheduleId: workSchedule ? workSchedule.id : null,
        HolidayId: (status === Attendance.ATTENDANCE_STATUS.HOLIDAY && holiday) ? holiday.id : null,
        date: new Date(date),
        clockIn: new Date(clockIn),
        clockOut: new Date(clockOut),
        status: status
      });

      res.status(201).json({
        message: "Manual attendance created successfully",
        data: manualAttendance
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #2: Admin edit manual attendance
  static async updateManualAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const { date, clockIn, clockOut, status } = req.body;

      // Find attendance record
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          message: "Attendance record not found"
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = Object.values(Attendance.ATTENDANCE_STATUS);
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
          });
        }
      }

      // Update fields if provided
      if (date) attendance.date = new Date(date);
      if (clockIn) attendance.clockIn = new Date(clockIn);
      if (clockOut) attendance.clockOut = new Date(clockOut);
      if (status) attendance.status = status;

      await attendance.save();

      res.status(200).json({
        message: "Attendance record updated successfully",
        data: attendance
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #3: Admin update work schedule (operational hours)
  static async updateWorkSchedule(req, res, next) {
    try {
      const { workStartTime, workEndTime, autoAbsentTime } = req.body;

      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      
      if (workStartTime && !timeRegex.test(workStartTime)) {
        return res.status(400).json({
          message: "Invalid workStartTime format. Use HH:MM (e.g., 09:00)"
        });
      }

      if (workEndTime && !timeRegex.test(workEndTime)) {
        return res.status(400).json({
          message: "Invalid workEndTime format. Use HH:MM (e.g., 17:00)"
        });
      }

      if (autoAbsentTime && !timeRegex.test(autoAbsentTime)) {
        return res.status(400).json({
          message: "Invalid autoAbsentTime format. Use HH:MM (e.g., 18:00)"
        });
      }

      // Get active work schedule (should only be one)
      let workSchedule = await WorkSchedule.findOne({
        where: { isActive: true }
      });

      // If no active schedule exists, create one
      if (!workSchedule) {
        workSchedule = await WorkSchedule.create({
          workStartTime: workStartTime || '09:00',
          workEndTime: workEndTime || '17:00',
          autoAbsentTime: autoAbsentTime || '18:00',
          isActive: true
        });
      } else {
        // Update existing schedule
        if (workStartTime) workSchedule.workStartTime = workStartTime;
        if (workEndTime) workSchedule.workEndTime = workEndTime;
        if (autoAbsentTime) workSchedule.autoAbsentTime = autoAbsentTime;
        
        await workSchedule.save();
      }

      res.status(200).json({
        message: "Work schedule updated successfully. Cron job will use new times.",
        data: workSchedule
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper: Get current work schedule (for admin)
  static async getWorkSchedule(req, res, next) {
    try {
      const workSchedule = await WorkSchedule.findOne({
        where: { isActive: true }
      });

      if (!workSchedule) {
        return res.status(404).json({
          message: "No active work schedule found"
        });
      }

      res.status(200).json({
        message: "Current work schedule",
        data: workSchedule
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #4a: Admin add holiday
  static async addHoliday(req, res, next) {
    try {
      const { date, description } = req.body;

      // Validate required fields
      if (!date || !description) {
        return res.status(400).json({
          message: "Date and description are required"
        });
      }

      // Check if holiday already exists
      const existingHoliday = await Holiday.findOne({
        where: { date: new Date(date) }
      });

      if (existingHoliday) {
        return res.status(400).json({
          message: "Holiday already exists for this date"
        });
      }

      // Create holiday
      const holiday = await Holiday.create({
        date: new Date(date),
        description: description,
        isActive: true
      });

      res.status(201).json({
        message: "Holiday added successfully",
        data: holiday
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #4b: Admin update holiday
  static async updateHoliday(req, res, next) {
    try {
      const { id } = req.params;
      const { date, description, isActive } = req.body;

      // Find holiday
      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return res.status(404).json({
          message: "Holiday not found"
        });
      }

      // If date is being updated, check if new date already exists (for other holiday)
      if (date) {
        const existingHoliday = await Holiday.findOne({
          where: { 
            date: new Date(date),
            id: { [Op.ne]: id } // Exclude current holiday
          }
        });

        if (existingHoliday) {
          return res.status(400).json({
            message: "Another holiday already exists for this date"
          });
        }
        
        holiday.date = new Date(date);
      }

      // Update other fields if provided
      if (description !== undefined) holiday.description = description;
      if (isActive !== undefined) holiday.isActive = isActive;

      await holiday.save();

      res.status(200).json({
        message: "Holiday updated successfully",
        data: holiday
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #4c: Admin delete holiday
  static async deleteHoliday(req, res, next) {
    try {
      const { id } = req.params;

      // Find holiday
      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return res.status(404).json({
          message: "Holiday not found"
        });
      }

      // Delete holiday
      await holiday.destroy();

      res.status(200).json({
        message: "Holiday deleted successfully",
        data: holiday
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper: Get all holidays (for admin)
  static async getAllHolidays(req, res, next) {
    try {
      const holidays = await Holiday.findAll({
        order: [['date', 'ASC']]
      });

      res.status(200).json({
        message: "All holidays",
        data: holidays
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #5: Admin get employee statistics
  static async getEmployeeStatistics(req, res, next) {
    try {
      const { userId } = req.params;
      const { month, year } = req.query;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Validate month and year
      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

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

      // Get statistics
      const statistics = await calculateAttendanceStatistics(userId, targetMonth, targetYear);

      res.status(200).json({
        message: `Attendance statistics for ${user.name}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        data: statistics
      });

    } catch (error) {
      next(error);
    }
  }

  // ENDPOINT #6: Admin get all employees statistics
  static async getAllEmployeesStatistics(req, res, next) {
    try {
      const { month, year } = req.query;

      // Validate month and year
      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

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

      // Get all users
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role'],
        order: [['name', 'ASC']]
      });

      // Get statistics for each user
      const allStatistics = await Promise.all(
        users.map(async (user) => {
          const statistics = await calculateAttendanceStatistics(user.id, targetMonth, targetYear);
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            },
            statistics: statistics.summary // Only summary, not details
          };
        })
      );

      // Calculate overall statistics
      const overallStats = {
        totalEmployees: users.length,
        totalPresent: allStatistics.reduce((sum, stat) => sum + stat.statistics.totalPresent, 0),
        totalOnTime: allStatistics.reduce((sum, stat) => sum + stat.statistics.onTime, 0),
        totalLate: allStatistics.reduce((sum, stat) => sum + stat.statistics.late, 0),
        totalAbsent: allStatistics.reduce((sum, stat) => sum + stat.statistics.absent, 0),
        totalLeave: allStatistics.reduce((sum, stat) => sum + stat.statistics.leave, 0),
        totalHoliday: allStatistics.reduce((sum, stat) => sum + stat.statistics.holiday, 0),
        totalWorkHours: parseFloat(
          allStatistics.reduce((sum, stat) => sum + stat.statistics.totalWorkHours, 0).toFixed(2)
        ),
        averageAttendanceRate: parseFloat(
          (allStatistics.reduce((sum, stat) => sum + stat.statistics.attendanceRate, 0) / users.length).toFixed(2)
        )
      };

      res.status(200).json({
        message: "All employees attendance statistics",
        month: targetMonth,
        year: targetYear,
        overall: overallStats,
        employees: allStatistics
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance summary with flexible period filter
   * Admin can see summary for all users or specific user
   * GET /attendances/admin/summary
   * Query params: period, userId, month, year, week, startDate, endDate
   */
  static async getAttendanceSummary(req, res, next) {
    try {
      const { period, userId, month, year, week, startDate, endDate } = req.query;

      // Default to monthly if no period specified
      const periodType = period || 'monthly';

      // Validate period
      const validPeriods = ['daily', 'weekly', 'monthly', 'custom'];
      if (!validPeriods.includes(periodType)) {
        return res.status(400).json({
          message: `Invalid period. Must be one of: ${validPeriods.join(', ')}`
        });
      }

      // Validate custom period
      if (periodType === 'custom' && (!startDate || !endDate)) {
        return res.status(400).json({
          message: "For custom period, both startDate and endDate are required (format: YYYY-MM-DD)"
        });
      }

      // Prepare options
      const options = {
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        week: week ? parseInt(week) : undefined,
        startDate,
        endDate
      };

      // Validate month
      if (options.month && (options.month < 1 || options.month > 12)) {
        return res.status(400).json({
          message: "Invalid month. Must be between 1 and 12"
        });
      }

      // Validate year
      if (options.year && (options.year < 2000 || options.year > 2100)) {
        return res.status(400).json({
          message: "Invalid year. Must be between 2000 and 2100"
        });
      }

      // Validate week
      if (options.week && (options.week < 1 || options.week > 53)) {
        return res.status(400).json({
          message: "Invalid week. Must be between 1 and 53"
        });
      }

      // If userId is provided, get summary for that user only
      if (userId) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        const statistics = await calculateAttendanceSummaryByPeriod(userId, periodType, options);

        return res.status(200).json({
          message: "Attendance summary for user",
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          data: statistics
        });
      }

      // If no userId, get summary for all users
      const allUsers = await User.findAll({
        attributes: ['id', 'name', 'email'],
        where: {
          role: 'Employee' // Only get employees
        }
      });

      if (allUsers.length === 0) {
        return res.status(200).json({
          message: "No employees found",
          data: {
            overall: null,
            employees: []
          }
        });
      }

      // Get summary for all users
      const allSummaries = await Promise.all(
        allUsers.map(async (user) => {
          const summary = await calculateAttendanceSummaryByPeriod(user.id, periodType, options);
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            },
            summary: summary.summary
          };
        })
      );

      // Calculate overall statistics
      const totalEmployees = allSummaries.length;
      const overallStats = {
        totalEmployees,
        totalPresent: allSummaries.reduce((sum, s) => sum + s.summary.totalPresent, 0),
        totalOnTime: allSummaries.reduce((sum, s) => sum + s.summary.onTime, 0),
        totalLate: allSummaries.reduce((sum, s) => sum + s.summary.late, 0),
        totalAbsent: allSummaries.reduce((sum, s) => sum + s.summary.absent, 0),
        totalLeave: allSummaries.reduce((sum, s) => sum + s.summary.leave, 0),
        totalSickLeave: allSummaries.reduce((sum, s) => sum + s.summary.sickLeave, 0),
        totalPermission: allSummaries.reduce((sum, s) => sum + s.summary.permission, 0),
        totalHoliday: allSummaries.reduce((sum, s) => sum + s.summary.holiday, 0),
        totalWorkHours: parseFloat(
          allSummaries.reduce((sum, s) => sum + s.summary.totalWorkHours, 0).toFixed(2)
        ),
        averageAttendanceRate: parseFloat(
          (allSummaries.reduce((sum, s) => sum + parseFloat(s.summary.attendanceRate), 0) / totalEmployees).toFixed(2)
        )
      };

      // Get one sample summary for period info
      const sampleSummary = await calculateAttendanceSummaryByPeriod(allUsers[0].id, periodType, options);

      res.status(200).json({
        message: "Attendance summary for all employees",
        period: sampleSummary.period,
        dateRange: sampleSummary.dateRange,
        overall: overallStats,
        employees: allSummaries
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceAdminController;
