const { Attandance } = require('../models');
const { Op } = require('sequelize');

// Helper function untuk mendapatkan start dan end of day
const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
};

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
      
      // Update record dengan clock-out time
      attendance.clockOut = new Date();
      await attendance.save();
      
      res.status(200).json({ 
        message: "Clock-out successful",
        data: attendance
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
}

module.exports = AttendanceController