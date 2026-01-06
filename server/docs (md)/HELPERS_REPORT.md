# Report Helper Functions Documentation

## Overview
Helper functions untuk membantu generate reports dan export data attendance dalam berbagai format (Excel, CSV, JSON).

## Location
`server/helpers/report.js`

## Usage

```javascript
const {
  calculateWorkHours,
  formatDate,
  formatDateTime,
  getMonthName,
  calculateAttendanceStats,
  groupAttendancesByUser,
  calculateStatusBreakdown,
  getCurrentMonthRange,
  getMonthRange,
  validateMonthYear,
  generateFileName,
  prepareCSVData
} = require('../helpers/report');
```

## Functions

### 1. calculateWorkHours(clockIn, clockOut)
Menghitung total jam kerja antara clock in dan clock out.

**Parameters:**
- `clockIn` (Date|String): Waktu clock in
- `clockOut` (Date|String): Waktu clock out

**Returns:** String - Jam kerja dalam format decimal (e.g., "8.50")

**Example:**
```javascript
const hours = calculateWorkHours('2026-01-06T09:00:00', '2026-01-06T18:00:00');
// Returns: "9.00"
```

---

### 2. formatDate(date)
Format date ke format YYYY-MM-DD.

**Parameters:**
- `date` (Date|String): Date object atau date string

**Returns:** String - Formatted date (e.g., "2026-01-06")

**Example:**
```javascript
const formatted = formatDate(new Date());
// Returns: "2026-01-06"
```

---

### 3. formatDateTime(datetime)
Format datetime ke Indonesian locale.

**Parameters:**
- `datetime` (Date|String): Datetime object atau string

**Returns:** String - Formatted datetime (e.g., "06/01/2026, 15.30.00")

**Example:**
```javascript
const formatted = formatDateTime('2026-01-06T15:30:00');
// Returns: "06/01/2026, 15.30.00"
```

---

### 4. getMonthName(month)
Mendapatkan nama bulan dalam bahasa Inggris dari nomor bulan.

**Parameters:**
- `month` (Number): Nomor bulan (1-12)

**Returns:** String - Nama bulan (e.g., "January")

**Example:**
```javascript
const monthName = getMonthName(1);
// Returns: "January"

const monthName = getMonthName(12);
// Returns: "December"
```

---

### 5. calculateAttendanceStats(attendances)
Menghitung statistik attendance dari array attendance records.

**Parameters:**
- `attendances` (Array): Array of attendance objects

**Returns:** Object dengan properties:
- `totalDays` (Number): Total hari attendance
- `onTime` (Number): Jumlah on-time
- `late` (Number): Jumlah late
- `absent` (Number): Jumlah absent
- `leave` (Number): Jumlah leave/cuti
- `present` (Number): Total present (onTime + late)
- `totalWorkHours` (String): Total jam kerja
- `averageWorkHours` (String): Rata-rata jam kerja per hari
- `attendanceRate` (String): Persentase kehadiran

**Example:**
```javascript
const stats = calculateAttendanceStats(attendances);
// Returns:
// {
//   totalDays: 20,
//   onTime: 15,
//   late: 3,
//   absent: 2,
//   leave: 0,
//   present: 18,
//   totalWorkHours: "180.00",
//   averageWorkHours: "9.00",
//   attendanceRate: "90.00"
// }
```

---

### 6. groupAttendancesByUser(attendances)
Mengelompokkan attendance berdasarkan user dan menghitung statistik per user.

**Parameters:**
- `attendances` (Array): Array of attendance objects dengan User include

**Returns:** Array of objects dengan properties:
- `userId` (Number): User ID
- `userName` (String): Nama user
- `userEmail` (String): Email user
- `totalDays` (Number): Total hari
- `present` (Number): Total hadir
- `late` (Number): Jumlah terlambat
- `absent` (Number): Jumlah tidak hadir
- `leave` (Number): Jumlah cuti
- `workHours` (String): Total jam kerja
- `attendanceRate` (String): Attendance rate %
- `attendances` (Array): Array attendance objects

**Example:**
```javascript
const userStats = groupAttendancesByUser(attendances);
// Returns:
// [
//   {
//     userId: 2,
//     userName: "Budi Santoso",
//     userEmail: "budi@company.com",
//     totalDays: 20,
//     present: 18,
//     late: 3,
//     absent: 2,
//     leave: 0,
//     workHours: "180.00",
//     attendanceRate: "90.00",
//     attendances: [...]
//   }
// ]
```

---

### 7. calculateStatusBreakdown(attendances)
Menghitung breakdown status dari attendance records.

**Parameters:**
- `attendances` (Array): Array of attendance objects

**Returns:** Object - Status counts

**Example:**
```javascript
const breakdown = calculateStatusBreakdown(attendances);
// Returns:
// {
//   "PRESENT": 15,
//   "LATE": 3,
//   "ABSENT": 2
// }
```

---

### 8. getCurrentMonthRange()
Mendapatkan date range untuk bulan ini.

**Parameters:** None

**Returns:** Object dengan properties:
- `startDate` (Date): Tanggal 1 bulan ini
- `endDate` (Date): Tanggal terakhir bulan ini

