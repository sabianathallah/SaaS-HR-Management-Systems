# Attendance Statistics Testing Guide

## Manual Testing Steps

### Test 1: Toggle Statistics View

**Steps:**
1. Login ke aplikasi
2. Navigasi ke tab "Attendance"
3. Scroll ke bagian Statistics
4. Klik tombol "📊 Lihat Statistik Attendance"

**Expected Result:**
```
✅ Statistics section expands
✅ Period selector (Harian/Mingguan/Bulanan) ditampilkan
✅ Default period = "Bulanan"
✅ Default month = current month
✅ Default year = current year
✅ Message "Klik Refresh Statistik untuk memuat data" muncul
```

**Test Hide:**
1. Klik tombol "📊 Sembunyikan Statistik"

**Expected Result:**
```
✅ Statistics section collapses
✅ Button text berubah kembali ke "Lihat Statistik"
```

---

### Test 2: Fetch Monthly Statistics

**Steps:**
1. Buka statistics section
2. Pilih period "Bulanan"
3. Pilih bulan "Januari"
4. Pilih tahun "2026"
5. Klik "Refresh Statistik"

**Expected Result:**
```
✅ Button shows "Memuat..." during fetch
✅ Statistics data displayed
✅ Period shows: "January 2026" (atau format dari backend)
✅ Date range displayed correctly
✅ All metrics displayed with correct values:
   - Tepat Waktu (green card)
   - Terlambat (red card)
   - Absent (gray card)
   - Total Hadir (blue card)
   - Jam Kerja Total
   - Tingkat Kehadiran (with %)
   - Total Hari Kerja
✅ No errors in console
```

**API Request to Verify:**
```
GET /attendances/my-statistics?period=monthly&month=1&year=2026
```

---

### Test 3: Fetch Daily Statistics

**Steps:**
1. Buka statistics section
2. Pilih period "Harian"
3. Klik "Refresh Statistik"

**Expected Result:**
```
✅ Month & Year selectors hide (only for monthly)
✅ Statistics for today displayed
✅ Period shows current date
✅ Metrics displayed correctly
```

**API Request to Verify:**
```
GET /attendances/my-statistics?period=daily
```

---

### Test 4: Fetch Weekly Statistics

**Steps:**
1. Buka statistics section
2. Pilih period "Mingguan"
3. Klik "Refresh Statistik"

**Expected Result:**
```
✅ Month selector hide
✅ Year selector might show
✅ Statistics for current week displayed
✅ Period shows week range
✅ Metrics displayed correctly
```

**API Request to Verify:**
```
GET /attendances/my-statistics?period=weekly&year=2026
```

---

### Test 5: Change Month/Year

**Steps:**
1. Pilih period "Bulanan"
2. Pilih bulan "Desember"
3. Pilih tahun "2025"
4. Klik "Refresh Statistik"

**Expected Result:**
```
✅ Statistics for December 2025 displayed
✅ Period label updated
✅ Date range shows Dec 1-31, 2025
✅ Metrics reflect selected period
```

**API Request to Verify:**
```
GET /attendances/my-statistics?period=monthly&month=12&year=2025
```

---

### Test 6: Leave Stats Conditional Display

**Scenario A: User has leave/sick/permission**

**Expected Result:**
```
✅ Leave statistics section displays
✅ Shows 3 additional cards:
   - Cuti (yellow)
   - Sakit (orange)
   - Izin (purple)
✅ Values > 0 displayed correctly
```

**Scenario B: User has NO leave/sick/permission**

**Expected Result:**
```
✅ Leave statistics section HIDDEN
✅ Only main stats and additional stats shown
```

---

### Test 7: No Data Available

**Steps:**
1. Select a period with no attendance records
2. Refresh statistics

**Expected Result:**
```
✅ Statistics section displays
✅ All metrics show 0
✅ Attendance rate shows 0%
✅ No errors or crashes
```

---

### Test 8: Loading State

**Steps:**
1. Click "Refresh Statistik"
2. Observe during network request

**Expected Result:**
```
✅ Button text changes to "Memuat..."
✅ Button disabled during loading
✅ Previous data still visible (or loading indicator)
✅ After load: button text back to "Refresh Statistik"
✅ Button enabled again
```

---

### Test 9: Error Handling

**Scenario A: Network Error**

**Steps:**
1. Disconnect internet
2. Click "Refresh Statistik"

**Expected Result:**
```
❌ Error toast: "Gagal memuat statistik attendance"
✅ Console shows error details
✅ UI doesn't crash
✅ Previous data still visible (if any)
```

**Scenario B: Unauthorized (expired token)**

**Steps:**
1. Manually expire/remove token
2. Click "Refresh Statistik"

**Expected Result:**
```
❌ Error toast with message
✅ Or redirect to login (depending on error handler)
```

---

### Test 10: Responsive Design

**Mobile (< 768px):**
```
✅ Main stats cards: 2 columns (grid-cols-2)
✅ Additional stats: 1 column stack
✅ Period selectors stack vertically
✅ All text readable
✅ Buttons full width or appropriate size
✅ Cards don't overflow
```

**Desktop (>= 768px):**
```
✅ Main stats cards: 4 columns (grid-cols-4)
✅ Additional stats: 3 columns (grid-cols-3)
✅ Period selectors: 3 columns
✅ Proper spacing
✅ Cards aligned
```

---

## API Testing with Postman/Thunder Client

### 1. Monthly Statistics

