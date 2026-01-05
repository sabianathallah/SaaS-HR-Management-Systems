# SHIFT INTEGRATION GUIDE

## Overview
Panduan ini menjelaskan cara mengintegrasikan fitur Shift dengan sistem Attendance yang sudah ada.

---

## 1. Integration dengan Attendance Controller

### Clock-In dengan Shift Detection

#### File: `controllers/attendanceController.js`

```javascript
const { Attandance, WorkSchedule, User, Shift } = require('../models');
const { getApplicableShift, determineStatusWithShift } = require('../helpers/shift');

// Clock-in endpoint
static async clockIn(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get user with shift
    const user = await User.findByPk(userId, {
      include: [{ model: Shift, as: 'shift' }]
    });

    // Get applicable shift for this user
    const shift = await getApplicableShift(null, user);

    // Determine status based on shift
    let status = 'ON_PROGRESS';
    if (shift) {
      status = determineStatusWithShift(now, shift);
    }

    // Create attendance record
    const attendance = await Attandance.create({
      UserId: userId,
      ShiftId: shift ? shift.id : null, // Save shift reference
      WorkScheduleId: workSchedule ? workSchedule.id : null,
      date: now,
      clockIn: now,
      status: status
    });

    res.status(201).json({
      success: true,
      message: 'Clock-in successful',
      data: {
        attendance,
        shift: shift ? {
          id: shift.id,
          name: shift.name,
          time: `${shift.startTime} - ${shift.endTime}`
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 2. Integration dengan Overtime Calculation

### File: `controllers/overtimeController.js`

```javascript
const { Overtime, Attandance, User, Shift } = require('../models');
const { 
  getApplicableShift, 
  calculateOvertimeWithShift 
} = require('../helpers/shift');

