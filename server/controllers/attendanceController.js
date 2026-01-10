const { Attendance, User, WorkSchedule, Shift, OfficeLocation } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange, calculateWorkDuration } = require('../helpers/utils');
const { 
  determineFinalStatus,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
} = require('../helpers/attendance');
const { validateAttendanceLocation } = require('../helpers/geolocation');

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

      // Get GPS coordinates from request body
      const { latitude, longitude } = req.body;

      // Get user's shift information
      const user = await User.findByPk(userId, {
        include: [{
          model: Shift,
          as: 'shift'
        }]
      });

      // Default values for location validation
      let locationValidation = {
        status: 'not_checked',
        distance: null,
        officeLocationId: null
      };

      // GPS Validation - hanya untuk shift NON-FLEXIBLE
      const isFlexibleShift = user?.shift?.name?.toLowerCase() === 'flexible';
      
      if (!isFlexibleShift) {
        // Validasi GPS required untuk shift non-flexible
        if (!latitude || !longitude) {
          return res.status(400).json({
            message: "GPS location is required for office attendance",
            error: "GPS_REQUIRED",
            hint: "Please enable location access on your device"
          });
        }

        // Get all active office locations
        const officeLocations = await OfficeLocation.findAll({
          where: { is_active: true }
        });

        if (officeLocations.length === 0) {
          return res.status(400).json({
            message: "No active office location configured. Please contact admin.",
            error: "NO_OFFICE_LOCATION"
          });
        }

        // Validate location with geo-fencing
        locationValidation = validateAttendanceLocation(
          latitude,
          longitude,
          officeLocations
        );

        // SOFT VALIDATION: Jangan reject, tapi tandai untuk review admin
        // Bisa di-reject jika mau strict validation
        if (!locationValidation.isValid) {
          // Log untuk admin review (optional)
          console.log('⚠️ Clock-in outside radius:', {
            userId,
            status: locationValidation.status,
            distance: locationValidation.distance,
            message: locationValidation.message
          });
        }
      }
      
      // Get active work schedule
      const workSchedule = await WorkSchedule.findOne({
        where: { isActive: true }
      });
      
      // Jika belum, buat attendance baru dengan foto + GPS data
      const now = new Date();
      const newAttendance = await Attendance.create({
        UserId: userId,
        WorkScheduleId: workSchedule ? workSchedule.id : null,
        ShiftId: user?.shift?.id || null,
        HolidayId: null,
        date: now,
        clockIn: now,
        clockOut: null, // NULL - akan diisi saat clock-out
        status: Attendance.ATTENDANCE_STATUS.ON_PROGRESS,
        photoCheckIn: req.photoInfo.relativePath,
        // GPS data
        clockInLatitude: latitude || null,
        clockInLongitude: longitude || null,
        officeLocationId: locationValidation.officeLocationId,
        locationValidationStatus: locationValidation.status,
        distanceFromOffice: locationValidation.distance
      });

      // Include office location info in response
      const responseData = {
        ...newAttendance.toJSON(),
        locationInfo: isFlexibleShift ? {
          message: 'WFH/Flexible shift - location not required'
        } : {
          validationStatus: locationValidation.status,
          message: locationValidation.message,
          distance: locationValidation.distance ? `${Math.round(locationValidation.distance)}m` : null,
          officeName: locationValidation.nearestOffice?.name
        }
      };
      
      res.status(201).json({ 
        message: "Clock-in successful",
        data: responseData,
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
        },
        include: [{
          model: Shift,
          as: 'shift'
        }]
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

      // Get GPS coordinates from request body
      const { latitude, longitude } = req.body;

      // GPS Validation untuk clock-out (optional, bisa di-skip)
      // Biasanya clock-out tidak se-strict clock-in
      const isFlexibleShift = attendance.shift?.name?.toLowerCase() === 'flexible';
      
      // Update record dengan clock-out time, status final, dan foto
      const clockOutTime = new Date();
      attendance.clockOut = clockOutTime;
      attendance.status = await determineFinalStatus(attendance.clockIn);
      attendance.photoCheckOut = req.photoInfo.relativePath;
      
      // Save GPS data for clock-out (if provided)
      if (latitude && longitude) {
        attendance.clockOutLatitude = latitude;
        attendance.clockOutLongitude = longitude;
      }
      
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