```http
GET http://localhost:3000/attendances/my-statistics?period=monthly&month=1&year=2026
Authorization: Bearer <your_token>
```

**Expected Response (200 OK):**
```json
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
    "details": [...]
  }
}
```

### 2. Daily Statistics

```http
GET http://localhost:3000/attendances/my-statistics?period=daily
Authorization: Bearer <your_token>
```

### 3. Weekly Statistics

```http
GET http://localhost:3000/attendances/my-statistics?period=weekly&year=2026
Authorization: Bearer <your_token>
```

### 4. Invalid Period (400 Error)

```http
GET http://localhost:3000/attendances/my-statistics?period=invalid
Authorization: Bearer <your_token>
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Invalid period. Must be one of: daily, weekly, monthly, custom"
}
```

### 5. Invalid Month (400 Error)

```http
GET http://localhost:3000/attendances/my-statistics?period=monthly&month=13&year=2026
Authorization: Bearer <your_token>
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Invalid month. Must be between 1 and 12"
}
```

---

## Browser Console Checks

### Successful Fetch
```javascript
// Console should show:
// (if you have console.log in code)
Statistics fetched successfully
```

### Error Fetch
```javascript
// Console should show:
Error fetching statistics: AxiosError {...}
```

### Network Tab
```
Request URL: http://localhost:3000/attendances/my-statistics?period=monthly&month=1&year=2026
Request Method: GET
Status Code: 200 OK
Response: {message: "My attendance statistics", data: {...}}
```

---

## Test Data Scenarios

### Scenario 1: Perfect Attendance
```json
{
  "summary": {
    "onTime": 20,
    "late": 0,
    "absent": 0,
    "totalPresent": 20,
    "attendanceRate": 100.0
  }
}
```

**Expected UI:**
- Green card = 20
- Red card = 0
- Gray card = 0
- Blue card = 20
- Attendance rate = 100%

### Scenario 2: Some Lates
```json
{
  "summary": {
    "onTime": 15,
    "late": 5,
    "absent": 0,
    "totalPresent": 20,
    "attendanceRate": 100.0
  }
}
```

**Expected UI:**
- Green card = 15
- Red card = 5
- Gray card = 0
- Blue card = 20
- Attendance rate = 100%

### Scenario 3: With Absences
```json
{
  "summary": {
    "onTime": 15,
    "late": 3,
    "absent": 2,
    "totalPresent": 18,
    "attendanceRate": 90.0
  }
}
```

**Expected UI:**
- Green card = 15
- Red card = 3
- Gray card = 2
- Blue card = 18
- Attendance rate = 90%

### Scenario 4: With Leave
```json
{
  "summary": {
    "onTime": 15,
    "late": 0,
    "absent": 0,
    "leave": 3,
    "sickLeave": 2,
    "permission": 0,
    "totalPresent": 15
  }
}
```

**Expected UI:**
- Main stats show
- Leave stats section SHOWS
- Yellow card (Cuti) = 3
- Orange card (Sakit) = 2
- Purple card (Izin) = 0

---

## Performance Tests

### Load Time
- [ ] Statistics fetch < 1 second
- [ ] UI renders immediately after data received
- [ ] No layout shift

### State Management
- [ ] No unnecessary re-renders
- [ ] State updates correctly
- [ ] Previous data cleared on new fetch

### Memory
- [ ] No memory leaks on toggle show/hide
- [ ] Data properly garbage collected

---

## Accessibility Tests

- [ ] Buttons have proper labels
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus states visible

---

## Integration Tests

### With Attendance Tab
- [ ] Statistics section integrates well with attendance history
- [ ] No layout conflicts
- [ ] Proper spacing

### With Clock In/Out
- [ ] Statistics updates after new clock-in/out
- [ ] Refresh shows latest data

### With Other Tabs
- [ ] Switching tabs maintains statistics state
- [ ] Coming back to Attendance tab shows previous stats (if cached)

---

## Edge Cases

### 1. Future Date
- Period: January 2027 (future)
- Expected: Empty stats or zero values

### 2. Very Old Date
- Period: January 2020
- Expected: Shows historical data or zero if no data

### 3. Current Month (Partial)
- Period: Current month (e.g., Jan 10, 2026)
- Expected: Shows stats from Jan 1-10 only

### 4. Leap Year
- Period: February 2024
- Expected: Shows 29 days in date range

### 5. December to January Switch
- Switch from Dec 2025 to Jan 2026
- Expected: Stats update correctly, no date confusion

---

## Bug Report Template

If you find a bug, report with this template:

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
...

**Actual Result:**
...

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Copy paste console errors]

**Network Request:**
[Copy paste request/response from Network tab]

**Environment:**
- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- Screen size: Desktop/Mobile
- Token valid: Yes/No
```

---

## Regression Tests

After any code changes, verify:

- [ ] Basic toggle still works
- [ ] Period selection works
- [ ] Month/Year selection works
- [ ] Refresh button works
- [ ] Data displays correctly
- [ ] Error handling works
- [ ] Loading states work
- [ ] No console errors
- [ ] No layout breaks
- [ ] Mobile responsive
- [ ] Desktop responsive

---

## Success Criteria

All tests should pass:
- ✅ All functionality tests
- ✅ All UI/UX tests
- ✅ All error handling tests
- ✅ All responsive tests
- ✅ All performance tests
- ✅ All accessibility tests
- ✅ All integration tests
- ✅ All edge cases handled

Feature is READY for production when all criteria met! 🎉