// Request overtime endpoint
static async requestOvertime(req, res, next) {
  try {
    const userId = req.user.id;
    const { attendanceId, reason } = req.body;

    // Get attendance with shift
    const attendance = await Attandance.findByPk(attendanceId, {
      include: [
        { model: User },
        { model: Shift, as: 'shift' }
      ]
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance not found'
      });
    }

    if (!attendance.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'Please clock-out first before requesting overtime'
      });
    }

    // Get applicable shift
    const shift = await getApplicableShift(attendance, attendance.User);

    // Calculate overtime with shift
    const overtimeCalc = calculateOvertimeWithShift(
      attendance.clockIn,
      attendance.clockOut,
      shift
    );

    if (!overtimeCalc.hasOvertime) {
      return res.status(400).json({
        success: false,
        message: `Overtime duration (${overtimeCalc.overtimeMinutes} minutes) does not meet threshold (${shift.overtimeThreshold} minutes)`,
        data: {
          overtimeMinutes: overtimeCalc.overtimeMinutes,
          threshold: shift ? shift.overtimeThreshold : 15,
          shift: shift ? shift.name : 'No shift'
        }
      });
    }

    // Create overtime request
    const overtime = await Overtime.create({
      UserId: userId,
      AttendanceId: attendanceId,
      date: attendance.date,
      startTime: overtimeCalc.expectedEndTime,
      endTime: attendance.clockOut,
      duration: overtimeCalc.overtimeHours,
      reason: reason,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Overtime request created successfully',
      data: {
        overtime,
        calculation: {
          overtimeMinutes: overtimeCalc.overtimeMinutes,
          overtimeHours: overtimeCalc.overtimeHours,
          shift: shift ? shift.name : 'No shift',
          expectedEndTime: overtimeCalc.expectedEndTime,
          actualEndTime: overtimeCalc.actualEndTime
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 3. Auto-Calculate Late Minutes

### Add Late Minutes Field to Attendance

Create migration to add `lateMinutes` field:

```javascript
// Migration: add-late-minutes-to-attendance.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Attandances', 'lateMinutes', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Jumlah menit keterlambatan'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Attandances', 'lateMinutes');
  }
};
```

### Update Clock-In to Calculate Late Minutes

```javascript
const { isLateClockInWithShift } = require('../helpers/shift');

// Inside clock-in handler
const shift = await getApplicableShift(null, user);
const lateCheck = isLateClockInWithShift(now, shift);

const attendance = await Attandance.create({
  UserId: userId,
  ShiftId: shift ? shift.id : null,
  date: now,
  clockIn: now,
  status: lateCheck.isLate ? 'LATE' : 'ON_PROGRESS',
  lateMinutes: lateCheck.lateMinutes
});
```

---

## 4. Enhanced Attendance Summary with Shift

### File: `controllers/attendanceController.js`

```javascript
static async getAttendanceSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const attendances = await Attandance.findAll({
      where: {
        UserId: userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { 
          model: Shift, 
          as: 'shift',
          attributes: ['id', 'name', 'startTime', 'endTime']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Group by shift
    const shiftSummary = {};
    
    attendances.forEach(att => {
      const shiftName = att.shift ? att.shift.name : 'No Shift';
      
      if (!shiftSummary[shiftName]) {
        shiftSummary[shiftName] = {
          count: 0,
          onTime: 0,
          late: 0,
          totalLateMinutes: 0
        };
      }
      
      shiftSummary[shiftName].count++;
      
      if (att.status === 'ON_TIME') {
        shiftSummary[shiftName].onTime++;
      } else if (att.status === 'LATE') {
        shiftSummary[shiftName].late++;
        shiftSummary[shiftName].totalLateMinutes += (att.lateMinutes || 0);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalDays: attendances.length,
        shiftBreakdown: shiftSummary,
        details: attendances
      }
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 5. Admin: Override Shift for Specific Attendance

### Endpoint untuk Admin Override Shift

```javascript
// File: controllers/attendances_isAdminController.js

/**
 * PUT /api/attendances/admin/:attendanceId/shift
 * Override shift untuk attendance tertentu
 */
static async overrideAttendanceShift(req, res, next) {
  try {
    const { attendanceId } = req.params;
    const { shiftId } = req.body;

    const attendance = await Attandance.findByPk(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance not found'
      });
    }

    if (shiftId) {
      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      // Recalculate status based on new shift
      const { isLate, lateMinutes } = isLateClockInWithShift(
        attendance.clockIn, 
        shift
      );

      attendance.ShiftId = shiftId;
      attendance.status = isLate ? 'LATE' : 'ON_TIME';
      attendance.lateMinutes = lateMinutes;
    } else {
      // Remove shift override
      attendance.ShiftId = null;
    }

    await attendance.save();

    const updated = await Attandance.findByPk(attendanceId, {
      include: [{ model: Shift, as: 'shift' }]
    });

    res.status(200).json({
      success: true,
      message: 'Shift override applied successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
```

Add route:
```javascript
// routes/attendance_isAdmin.js
router.put('/:attendanceId/shift', AttendancesAdminController.overrideAttendanceShift);
```

---

## 6. User: View My Shift

### Endpoint untuk User melihat shift mereka

```javascript
// File: controllers/userController.js (or create new)

/**
 * GET /api/users/me/shift
 * Get current user's assigned shift
 */
static async getMyShift(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        { 
          model: Shift, 
          as: 'shift',
          attributes: ['id', 'name', 'startTime', 'endTime', 'breakDuration', 'lateTolerance', 'description']
        }
      ],
      attributes: ['id', 'name', 'email']
    });

    if (!user.shift) {
      return res.status(200).json({
        success: true,
        message: 'No shift assigned. Using default shift.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          shift: null
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully retrieved user shift',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        shift: user.shift
      }
    });
  } catch (error) {
    next(error);
  }
}
```

Add route:
```javascript
// routes/user.js (create if not exists)
const express = require('express');
const router = express.Router();
const authentication = require('../middlewares/authentication');

router.use(authentication);
router.get('/me/shift', UserController.getMyShift);

module.exports = router;
```

Register in `routes/index.js`:
```javascript
const userRouter = require('./user');
router.use('/users', userRouter);
```

---

## 7. Report: Shift Performance

### Admin Endpoint untuk Shift Performance Report

```javascript
/**
 * GET /api/shifts/admin/shifts/:id/performance
 * Get performance report for specific shift
 */
static async getShiftPerformance(req, res, next) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Get all attendances for this shift
    const whereClause = { ShiftId: id };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const attendances = await Attandance.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          attributes: ['id', 'name', 'email'] 
        }
      ]
    });

    // Calculate statistics
    const stats = {
      totalAttendances: attendances.length,
      onTime: 0,
      late: 0,
      absent: 0,
      totalLateMinutes: 0,
      averageLateMinutes: 0,
      latePercentage: 0
    };

    attendances.forEach(att => {
      if (att.status === 'ON_TIME') stats.onTime++;
      if (att.status === 'LATE') {
        stats.late++;
        stats.totalLateMinutes += (att.lateMinutes || 0);
      }
      if (att.status === 'ABSENT') stats.absent++;
    });

    if (stats.late > 0) {
      stats.averageLateMinutes = Math.round(stats.totalLateMinutes / stats.late);
    }

    if (stats.totalAttendances > 0) {
      stats.latePercentage = Math.round((stats.late / stats.totalAttendances) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        shift: {
          id: shift.id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime
        },
        period: { startDate, endDate },
        statistics: stats,
        topLateUsers: attendances
          .filter(a => a.status === 'LATE')
          .sort((a, b) => (b.lateMinutes || 0) - (a.lateMinutes || 0))
          .slice(0, 10)
          .map(a => ({
            user: a.User.name,
            lateMinutes: a.lateMinutes,
            date: a.date
          }))
      }
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Complete Integration Checklist

### Backend Changes
- [x] Create Shift model and migration
- [x] Add ShiftId to User model
- [x] Add ShiftId to Attendance model
- [x] Create shift helper functions
- [x] Update attendance helpers to use shift
- [ ] Add lateMinutes field to Attendance
- [ ] Update clock-in to calculate late with shift
- [ ] Update clock-out to calculate overtime with shift
- [ ] Add shift info to attendance responses

### API Endpoints
- [x] CRUD shifts (admin)
- [x] Assign/remove shift to user (admin)
- [ ] Override shift for attendance (admin)
- [ ] Get my shift (user)
- [ ] Get shift performance report (admin)

### Testing
- [ ] Test clock-in with different shifts
- [ ] Test late calculation with shift tolerance
- [ ] Test overtime calculation with shift threshold
- [ ] Test shift override
- [ ] Test shift performance report

### Documentation
- [x] SHIFT_FEATURE.md
- [x] TESTING_SHIFT_ENDPOINTS.md
- [x] SHIFT_INTEGRATION_GUIDE.md

---

## Migration Path

### For Existing Data

```sql
-- Set default shift for all existing users without shift
UPDATE Users 
SET ShiftId = (SELECT id FROM Shifts WHERE name = 'Shift Siang' LIMIT 1)
WHERE ShiftId IS NULL AND role = 'user';

-- Update existing attendances to use user's shift
UPDATE Attandances a
JOIN Users u ON a.UserId = u.id
SET a.ShiftId = u.ShiftId
WHERE a.ShiftId IS NULL;
```

---

## Next Steps

1. **Add lateMinutes field** to track exact late minutes
2. **Update clock-in controller** to use shift-based calculation
3. **Update clock-out controller** to calculate overtime with shift
4. **Add shift info to responses** for better frontend integration
5. **Create shift performance reports** for analytics
6. **Add shift override endpoint** for admin flexibility
7. **Test thoroughly** with different shift scenarios