**Example:**
```javascript
const range = getCurrentMonthRange();
// Returns:
// {
//   startDate: Date(2026-01-01T00:00:00.000Z),
//   endDate: Date(2026-01-31T23:59:59.999Z)
// }
```

---

### 9. getMonthRange(month, year)
Mendapatkan date range untuk bulan dan tahun tertentu.

**Parameters:**
- `month` (Number): Nomor bulan (1-12)
- `year` (Number): Tahun (e.g., 2026)

**Returns:** Object dengan properties:
- `startDate` (Date): Tanggal 1 bulan tersebut
- `endDate` (Date): Tanggal terakhir bulan tersebut

**Example:**
```javascript
const range = getMonthRange(2, 2026);
// Returns:
// {
//   startDate: Date(2026-02-01T00:00:00.000Z),
//   endDate: Date(2026-02-28T23:59:59.999Z)
// }
```

---

### 10. validateMonthYear(month, year)
Validasi parameter month dan year.

**Parameters:**
- `month` (Number|String): Nomor bulan (1-12)
- `year` (Number|String): Tahun

**Returns:** Object dengan properties:
- `isValid` (Boolean): Apakah valid
- `error` (String): Error message jika tidak valid

**Example:**
```javascript
const validation = validateMonthYear(13, 2026);
// Returns:
// {
//   isValid: false,
//   error: "Month must be a number between 1 and 12"
// }

const validation = validateMonthYear(1, 2026);
// Returns: { isValid: true }
```

---

### 11. generateFileName(prefix, extension)
Generate nama file untuk export dengan timestamp.

**Parameters:**
- `prefix` (String): Prefix nama file
- `extension` (String): Extension tanpa dot (e.g., "xlsx", "csv")

**Returns:** String - Formatted filename

**Example:**
```javascript
const filename = generateFileName('attendance_report', 'xlsx');
// Returns: "attendance_report_1735736400000.xlsx"

const filename = generateFileName('monthly_report', 'csv');
// Returns: "monthly_report_1735736400123.csv"
```

---

### 12. prepareCSVData(attendances)
Mengkonversi attendance data ke format siap untuk CSV export.

**Parameters:**
- `attendances` (Array): Array of attendance objects dengan User include

**Returns:** Array of objects dengan column names sebagai keys

**Example:**
```javascript
const csvData = prepareCSVData(attendances);
// Returns:
// [
//   {
//     'User ID': 2,
//     'Employee Name': 'Budi Santoso',
//     'Date': '2026-01-06',
//     'Clock In': '06/01/2026, 09.00.00',
//     'Clock Out': '06/01/2026, 18.00.00',
//     'Status': 'PRESENT',
//     'Work Hours': '9.00'
//   }
// ]
```

---

## Usage in Controllers

### Example 1: Export to CSV
```javascript
const { prepareCSVData } = require('../helpers/report');
const { Parser } = require('json2csv');

const attendances = await Attendance.findAll({ include: [User] });
const data = prepareCSVData(attendances);

const fields = ['User ID', 'Employee Name', 'Date', 'Clock In', 'Clock Out', 'Status', 'Work Hours'];
const parser = new Parser({ fields });
const csv = parser.parse(data);

res.setHeader('Content-Type', 'text/csv');
res.send(csv);
```

### Example 2: Calculate Statistics
```javascript
const { calculateAttendanceStats, getCurrentMonthRange } = require('../helpers/report');

const { startDate, endDate } = getCurrentMonthRange();
const attendances = await Attendance.findAll({
  where: {
    date: { [Op.between]: [startDate, endDate] }
  }
});

const stats = calculateAttendanceStats(attendances);
console.log(stats);
// { totalDays: 20, onTime: 15, late: 3, ... }
```

### Example 3: Group by User
```javascript
const { groupAttendancesByUser } = require('../helpers/report');

const attendances = await Attendance.findAll({
  include: [{ model: User, attributes: ['id', 'name', 'email'] }]
});

const userStats = groupAttendancesByUser(attendances);
// Array of user statistics
```

### Example 4: Generate Monthly Report
```javascript
const { getMonthRange, getMonthName, validateMonthYear } = require('../helpers/report');

const { month, year } = req.query;
const validation = validateMonthYear(month, year);

if (!validation.isValid) {
  return res.status(400).json({ error: validation.error });
}

const { startDate, endDate } = getMonthRange(parseInt(month), parseInt(year));
const monthName = getMonthName(parseInt(month));

console.log(`Generating report for ${monthName} ${year}`);
```

## Testing

Run tests untuk helper functions:

```bash
# Test all helpers
npm test helpers/report.test.js

# Test specific function
npm test -- -t "calculateWorkHours"
```

## Notes

1. **Date Handling**: Semua function yang menerima date parameter bisa menerima Date object atau date string
2. **Null Safety**: Functions sudah handle null/undefined values dengan gracefully return default values
3. **Timezone**: formatDateTime menggunakan Indonesian locale ('id-ID')
4. **Precision**: Work hours dihitung dengan precision 2 decimal places
5. **Performance**: Functions dioptimasi untuk handle large datasets (tested dengan 10,000+ records)

## Dependencies

- None (pure JavaScript utilities)
- Used by: `reportController.js`

## Version History

- v1.0.0 (2026-01-06): Initial release dengan 12 helper functions
