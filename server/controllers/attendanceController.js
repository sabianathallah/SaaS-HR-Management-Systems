const { Attandance, User, WorkSchedule, Holiday } = require('../models');
const { Op } = require('sequelize');
const { 
  getTodayRange, 
  calculateWorkDuration, 
  determineFinalStatus 
} = require('../helpers/attendance');

class AttendanceController {

  static async getAllAttendance(req, res, next) {
    try {
      const attendances = await Attandance.findAll();
      res.status(200).json({
        message: "All attendance records",
        data: attendances
      });
    } catch (error) {
      next(error);
    }
  }

  static async clockIn(req, res, next) {
    try {
      const userId = req.user.id;
      const { startOfDay, endOfDay } = getTodayRange();
      
      // Cek apakah user sudah clock-in hari ini
      const existingAttendance = await Attandance.findOne({
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
      
      // Jika belum, buat attendance baru
      const now = new Date();
      const newAttendance = await Attandance.create({
        UserId: userId,
        date: now,
        clockIn: now,
        clockOut: now, // Default value, akan diupdate saat clock-out
        status: Attandance.ATTENDANCE_STATUS.ON_PROGRESS // Sedang bekerja
      });
      
      res.status(201).json({ 
        message: "Clock-in successful",
        data: newAttendance
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
      const attendance = await Attandance.findOne({
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
      
      // Update record dengan clock-out time dan status final
      const clockOutTime = new Date();
      attendance.clockOut = clockOutTime;
      attendance.status = await determineFinalStatus(attendance.clockIn);
      await attendance.save();
      
      // Hitung durasi kerja
      const workDuration = calculateWorkDuration(attendance.clockIn, clockOutTime);
      
      res.status(200).json({ 
        message: "Clock-out successful",
        data: {
          ...attendance.toJSON(),
          workDurationHours: workDuration
        }
      });

    } catch (error) {
      next(error);
    }
  }

  static async getMyAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      
      const attendances = await Attandance.findAll({
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
      
      const attendance = await Attandance.findOne({
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
      if (attendance.status !== Attandance.ATTENDANCE_STATUS.ON_PROGRESS) {
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

  // Method untuk auto set absent (dipanggil oleh cron job atau scheduler)
  static async autoSetAbsent(req, res, next) {
    try {
      const { startOfDay, endOfDay } = getTodayRange();
      
      // Get all users
      const allUsers = await User.findAll({
        attributes: ['id']
      });
      
      // Get users yang sudah clock-in hari ini
      const attendedUserIds = await Attandance.findAll({
        where: {
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        attributes: ['UserId']
      });
      
      const attendedIds = attendedUserIds.map(a => a.UserId);
      
      // Filter users yang belum clock-in
      const absentUsers = allUsers.filter(user => !attendedIds.includes(user.id));
      
      // Create absent records for users yang tidak hadir
      const absentRecords = await Promise.all(
        absentUsers.map(user => 
          Attandance.create({
            UserId: user.id,
            date: new Date(),
            clockIn: new Date(),
            clockOut: new Date(),
            status: Attandance.ATTENDANCE_STATUS.ABSENT
          })
        )
      );
      
      res.status(200).json({ 
        message: `Auto set absent completed. ${absentRecords.length} users marked as absent.`,
        data: {
          absentCount: absentRecords.length,
          absentUserIds: absentUsers.map(u => u.id)
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
}

module.exports = AttendanceController