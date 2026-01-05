# Refactoring: Helper Functions Separation

## Summary
Memisahkan helper functions berdasarkan model/responsibility untuk better code organization dan maintainability.

## Changes Made

### 1. Created `helpers/utils.js` (NEW)
**Pure utility functions** tanpa dependency ke database models.

**Functions:**
- ✅ `getTodayRange()` - Get start and end of day
- ✅ `calculateWorkDuration()` - Calculate work hours between two dates
- ✅ `getWeekNumber()` - Get week number of the year
- ✅ `getDateRangeForPeriod()` - Get date range for different periods (daily, weekly, monthly, custom)
- ✅ `formatDate()` - Format date to YYYY-MM-DD
- ✅ `isSameDay()` - Check if two dates are the same day
- ✅ `getDaysBetween()` - Get number of days between two dates

**Exports:**
```javascript
module.exports = {
  getTodayRange,
  calculateWorkDuration,
  getWeekNumber,
  getDateRangeForPeriod,
  formatDate,
  isSameDay,
  getDaysBetween
};
```

---

### 2. Updated `helpers/attendance.js`
**Attendance-specific functions** yang menggunakan Attendance model dan business logic.

**Functions (After refactoring):**
- ✅ `isLateClockIn()` - Check if clock-in is late (uses User, Shift, WorkSchedule models)
- ✅ `determineFinalStatus()` - Determine final status (ON_TIME or LATE)
- ✅ `processAutoSetAbsent()` - Auto set absent for users (uses Attendance, User, Holiday, WorkSchedule)
- ✅ `calculateAttendanceStatistics()` - Calculate attendance statistics for a user
- ✅ `calculateAttendanceSummaryByPeriod()` - Calculate attendance summary for a period

**Removed from attendance.js (moved to utils.js):**
- ❌ `getTodayRange()`
- ❌ `calculateWorkDuration()`
- ❌ `getDateRangeForPeriod()`
- ❌ `getWeekNumber()`

**Exports:**
```javascript
module.exports = {
  isLateClockIn,
  determineFinalStatus,
  processAutoSetAbsent,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
};
```

---

### 3. Updated `helpers/shift.js` (No Changes)
Already well-structured, shift-specific functions only.

**Functions:**
- ✅ `getApplicableShift()`
- ✅ `isLateClockInWithShift()`
- ✅ `calculateOvertimeWithShift()`
- ✅ `calculateWorkDurationWithBreak()`
- ✅ `determineStatusWithShift()`
- ✅ `formatShiftTime()`

---

### 4. Updated Controllers (Import Changes)

#### `controllers/attendanceController.js`
**Before:**
```javascript
const { 
  getTodayRange, 
  calculateWorkDuration, 
  determineFinalStatus,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
} = require('../helpers/attendance');
```

**After:**
```javascript
const { getTodayRange, calculateWorkDuration } = require('../helpers/utils');
const { 
  determineFinalStatus,
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod
} = require('../helpers/attendance');
```

#### `controllers/attendances_isAdminController.js`
**Before:**
```javascript
const { 
  getTodayRange, 
  processAutoSetAbsent, 
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod 
} = require('../helpers/attendance');
```

**After:**
```javascript
const { getTodayRange } = require('../helpers/utils');
const { 
  processAutoSetAbsent, 
  calculateAttendanceStatistics,
  calculateAttendanceSummaryByPeriod 
} = require('../helpers/attendance');
```

#### `controllers/overtimeAdminController.js`
**Before:**
```javascript
const { getDateRangeForPeriod } = require('../helpers/attendance');
```

**After:**
```javascript
const { getDateRangeForPeriod } = require('../helpers/utils');
```

---

## File Structure

```
server/
├── helpers/
│   ├── attendance.js      ← Attendance-specific (uses Attendance model)
│   ├── shift.js           ← Shift-specific (uses Shift model)
│   ├── utils.js           ← NEW! Pure utilities (no model dependency)
│   ├── bcrypt.js          ← Bcrypt utilities
│   └── jwt.js             ← JWT utilities
```

