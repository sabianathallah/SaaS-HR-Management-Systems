const { Attendance, User, WorkSchedule, Shift, OfficeLocation, WorkLocationChangeRequest, HybridSchedule } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange, calculateWorkDuration } = require('../helpers/utils');
const { 
  determineFinalStatus,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
} = require('../helpers/attendance');
const { validateAttendanceLocation } = require('../helpers/geolocation');
const { shouldValidateGPS, getWorkLocationInfo } = require('../helpers/workLocation');
const AuditLogger = require('../helpers/auditLogger');

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

      // Check effective work location type for today
      const currentDate = new Date();
      const workLocationInfo = await getWorkLocationInfo(userId, currentDate);
      const requiresGPS = workLocationInfo.requiresGPS;

      // Default values for location validation
      let locationValidation = {
        status: 'not_checked',
        distance: null,
        officeLocationId: null
      };

      // GPS Validation - check berdasarkan work location type & shift
      const isFlexibleShift = user?.shift?.name?.toLowerCase() === 'flexible';
      
      // GPS required jika:
      // 1. Bukan flexible shift DAN
      // 2. Work location type adalah ONSITE
      if (!isFlexibleShift && requiresGPS) {
        // Validasi GPS required untuk onsite attendance
        if (!latitude || !longitude) {
          return res.status(400).json({
            message: "GPS location is required for onsite attendance",
            error: "GPS_REQUIRED",
            hint: "Please enable location access on your device",
            workLocationInfo: {
              type: workLocationInfo.locationType,
              source: workLocationInfo.source
            }
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
          
          // Jika di luar radius, JANGAN set officeLocationId
          // Biarkan null agar tidak menampilkan nama kantor
          locationValidation.officeLocationId = null;
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
      let locationInfo;
      
      if (isFlexibleShift || !requiresGPS) {
        // WFH/Remote/Flexible shift - location not required
        locationInfo = {
          workLocationType: workLocationInfo.locationType,
          workLocationSource: workLocationInfo.source,
          message: workLocationInfo.locationType === 'WFH' 
            ? 'Working from home - location not required'
            : workLocationInfo.locationType === 'REMOTE'
            ? 'Remote work - location not required'
            : 'Flexible shift - location not required',
          requiresGPS: false
        };
      } else if (locationValidation.isValid && locationValidation.officeLocationId) {
        // Jika di dalam radius kantor
        locationInfo = {
          workLocationType: workLocationInfo.locationType,
          workLocationSource: workLocationInfo.source,
          type: 'office',
          validationStatus: locationValidation.status,
          message: locationValidation.message,
          distance: locationValidation.distance ? `${Math.round(locationValidation.distance)}m` : null,
          officeName: locationValidation.nearestOffice?.name,
          officeAddress: locationValidation.nearestOffice?.address
        };
      } else if (latitude && longitude) {
        // Jika di luar radius (punya koordinat tapi tidak valid)
        locationInfo = {
          workLocationType: workLocationInfo.locationType,
          workLocationSource: workLocationInfo.source,
          type: 'remote',
          validationStatus: locationValidation.status,
          message: locationValidation.message || 'Clock-in from remote location',
          distance: locationValidation.distance ? `${Math.round(locationValidation.distance)}m from nearest office` : null,
          coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
          warning: 'Outside office radius - may require admin approval'
        };
      } else {
        locationInfo = {
          workLocationType: workLocationInfo.locationType,
          workLocationSource: workLocationInfo.source,
          type: 'unknown',
          message: 'No location data available'
        };
      }

      const responseData = {
        ...newAttendance.toJSON(),
        locationInfo
      };

      // Log to audit
      await AuditLogger.logCreate(
        userId,
        'Attendances',
        newAttendance.id,
        newAttendance.toJSON(),
        req.ip,
        req.get('user-agent'),
        `Clock-in at ${now.toLocaleTimeString()}`
      );
      
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
      
      // Jika sudah clock-out atau status bukan ON_PROGRESS, return error
      // Status seperti LEAVE, SICK_LEAVE, HOLIDAY, ABSENT, PERMISSION tidak perlu clock-out
      const statusesThatCanClockOut = [
        Attendance.ATTENDANCE_STATUS.ON_PROGRESS,
        Attendance.ATTENDANCE_STATUS.ON_TIME,
        Attendance.ATTENDANCE_STATUS.LATE
      ];
      
      if (!statusesThatCanClockOut.includes(attendance.status)) {
        return res.status(400).json({
          message: `Cannot clock-out. Current status is ${attendance.status}. Only ON_PROGRESS, ON_TIME, or LATE status can be clocked out.`,
          currentStatus: attendance.status
        });
      }
      
      if (attendance.clockOut) {
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

      // Capture old data before update
      const oldData = { ...attendance.toJSON() };
      
      // Update record dengan clock-out time, status final, dan foto
      const clockOutTime = new Date();
      attendance.clockOut = clockOutTime;
      // Pass userId dan shift agar bisa cek apakah flexible shift
      attendance.status = await determineFinalStatus(attendance.clockIn, userId, attendance.shift);
      attendance.photoCheckOut = req.photoInfo.relativePath;
      
      // Save GPS data for clock-out (if provided)
      if (latitude && longitude) {
        attendance.clockOutLatitude = latitude;
        attendance.clockOutLongitude = longitude;
      }
      
      await attendance.save();
      
      // Hitung durasi kerja
      const workDuration = calculateWorkDuration(attendance.clockIn, clockOutTime);

      // Prepare location info for response
      let clockOutLocationInfo = null;
      if (latitude && longitude) {
        clockOutLocationInfo = {
          coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
          message: 'Clock-out location recorded'
        };
      }

      // Prepare clock-in location info for reference
      let clockInLocationInfo = null;
      if (attendance.officeLocationId) {
        // Clock-in dari kantor
        const officeLocation = await OfficeLocation.findByPk(attendance.officeLocationId);
        if (officeLocation) {
          clockInLocationInfo = {
            type: 'office',
            officeName: officeLocation.name,
            officeAddress: officeLocation.address,
            coordinates: {
              latitude: attendance.clockInLatitude,
              longitude: attendance.clockInLongitude
            },
            googleMapsUrl: `https://www.google.com/maps?q=${attendance.clockInLatitude},${attendance.clockInLongitude}`
          };
        }
      } else if (attendance.clockInLatitude && attendance.clockInLongitude) {
        // Clock-in dari lokasi remote
        clockInLocationInfo = {
          type: 'remote',
          message: 'Clocked-in from remote location',
          coordinates: {
            latitude: attendance.clockInLatitude,
            longitude: attendance.clockInLongitude
          },
          googleMapsUrl: `https://www.google.com/maps?q=${attendance.clockInLatitude},${attendance.clockInLongitude}`
        };
      }

      // Log to audit
      await AuditLogger.logUpdate(
        userId,
        'Attendances',
        attendance.id,
        oldData,
        attendance.toJSON(),
        req.ip,
        req.get('user-agent'),
        `Clock-out at ${clockOutTime.toLocaleTimeString()}, work duration: ${workDuration} hours`
      );
      
      res.status(200).json({ 
        message: "Clock-out successful",
        data: {
          ...attendance.toJSON(),
          workDurationHours: workDuration
        },
        locationInfo: {
          clockIn: clockInLocationInfo,
          clockOut: clockOutLocationInfo
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
        include: [{
          model: OfficeLocation,
          as: 'office_location',  // Harus sesuai dengan alias di model
          attributes: ['id', 'name', 'address', 'latitude', 'longitude']
        }],
        order: [['date', 'DESC']]
      });

      // Enrich attendance data with location info
      const enrichedAttendances = attendances.map(attendance => {
        const attendanceData = attendance.toJSON();
        
        // Clock-in location info
        let clockInLocationInfo = null;
        if (attendanceData.office_location) {  // Sesuaikan dengan alias
          clockInLocationInfo = {
            type: 'office',
            officeName: attendanceData.office_location.name,
            officeAddress: attendanceData.office_location.address,
            coordinates: {
              latitude: attendanceData.clockInLatitude,
              longitude: attendanceData.clockInLongitude
            },
            googleMapsUrl: attendanceData.clockInLatitude && attendanceData.clockInLongitude 
              ? `https://www.google.com/maps?q=${attendanceData.clockInLatitude},${attendanceData.clockInLongitude}`
              : null,
            displayText: attendanceData.office_location.name
          };
        } else if (attendanceData.clockInLatitude && attendanceData.clockInLongitude) {
          const lat = parseFloat(attendanceData.clockInLatitude);
          const lng = parseFloat(attendanceData.clockInLongitude);
          clockInLocationInfo = {
            type: 'remote',
            message: 'Clocked-in from remote location',
            coordinates: {
              latitude: lat,
              longitude: lng
            },
            googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
            displayText: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          };
        } else {
          clockInLocationInfo = {
            type: 'unknown',
            message: 'No location data available',
            displayText: 'N/A'
          };
        }

        // Clock-out location info
        let clockOutLocationInfo = null;
        if (attendanceData.clockOutLatitude && attendanceData.clockOutLongitude) {
          const lat = parseFloat(attendanceData.clockOutLatitude);
          const lng = parseFloat(attendanceData.clockOutLongitude);
          clockOutLocationInfo = {
            coordinates: {
              latitude: lat,
              longitude: lng
            },
            googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
            displayText: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          };
        } else {
          clockOutLocationInfo = {
            type: 'unknown',
            message: 'Not clocked out yet or no location data',
            displayText: 'N/A'
          };
        }

        return {
          ...attendanceData,
          locationInfo: {
            clockIn: clockInLocationInfo,
            clockOut: clockOutLocationInfo
          }
        };
      });
      
      res.status(200).json({ 
        message: "My attendance records",
        data: enrichedAttendances
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
        },
        include: [{
          model: OfficeLocation,
          as: 'office_location',  // Harus sesuai dengan alias di model
          attributes: ['id', 'name', 'address', 'latitude', 'longitude']
        }]
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

      const attendanceData = attendance.toJSON();

      // Clock-in location info
      let clockInLocationInfo = null;
      if (attendanceData.office_location) {  // Sesuaikan dengan alias
        clockInLocationInfo = {
          type: 'office',
          officeName: attendanceData.office_location.name,
          officeAddress: attendanceData.office_location.address,
          coordinates: {
            latitude: attendanceData.clockInLatitude,
            longitude: attendanceData.clockInLongitude
          },
          googleMapsUrl: attendanceData.clockInLatitude && attendanceData.clockInLongitude 
            ? `https://www.google.com/maps?q=${attendanceData.clockInLatitude},${attendanceData.clockInLongitude}`
            : null,
          displayText: attendanceData.office_location.name // Untuk ditampilkan di UI
        };
      } else if (attendanceData.clockInLatitude && attendanceData.clockInLongitude) {
        const lat = parseFloat(attendanceData.clockInLatitude);
        const lng = parseFloat(attendanceData.clockInLongitude);
        clockInLocationInfo = {
          type: 'remote',
          message: 'Clocked-in from remote location',
          coordinates: {
            latitude: lat,
            longitude: lng
          },
          googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          displayText: `${lat.toFixed(6)}, ${lng.toFixed(6)}` // Tampilkan koordinat
        };
      } else {
        // Fallback jika tidak ada data lokasi sama sekali
        clockInLocationInfo = {
          type: 'unknown',
          message: 'No location data available',
          displayText: 'N/A'
        };
      }

      // Clock-out location info
      let clockOutLocationInfo = null;
      if (attendanceData.clockOutLatitude && attendanceData.clockOutLongitude) {
        const lat = parseFloat(attendanceData.clockOutLatitude);
        const lng = parseFloat(attendanceData.clockOutLongitude);
        clockOutLocationInfo = {
          coordinates: {
            latitude: lat,
            longitude: lng
          },
          googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          displayText: `${lat.toFixed(6)}, ${lng.toFixed(6)}` // Tampilkan koordinat
        };
      } else {
        clockOutLocationInfo = {
          type: 'unknown',
          message: 'Not clocked out yet or no location data',
          displayText: 'N/A'
        };
      }
      
      res.status(200).json({ 
        message: "Today's attendance record",
        data: {
          ...attendanceData,
          workDurationHours: workDuration,
          locationInfo: {
            clockIn: clockInLocationInfo,
            clockOut: clockOutLocationInfo
          }
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