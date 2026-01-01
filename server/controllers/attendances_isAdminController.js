const { Attandance, User, WorkSchedule, Holiday } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange, processAutoSetAbsent } = require('../helpers/attendance');

class AttendanceAdminController {

  // Get all attendance records (Admin only)
  static async getAllAttendance(req, res, next) {
    try {
      const attendances = await Attandance.findAll({
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
      
      const attendances = await Attandance.findAll({
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

      const existingAttendance = await Attandance.findOne({
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
      const validStatuses = Object.values(Attandance.ATTENDANCE_STATUS);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
        });
      }

      // Create manual attendance
      const manualAttendance = await Attandance.create({
        UserId: userId,
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
      const attendance = await Attandance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          message: "Attendance record not found"
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = Object.values(Attandance.ATTENDANCE_STATUS);
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

  // ENDPOINT #4b: Admin delete holiday
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
}

module.exports = AttendanceAdminController;
