# Attendance Statistics Implementation

## Overview
Implementasi fitur statistik attendance yang menampilkan ringkasan kehadiran karyawan berdasarkan periode tertentu (harian, mingguan, bulanan).

## Features Implemented

### 1. Get My Statistics (GET /attendances/my-statistics)
- Mengambil statistik attendance user yang sedang login
- Support multiple periode: daily, weekly, monthly, custom
- Filter berdasarkan bulan dan tahun
- Menampilkan berbagai metrik kehadiran

## API Endpoint Used

```javascript
// Get My Statistics
GET /attendances/my-statistics?period=monthly&month=1&year=2026
Headers: Authorization: Bearer <token>

Response:
{
  "message": "My attendance statistics",
  "data": {
    "period": "January 2026",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalRecords": 20,
      "totalPresent": 18,
      "onTime": 15,
      "late": 3,
      "absent": 2,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 144.5,
      "attendanceRate": 90.0,
      "totalWorkDays": 20
    },
    "details": [
      {
        "id": 1,
        "userId": 5,
        "date": "2026-01-02",
        "clockIn": "2026-01-02T08:00:00.000Z",
        "clockOut": "2026-01-02T17:00:00.000Z",
        "status": "ON_TIME",
        "workHours": 8.0
      }
      // ... more records
    ]
  }
}
```

## Query Parameters

### Period Types
1. **daily** - Statistik hari ini
2. **weekly** - Statistik minggu ini
3. **monthly** - Statistik bulan tertentu (default)
4. **custom** - Periode custom dengan startDate & endDate

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| period | string | No | Tipe periode | `monthly` |
| month | number | Conditional | Bulan (1-12), required jika period=monthly | `1` |
| year | number | Conditional | Tahun (2000-2100), required jika period=monthly | `2026` |
| week | number | Conditional | Minggu (1-53), required jika period=weekly | `2` |
| startDate | string | Conditional | Tanggal mulai (YYYY-MM-DD), required jika period=custom | `2026-01-01` |
| endDate | string | Conditional | Tanggal akhir (YYYY-MM-DD), required jika period=custom | `2026-01-31` |

## Component Structure

### State Management

```javascript
// Statistics State
const [attendanceStatistics, setAttendanceStatistics] = useState(null)
const [statisticsPeriod, setStatisticsPeriod] = useState('monthly')
const [statisticsMonth, setStatisticsMonth] = useState(new Date().getMonth() + 1)
const [statisticsYear, setStatisticsYear] = useState(new Date().getFullYear())
const [showStatistics, setShowStatistics] = useState(false)
```

### Functions

**fetchAttendanceStatistics()**
```javascript
const fetchAttendanceStatistics = async () => {
  setLoading(true)
  try {
    const token = localStorage.getItem('access_token')
    
    // Build query parameters based on period
    let queryParams = `period=${statisticsPeriod}`
    
    if (statisticsPeriod === 'monthly') {
      queryParams += `&month=${statisticsMonth}&year=${statisticsYear}`
    } else if (statisticsPeriod === 'weekly') {
      queryParams += `&year=${statisticsYear}`
    }
    
    const { data } = await axios.get(
      `${baseUrl}/attendances/my-statistics?${queryParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    setAttendanceStatistics(data.data || null)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    toast.error('Gagal memuat statistik attendance')
  } finally {
    setLoading(false)
  }
}
```

## UI Components

### Statistics Section Structure

```
📊 Lihat Statistik Attendance (Toggle Button)
  └─ Statistics Container (Collapsible)
      ├─ Period Selector (Daily/Weekly/Monthly)
      ├─ Month & Year Selector (if monthly)
      ├─ Refresh Button
      └─ Statistics Display
          ├─ Period Info
          ├─ Main Statistics Cards
          │   ├─ Tepat Waktu (Green)
          │   ├─ Terlambat (Red)
          │   ├─ Absent (Gray)
          │   └─ Total Hadir (Blue)
          ├─ Additional Stats
          │   ├─ Jam Kerja Total
          │   ├─ Tingkat Kehadiran
          │   └─ Total Hari Kerja
          └─ Leave & Permission Stats (if any)
              ├─ Cuti (Yellow)
              ├─ Sakit (Orange)
              └─ Izin (Purple)
