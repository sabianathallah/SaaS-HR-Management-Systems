const { Attendance, User, WorkSchedule } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange, calculateWorkDuration } = require('../helpers/utils');
const { 
  determineFinalStatus,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
} = require('../helpers/attendance');

class AttendanceController {
  // Controllers for regular users (employees)

  static async clockIn(req, res, next) {
    try {
      const userId = req.user.id;
      const { startOfDay, endOfDay } = getTodayRange();
      
      // Cek apakah user sudah clock-in hari ini
      const existingAttendance = await Attendance.findOne({
        where: {
          UserId: userId,
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      
      // Jika sudah clock-in hari ini, return error
      if (existingAttendance) {
        return res.status(400).json({ 
          message: "Already clocked in today" 
        });
      }
      
      // Validasi foto (sudah dihandle di middleware, tapi double check)
      if (!req.photoInfo || !req.photoInfo.relativePath) {
        return res.status(400).json({
          message: "Photo is required for clock-in",
          error: "PHOTO_REQUIRED"
        });
      }
      
      // Get active work schedule
      const workSchedule = await WorkSchedule.findOne({
        where: { isActive: true }
      });
      
      // Jika belum, buat attendance baru dengan foto
      const now = new Date();
      const newAttendance = await Attendance.create({
        UserId: userId,
        WorkScheduleId: workSchedule ? workSchedule.id : null, // Save reference to work schedule
        HolidayId: null, // Not a holiday
        date: now,
        clockIn: now,
        clockOut: now, // Default value, akan diupdate saat clock-out
        status: Attendance.ATTENDANCE_STATUS.ON_PROGRESS, // Sedang bekerja
        photoCheckIn: req.photoInfo.relativePath // Save foto path
      });
      
      res.status(201).json({ 
        message: "Clock-in successful",
        data: newAttendance,
        photoInfo: {
          uploaded: true,
          path: req.photoInfo.relativePath,
          size: `${Math.round(req.photoInfo.size / 1024)} KB`
        }
      });

    } catch (error) {
      next(error);
    }
  }

  static async clockOut(req, res, next) {
    try {
      const userId = req.user.id;
      const { startOfDay, endOfDay } = getTodayRange();
      
      // Cari attendance hari ini
      const attendance = await Attendance.findOne({
        where: {
          UserId: userId,
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      
      // Jika tidak ada record clock-in hari ini, return error
      if (!attendance) {
        return res.status(400).json({ 
          message: "No clock-in record found for today" 
        });
      }
      
      // Jika sudah clock-out, return error
      if (attendance.status !== Attendance.ATTENDANCE_STATUS.ON_PROGRESS) {
        return res.status(400).json({
          message: "Already clocked out today"
        });
      }
      
      // Validasi foto (sudah dihandle di middleware, tapi double check)
      if (!req.photoInfo || !req.photoInfo.relativePath) {
        return res.status(400).json({
          message: "Photo is required for clock-out",
          error: "PHOTO_REQUIRED"
        });
      }
      
      // Update record dengan clock-out time, status final, dan foto
      const clockOutTime = new Date();
      attendance.clockOut = clockOutTime;
      attendance.status = await determineFinalStatus(attendance.clockIn);
      attendance.photoCheckOut = req.photoInfo.relativePath; // Save foto path
      await attendance.save();
      
      // Hitung durasi kerja
      const workDuration = calculateWorkDuration(attendance.clockIn, clockOutTime);
      
      res.status(200).json({ 
        message: "Clock-out successful",
        data: {
          ...attendance.toJSON(),
          workDurationHours: workDuration
        },
        photoInfo: {
          uploaded: true,
          path: req.photoInfo.relativePath,
          size: `${Math.round(req.photoInfo.size / 1024)} KB`
        }
      });

    } catch (error) {
      next(error);
    }
  }

  static async getMyAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      
      const attendances = await Attendance.findAll({
        where: { UserId: userId },
        order: [['date', 'DESC']]
      });
      
      res.status(200).json({ 
        message: "My attendance records",
        data: attendances
      });

    } catch (error) {
      next(error);
    }
  }

  static async getTodayAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      const { startOfDay, endOfDay } = getTodayRange();
      
      const attendance = await Attendance.findOne({
        where: {
          UserId: userId,
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      
      if (!attendance) {
        return res.status(200).json({ 
          message: "No attendance record for today",
          data: null
        });
      }

      // Hitung durasi jika sudah clock-out
      let workDuration = null;
      if (attendance.status !== Attendance.ATTENDANCE_STATUS.ON_PROGRESS) {
        workDuration = calculateWorkDuration(attendance.clockIn, attendance.clockOut);
      }
      
      res.status(200).json({ 
        message: "Today's attendance record",
        data: {
          ...attendance.toJSON(),
          workDurationHours: workDuration
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get my attendance statistics
  static async getMyStatistics(req, res, next) {
    try {
      const userId = req.user.id;
      const { period, month, year, week, startDate, endDate } = req.query;

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

      // Get statistics
      const statistics = await calculateAttendanceSummaryByPeriod(userId, periodType, options);

      res.status(200).json({
        message: "My attendance statistics",
        data: statistics
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;