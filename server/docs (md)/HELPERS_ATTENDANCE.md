# Attendance Helper Functions

File helper untuk attendance-related utilities dan business logic.

## 📁 Location
`server/helpers/attendance.js`

---

## 📚 Functions

### 1. `getTodayRange()`

Mendapatkan range waktu untuk hari ini (dari 00:00:00 sampai 23:59:59).

**Returns:**
- `Object`: 
  - `startOfDay` (Date): Awal hari (00:00:00.000)
  - `endOfDay` (Date): Akhir hari (23:59:59.999)

**Example:**
```javascript
const { getTodayRange } = require('../helpers/attendance');

const { startOfDay, endOfDay } = getTodayRange();
// startOfDay: 2026-01-01T00:00:00.000Z
// endOfDay: 2026-01-01T23:59:59.999Z
```

**Use Case:**
- Query attendance record untuk hari ini
- Filter data berdasarkan tanggal hari ini

---

### 2. `calculateWorkDuration(clockIn, clockOut)`

Menghitung durasi kerja berdasarkan waktu clock-in dan clock-out.

**Parameters:**
- `clockIn` (Date): Waktu clock-in
- `clockOut` (Date): Waktu clock-out

**Returns:**
- `Number`: Durasi kerja dalam jam (hours), dibulatkan 2 desimal

**Example:**
```javascript
const { calculateWorkDuration } = require('../helpers/attendance');

const clockIn = new Date('2026-01-01T08:30:00');
const clockOut = new Date('2026-01-01T17:00:00');

const duration = calculateWorkDuration(clockIn, clockOut);
// Result: 8.5 (jam)
```

**Use Case:**
- Menghitung total jam kerja saat clock-out
- Reporting dan analytics

---

### 3. `isLateClockIn(clockInTime)`

Mengecek apakah waktu clock-in dianggap terlambat.

**Parameters:**
- `clockInTime` (Date): Waktu clock-in yang akan dicek

**Returns:**
- `Boolean`: 
  - `true` jika terlambat (clock-in > 09:00)
  - `false` jika tepat waktu (clock-in ≤ 09:00)

**Configuration:**
- Work start time: **09:00:00** (dapat diubah di function)

**Example:**
```javascript
const { isLateClockIn } = require('../helpers/attendance');

const onTime = new Date('2026-01-01T08:45:00');
const late = new Date('2026-01-01T09:15:00');

isLateClockIn(onTime);  // false
isLateClockIn(late);    // true
```

**Use Case:**
- Validasi keterlambatan
- Menentukan status akhir attendance

---

### 4. `determineFinalStatus(clockInTime)`

Menentukan status final attendance berdasarkan waktu clock-in.

**Parameters:**
- `clockInTime` (Date): Waktu clock-in

**Returns:**
- `String`: 
  - `"ON_TIME"` jika clock-in ≤ 09:00
  - `"LATE"` jika clock-in > 09:00

**Example:**
```javascript
const { determineFinalStatus } = require('../helpers/attendance');

const clockIn1 = new Date('2026-01-01T08:30:00');
const clockIn2 = new Date('2026-01-01T10:00:00');

determineFinalStatus(clockIn1);  // "ON_TIME"
determineFinalStatus(clockIn2);  // "LATE"
```

**Use Case:**
- Set status final saat clock-out
- Update attendance record

---

## 🎯 Usage in Controllers

### Import
```javascript
const { 
  getTodayRange, 
  calculateWorkDuration, 
  determineFinalStatus 
} = require('../helpers/attendance');
```

### Example Usage
```javascript
// Get today's attendance
const { startOfDay, endOfDay } = getTodayRange();
const attendance = await Attendance.findOne({
  where: {
    UserId: userId,
    date: {
      [Op.between]: [startOfDay, endOfDay]
    }
  }
});

// Clock-out logic
const clockOutTime = new Date();
attendance.clockOut = clockOutTime;
attendance.status = determineFinalStatus(attendance.clockIn);

const duration = calculateWorkDuration(attendance.clockIn, clockOutTime);
```

---

## ⚙️ Configuration

### Change Work Start Time

Edit function `isLateClockIn` di `server/helpers/attendance.js`:

```javascript
const isLateClockIn = (clockInTime) => {
  const clockIn = new Date(clockInTime);
  const workStartTime = new Date(clockIn);
  workStartTime.setHours(9, 0, 0, 0); // Change this line
  // Example: 8:00 AM → setHours(8, 0, 0, 0)
  // Example: 9:30 AM → setHours(9, 30, 0, 0)
  
  return clockIn > workStartTime;
};
```

### Change Duration Precision

Edit function `calculateWorkDuration`:

```javascript
const calculateWorkDuration = (clockIn, clockOut) => {
  const diffMs = new Date(clockOut) - new Date(clockIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // 2 decimal
  // 3 decimal: Math.round(diffHours * 1000) / 1000
  // 1 decimal: Math.round(diffHours * 10) / 10
  // Integer: Math.round(diffHours)
};
```

---

## 🧪 Testing

### Test getTodayRange
```javascript
const { getTodayRange } = require('./helpers/attendance');
const { startOfDay, endOfDay } = getTodayRange();

console.log('Start:', startOfDay);
console.log('End:', endOfDay);
console.log('Diff hours:', (endOfDay - startOfDay) / (1000 * 60 * 60));
// Expected: 23.99... hours
```

### Test calculateWorkDuration
```javascript
const { calculateWorkDuration } = require('./helpers/attendance');

const test1 = calculateWorkDuration(
  new Date('2026-01-01T09:00:00'),
  new Date('2026-01-01T17:00:00')
);
console.log('8 hours work:', test1); // 8

const test2 = calculateWorkDuration(
  new Date('2026-01-01T08:30:00'),
  new Date('2026-01-01T17:15:00')
);
console.log('8.75 hours work:', test2); // 8.75
```

### Test isLateClockIn
```javascript
const { isLateClockIn } = require('./helpers/attendance');

console.log('08:59:', isLateClockIn(new Date('2026-01-01T08:59:00'))); // false
console.log('09:00:', isLateClockIn(new Date('2026-01-01T09:00:00'))); // false
console.log('09:01:', isLateClockIn(new Date('2026-01-01T09:01:00'))); // true
```

### Test determineFinalStatus
```javascript
const { determineFinalStatus } = require('./helpers/attendance');

console.log('Early:', determineFinalStatus(new Date('2026-01-01T07:00:00'))); // ON_TIME
console.log('On time:', determineFinalStatus(new Date('2026-01-01T09:00:00'))); // ON_TIME
console.log('Late:', determineFinalStatus(new Date('2026-01-01T10:00:00'))); // LATE
```

---

## 📦 Dependencies

### Internal
- `models/attendance.js` - ATTENDANCE_STATUS enum

### External
- None (pure JavaScript Date manipulation)

---

## 🔄 Import Map

```
attendance.js
    ├── attendanceController.js (uses all functions)
    ├── cronJobs.js (uses getTodayRange)
    └── Future: reportController.js, analyticsController.js, etc.
```

---

## 💡 Best Practices

1. **Reusability**: Helper functions dapat digunakan di multiple controllers
2. **Testability**: Pure functions mudah untuk di-unit test
3. **Maintainability**: Business logic terpusat di satu file
4. **Clean Code**: Controller lebih clean, fokus ke orchestration
5. **Single Responsibility**: Setiap function punya satu tujuan spesifik

---

## 🚀 Future Enhancements

### Possible Additional Helpers:

```javascript
// Grace period (toleransi keterlambatan)
const isWithinGracePeriod = (clockInTime, gracePeriodMinutes = 15) => {
  // Implementation
};

// Overtime calculation
const calculateOvertime = (clockIn, clockOut, standardHours = 8) => {
  const duration = calculateWorkDuration(clockIn, clockOut);
  return Math.max(0, duration - standardHours);
};

// Weekend/Holiday checker
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Working days calculation
const getWorkingDaysInMonth = (year, month) => {
  // Implementation
};
```

---

## 📝 Changelog

### v1.0.0 (2026-01-01)
- ✅ Initial release
- ✅ Created getTodayRange function
- ✅ Created calculateWorkDuration function
- ✅ Created isLateClockIn function
- ✅ Created determineFinalStatus function
- ✅ JSDoc documentation added