---

## Benefits

### ✅ Better Code Organization
- Functions are grouped by their responsibility
- Easy to find specific functions
- Clear separation of concerns

### ✅ Reusability
- Pure utility functions can be used anywhere
- No circular dependency issues
- Easier to test

### ✅ Maintainability
- Changes to utilities don't affect business logic
- Business logic is isolated from utilities
- Easier to understand code flow

### ✅ Performance
- No unnecessary model imports for simple utilities
- Smaller file sizes
- Better code splitting

---

## Usage Examples

### Using Utils
```javascript
const { getTodayRange, calculateWorkDuration, formatDate } = require('../helpers/utils');

// Get today's date range
const { startOfDay, endOfDay } = getTodayRange();

// Calculate work hours
const hours = calculateWorkDuration(clockIn, clockOut);

// Format date
const formattedDate = formatDate(new Date());
```

### Using Attendance Helpers
```javascript
const { 
  isLateClockIn, 
  processAutoSetAbsent,
  calculateAttendanceStatistics 
} = require('../helpers/attendance');

// Check if late
const isLate = await isLateClockIn(clockInTime, userId);

// Process auto absent
const result = await processAutoSetAbsent();

// Get statistics
const stats = await calculateAttendanceStatistics(userId, month, year);
```

### Using Shift Helpers
```javascript
const { 
  getApplicableShift,
  isLateClockInWithShift,
  calculateOvertimeWithShift 
} = require('../helpers/shift');

// Get applicable shift
const shift = await getApplicableShift(attendance, user);

// Check late with shift
const lateInfo = isLateClockInWithShift(clockInTime, shift);

// Calculate overtime with shift
const overtimeInfo = calculateOvertimeWithShift(clockIn, clockOut, shift);
```

---

## Testing

### Test Utils
```bash
node -e 'const utils = require("./helpers/utils"); console.log("Utils:", Object.keys(utils));'

# Output:
Utils: [
  'getTodayRange',
  'calculateWorkDuration',
  'getWeekNumber',
  'getDateRangeForPeriod',
  'formatDate',
  'isSameDay',
  'getDaysBetween'
]
```

### Test Attendance Helpers
```bash
node -e 'const att = require("./helpers/attendance"); console.log("Attendance:", Object.keys(att));'

# Output:
Attendance: [
  'isLateClockIn',
  'determineFinalStatus',
  'processAutoSetAbsent',
  'calculateAttendanceStatistics',
  'calculateAttendanceSummaryByPeriod'
]
```

---

## Migration Guide

If you have custom code importing from `helpers/attendance`, update imports:

### OLD CODE:
```javascript
const { getTodayRange } = require('../helpers/attendance');
const { calculateWorkDuration } = require('../helpers/attendance');
const { getDateRangeForPeriod } = require('../helpers/attendance');
```

### NEW CODE:
```javascript
const { getTodayRange, calculateWorkDuration, getDateRangeForPeriod } = require('../helpers/utils');
```

---

## Files Modified

1. ✅ `helpers/utils.js` - NEW FILE
2. ✅ `helpers/attendance.js` - Refactored
3. ✅ `controllers/attendanceController.js` - Updated imports
4. ✅ `controllers/attendances_isAdminController.js` - Updated imports
5. ✅ `controllers/overtimeAdminController.js` - Updated imports

**Total:** 1 new file, 4 files modified

---

## Impact

### ✅ No Breaking Changes
- All functionality remains the same
- API endpoints unchanged
- Database queries unchanged

### ✅ Better Developer Experience
- Clearer code structure
- Easier to navigate
- Improved code readability

---

## Future Improvements

Consider creating more specialized helper files:

- `helpers/user.js` - User-specific functions
- `helpers/overtime.js` - Overtime-specific functions
- `helpers/leaveRequest.js` - Leave request-specific functions
- `helpers/holiday.js` - Holiday-specific functions
- `helpers/workSchedule.js` - Work schedule-specific functions

---

## Date
January 5, 2026