```

### Statistics Cards

#### Main Statistics (Grid 2x2)
1. **Tepat Waktu** (Green)
   - Shows: `summary.onTime`
   - Color: bg-green-100, text-green-700

2. **Terlambat** (Red)
   - Shows: `summary.late`
   - Color: bg-red-100, text-red-700

3. **Absent** (Gray)
   - Shows: `summary.absent`
   - Color: bg-gray-100, text-gray-700

4. **Total Hadir** (Blue)
   - Shows: `summary.totalPresent`
   - Color: bg-blue-100, text-blue-700

#### Additional Stats (Grid 1x3)
1. **Jam Kerja Total**
   - Shows: `summary.totalWorkHours` jam
   - Format: XX.X jam

2. **Tingkat Kehadiran**
   - Shows: `summary.attendanceRate`%
   - Format: XX.XX%

3. **Total Hari Kerja**
   - Shows: `summary.totalWorkDays` hari

#### Leave Stats (Grid 1x3) - Conditional
Only shown if any leave/sick/permission > 0

1. **Cuti** (Yellow)
   - Shows: `summary.leave`
   
2. **Sakit** (Orange)
   - Shows: `summary.sickLeave`
   
3. **Izin** (Purple)
   - Shows: `summary.permission`

## Features

### Period Selection
- **Daily**: Statistik untuk hari ini
- **Weekly**: Statistik untuk minggu ini
- **Monthly**: Statistik untuk bulan tertentu (dengan selector bulan & tahun)

### Month & Year Selector
- **Month Dropdown**: 12 bulan dalam Bahasa Indonesia
- **Year Dropdown**: 5 tahun terakhir dari tahun sekarang

### Toggle Show/Hide
- Button untuk menampilkan/menyembunyikan statistik
- Auto-fetch saat pertama kali dibuka (jika belum ada data)

### Refresh Functionality
- Button untuk refresh data statistik
- Menampilkan loading state saat fetch

## Metrics Explained

### Summary Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| totalRecords | Total record attendance | Count of all records |
| totalPresent | Total hadir (on-time + late + permission) | onTime + late + permission |
| onTime | Jumlah tepat waktu | Count ON_TIME status |
| late | Jumlah terlambat | Count LATE status |
| absent | Jumlah absent | Count ABSENT status |
| leave | Jumlah cuti | Count LEAVE status |
| sickLeave | Jumlah sakit | Count SICK_LEAVE status |
| permission | Jumlah izin | Count PERMISSION status |
| holiday | Jumlah libur | Count HOLIDAY status |
| totalWorkHours | Total jam kerja | Sum of work duration (clock-in to clock-out) |
| attendanceRate | Persentase kehadiran | (totalPresent / effectiveWorkDays) * 100 |
| totalWorkDays | Total hari kerja | totalPresent + absent + leave + sickLeave |

### Formulas

```javascript
// Attendance Rate
effectiveWorkDays = totalPresent + absent
attendanceRate = (totalPresent / effectiveWorkDays) * 100

// Total Work Hours
totalWorkHours = sum of all (clockOut - clockIn) durations

// Total Present
totalPresent = onTime + late + permission
```

## Usage Examples

### Example 1: View Monthly Statistics
```javascript
// User selects "Bulanan" period
// User selects "Januari" (month = 1)
// User selects "2026" (year = 2026)
// User clicks "Refresh Statistik"

// API Call:
GET /attendances/my-statistics?period=monthly&month=1&year=2026
```

### Example 2: View Daily Statistics
```javascript
// User selects "Harian" period
// User clicks "Refresh Statistik"

