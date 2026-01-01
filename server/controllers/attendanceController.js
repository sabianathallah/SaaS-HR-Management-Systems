const { Attandance, User } = require('../models');
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
      attendance.status = determineFinalStatus(attendance.clockIn);
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
}

module.exports = AttendanceController