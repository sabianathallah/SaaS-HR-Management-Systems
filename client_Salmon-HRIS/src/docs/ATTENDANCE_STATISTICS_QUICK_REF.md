# Attendance Statistics - Quick Reference

## 🚀 Quick Start

### User Flow
1. Login → Tab "Attendance"
2. Klik "📊 Lihat Statistik Attendance"
3. Pilih periode (Harian/Mingguan/Bulanan)
4. [If monthly] Pilih bulan & tahun
5. Klik "Refresh Statistik"
6. Lihat statistik ditampilkan ✅

---

## 📊 Metrics Overview

| Metric | Icon | Color | Description |
|--------|------|-------|-------------|
| Tepat Waktu | ✅ | Green | Jumlah hadir tepat waktu |
| Terlambat | ❌ | Red | Jumlah terlambat |
| Absent | ⚪ | Gray | Jumlah tidak hadir |
| Total Hadir | 🔵 | Blue | Total kehadiran (on-time + late + permission) |
| Jam Kerja Total | ⏰ | White | Total jam kerja dalam periode |
| Tingkat Kehadiran | 📈 | White | Persentase kehadiran |
| Total Hari Kerja | 📅 | White | Total hari kerja efektif |
| Cuti | 🟡 | Yellow | Jumlah cuti |
| Sakit | 🟠 | Orange | Jumlah sakit |
| Izin | 🟣 | Purple | Jumlah izin |

---

## 🎯 API Endpoint

```
GET /attendances/my-statistics
```

### Query Parameters

**Monthly (Default):**
```
?period=monthly&month=1&year=2026
```

**Weekly:**
```
?period=weekly&year=2026
```

**Daily:**
```
?period=daily
```

---

## 💻 Code Snippets

### Fetch Statistics
```javascript
const fetchAttendanceStatistics = async () => {
  const token = localStorage.getItem('access_token')
  let queryParams = `period=${statisticsPeriod}`
  
  if (statisticsPeriod === 'monthly') {
    queryParams += `&month=${statisticsMonth}&year=${statisticsYear}`
  }
  
  const { data } = await axios.get(
    `${baseUrl}/attendances/my-statistics?${queryParams}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  setAttendanceStatistics(data.data)
}
```

### Display Metric
```jsx
<div className="bg-green-100 rounded-lg p-4 text-center">
  <p className="text-sm text-gray-600 mb-1">Tepat Waktu</p>
  <p className="text-2xl font-bold text-green-700">
    {attendanceStatistics.summary.onTime}
  </p>
</div>
```

---

## 🎨 UI Components

### Period Selector
```jsx
<select
  value={statisticsPeriod}
  onChange={(e) => setStatisticsPeriod(e.target.value)}
>
  <option value="daily">Harian</option>
  <option value="weekly">Mingguan</option>
  <option value="monthly">Bulanan</option>
</select>
```

### Month Selector (Conditional)
```jsx
{statisticsPeriod === 'monthly' && (
  <select
    value={statisticsMonth}
    onChange={(e) => setStatisticsMonth(parseInt(e.target.value))}
  >
    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
      <option key={month} value={month}>
        {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
      </option>
    ))}
  </select>
)}
```

---

## 📱 Responsive Grid

**Mobile:**
```jsx
<div className="grid grid-cols-2 gap-4">
  {/* Main stats */}
</div>
```

**Desktop:**
```jsx
<div className="grid md:grid-cols-4 gap-4">
  {/* Main stats */}
</div>
```

---

## ✅ Validation Rules

### Month
- Min: 1
- Max: 12
- Type: Number

### Year
- Min: 2000
- Max: 2100
- Type: Number

### Period
- Allowed: `daily`, `weekly`, `monthly`, `custom`
- Default: `monthly`

---

## 🔄 State Variables

```javascript
const [attendanceStatistics, setAttendanceStatistics] = useState(null)
const [statisticsPeriod, setStatisticsPeriod] = useState('monthly')
const [statisticsMonth, setStatisticsMonth] = useState(new Date().getMonth() + 1)
const [statisticsYear, setStatisticsYear] = useState(new Date().getFullYear())
const [showStatistics, setShowStatistics] = useState(false)
```

---

## 🎭 Response Structure

```javascript
{
  period: "January 2026",
  dateRange: {
    start: "2026-01-01",
    end: "2026-01-31"
  },
  summary: {
    totalRecords: 20,
    totalPresent: 18,
    onTime: 15,
    late: 3,
    absent: 2,
    leave: 0,
    sickLeave: 0,
    permission: 0,
    holiday: 0,
    totalWorkHours: 144.5,
    attendanceRate: 90.0,
    totalWorkDays: 20
  },
  details: [...]
}
```

---

## 🚨 Error Handling

```javascript
try {
  // fetch statistics
} catch (error) {
  console.error('Error fetching statistics:', error)
  toast.error('Gagal memuat statistik attendance')
}
```

### Common Errors
- **400**: Invalid parameters
- **401**: Unauthorized (token expired)
- **500**: Server error

---

## 🎯 Formulas

### Attendance Rate
```
attendanceRate = (totalPresent / effectiveWorkDays) * 100
where effectiveWorkDays = totalPresent + absent
```

### Total Work Hours
```
totalWorkHours = sum of all (clockOut - clockIn)
```

### Total Present
```
totalPresent = onTime + late + permission
```

---

## 🌈 Color Palette

```css
/* Status Colors */
.green-100  { background: #dcfce7 }  /* On Time */
.green-700  { color: #15803d }

.red-100    { background: #fee2e2 }  /* Late */
.red-700    { color: #b91c1c }

.gray-100   { background: #f3f4f6 }  /* Absent */
.gray-700   { color: #374151 }

.blue-100   { background: #dbeafe }  /* Total Present */
.blue-700   { color: #1d4ed8 }

.yellow-100 { background: #fef3c7 }  /* Leave */
.yellow-700 { color: #a16207 }

.orange-100 { background: #ffedd5 }  /* Sick */
.orange-700 { color: #c2410c }

.purple-100 { background: #f3e8ff }  /* Permission */
.purple-700 { color: #7e22ce }
```

---

## 📋 Checklist

**Before Deployment:**
- [ ] Test all periods (daily, weekly, monthly)
- [ ] Test month/year selectors
- [ ] Test with no data
- [ ] Test with various data
- [ ] Test error scenarios
- [ ] Test responsive design
- [ ] Test loading states
- [ ] Check console for errors
- [ ] Verify API calls correct
- [ ] Check toast notifications

---

## 🔗 Related Files

```
Frontend:
- /client_Salmon-HRIS/src/views/EmployeePage.jsx

Backend:
- /server/routes/attendance.js
- /server/controllers/attendanceController.js
- /server/helpers/attendance.js

Docs:
- ATTENDANCE_STATISTICS_IMPLEMENTATION.md
- ATTENDANCE_STATISTICS_TESTING.md
```

---

## 💡 Tips

1. **Auto-fetch**: Statistik otomatis di-fetch saat pertama kali dibuka
2. **Caching**: Data di-cache sampai user klik refresh
3. **Conditional**: Leave stats hanya muncul jika ada data leave/sick/permission
4. **Responsive**: Design otomatis adjust untuk mobile/desktop
5. **Loading**: Selalu tampilkan loading state untuk UX yang baik

---

## 📞 Support

**Issues?**
- Check console for errors
- Verify token valid
- Check network tab
- Verify API endpoint correct
- Check backend server running

**Questions?**
- See full documentation: ATTENDANCE_STATISTICS_IMPLEMENTATION.md
- See testing guide: ATTENDANCE_STATISTICS_TESTING.md