// API Call:
GET /attendances/my-statistics?period=daily
```

### Example 3: View Weekly Statistics
```javascript
// User selects "Mingguan" period
// User clicks "Refresh Statistik"

// API Call:
GET /attendances/my-statistics?period=weekly&year=2026
```

## Visual Design

### Color Scheme
- **Primary Container**: Gradient from blue-50 to indigo-50
- **White Cards**: bg-white for metric values
- **Status Colors**:
  - ✅ Green: On-time (positive)
  - ❌ Red: Late (negative)
  - ⚪ Gray: Absent (neutral)
  - 🔵 Blue: Total present (informative)
  - 🟡 Yellow: Leave (informative)
  - 🟠 Orange: Sick leave (warning)
  - 🟣 Purple: Permission (informative)

### Responsive Design
- Mobile: Grid cols-2 for main stats
- Desktop: Grid cols-4 for main stats
- All cards stack nicely on mobile

## Error Handling

### Client-Side
```javascript
try {
  // fetch statistics
} catch (error) {
  console.error('Error fetching statistics:', error)
  toast.error('Gagal memuat statistik attendance')
}
```

### Server-Side Errors
1. **400 Bad Request**
   - Invalid period
   - Invalid month/year/week
   - Missing required parameters

2. **401 Unauthorized**
   - Invalid or expired token

3. **500 Internal Server Error**
   - Database error
   - Calculation error

## Testing Checklist

### Functionality
- [ ] Toggle show/hide statistics works
- [ ] Auto-fetch on first open
- [ ] Period selector changes
- [ ] Month selector (for monthly)
- [ ] Year selector (for monthly)
- [ ] Refresh button works
- [ ] Loading state displays
- [ ] Statistics data displays correctly
- [ ] All metric values are correct
- [ ] Leave stats show conditionally

### UI/UX
- [ ] Cards display properly
- [ ] Colors match design
- [ ] Responsive on mobile
- [ ] Responsive on desktop
- [ ] Font sizes readable
- [ ] Spacing consistent
- [ ] Button states work
- [ ] Toast notifications show

### Data Validation
- [ ] Correct period passed to API
- [ ] Correct month/year passed
- [ ] Response data parsed correctly
- [ ] Numbers formatted properly
- [ ] Percentages show 2 decimals
- [ ] Hours show 1 decimal

### Edge Cases
- [ ] No data available
- [ ] All zeros
- [ ] Very large numbers
- [ ] Network error handling
- [ ] Token expiration

## Performance Considerations

1. **Lazy Loading**: Statistics only loaded when toggled
2. **Conditional Rendering**: Leave stats only shown if needed
3. **Efficient State**: Minimal re-renders
4. **Caching**: Data cached until refresh clicked

## Future Enhancements

1. **Charts & Graphs**
   - Bar chart for monthly comparison
   - Pie chart for status distribution
   - Line chart for trend over time

2. **Export to PDF/Excel**
   - Download statistics report
   - Custom date range

3. **Comparison View**
   - Compare multiple months
   - Year-over-year comparison

4. **Detailed Breakdown**
   - Daily breakdown within month
   - Click card to see details

5. **Notifications**
   - Alert if attendance rate < threshold
   - Monthly summary email

## Files Modified

```
client_Salmon-HRIS/src/views/EmployeePage.jsx
  - Added attendanceStatistics state
  - Added statisticsPeriod state
  - Added statisticsMonth state
  - Added statisticsYear state
  - Added showStatistics state
  - Added fetchAttendanceStatistics() function
  - Enhanced renderAttendance() with statistics section
```

## Dependencies

```json
{
  "axios": "^1.x.x",
  "react-toastify": "^9.x.x",
  "react": "^18.x.x"
}
```

## Environment Variables

```env
VITE_BASE_URL=http://localhost:3000
```

## API Documentation Reference

For complete API documentation, see:
- `/server/docs(md)/ATTENDANCE_SUMMARY_PERIOD.md`
- `/server/docs(md)/API_ENDPOINTS_COMPLETE.md`
