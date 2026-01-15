# 📋 MANAJEMEN ATTENDANCE - ADMIN

> Monitoring, review, dan manage attendance karyawan

---

## 🎯 Overview

Admin dapat:
- 👁️ View all attendance (today/history)
- ✏️ Manual adjustment
- ✅ Approve/reject location violations
- 📊 Generate attendance reports
- 🤖 Configure auto-absent

---

## 📊 Today's Attendance Monitor

### Real-Time Dashboard

```
┌────────────────────────────────────────────────────┐
│  📋 Today's Attendance - 15 Jan 2026              │
├────────────────────────────────────────────────────┤
│  Total: 150 | Present: 142 | Late: 8 | Absent: 5  │
├────────────────────────────────────────────────────┤
│  Search: [______] Filter: [All ▼] Export: [📥]   │
├─────┬──────────┬─────────┬─────────┬──────────────┤
│ ID  │ Employee │ Clock In│ Clock Out│ Status       │
├─────┼──────────┼─────────┼─────────┼──────────────┤
│ #1  │ Budi     │ 08:45   │ 17:30   │ ✅ ON_TIME   │
│ #2  │ Ani      │ 09:15   │ -       │ ⏰ LATE      │
│ #3  │ Citra    │ 08:30   │ -       │ 🟡 PROGRESS  │
│ #4  │ Doni     │ -       │ -       │ ❌ ABSENT    │
└─────┴──────────┴─────────┴─────────┴──────────────┘
```

**Quick Actions:**
- 👁️ View Detail (photo, GPS)
- ✏️ Edit Record
- 🗑️ Delete Record
- 📧 Send Reminder

---

## ⚠️ Location Violations Review

### Validation Queue

Attendance dengan status `outside_radius` atau `gps_error`:

```
┌────────────────────────────────────────────────────┐
│  ⚠️ Location Violations (Requires Review)          │
├──────────┬─────────┬──────────┬──────────┬─────────┤
│ Employee │ Time    │ Distance │ Status   │ Action  │
├──────────┼─────────┼──────────┼──────────┼─────────┤
│ Agus     │ 08:45   │ 125m     │ Outside  │ [Review]│
│ Siti     │ 09:15   │ GPS Err  │ Error    │ [Review]│
└──────────┴─────────┴──────────┴──────────┴─────────┘
```

### Review Detail Modal

```
┌─────────────────────────────────────┐
│  📍 Location Validation Review      │
├─────────────────────────────────────┤
│  Employee: Agus Pratama             │
│  Date: 15/01/2026                   │
│  Clock In: 08:45 AM                 │
│                                     │
│  📸 Photo:                          │
│  [Photo Preview]                    │
│                                     │
│  📍 GPS Coordinates:                │
│  Lat: -6.200050                     │
│  Lng: 106.816700                    │
│                                     │
│  🏢 Nearest Office:                 │
│  HQ Jakarta                         │
│  Distance: 125 meters               │
│  (Radius: 50m)                      │
│                                     │
│  ❓ Reason (Optional):              │
│  [ WFH / Field Work / Other ]       │
│                                     │
│  [ ❌ Reject ] [ ✅ Approve ]       │
└─────────────────────────────────────┘
```

**Approval Actions:**
- ✅ **Approve:** Set `locationValidationStatus = 'valid'`
- ❌ **Reject:** Mark as violation, send notification
- 📝 **Add Note:** Reason untuk approval

---

## ✏️ Manual Attendance Adjustment

### Use Cases
- Employee lupa clock-in/out
- System error
- GPS/camera malfunction
- Backdated attendance

### Edit Attendance Flow

```
Admin → View Attendance Detail
   ↓
Click "Edit" Button
   ↓
Edit Form Opens:
├─ Clock In Time (editable)
├─ Clock Out Time (editable)
├─ Status (dropdown)
├─ Reason for Edit (required)
└─ Override GPS Validation
   ↓
Submit Changes
   ↓
Audit Log Created:
├─ Who edited
├─ What changed
├─ When changed
└─ Why (reason)
   ↓
Notification sent to employee
   ↓
✅ Attendance Updated!
```

**Edit Form:**
```
┌─────────────────────────────────────┐
│  ✏️ Edit Attendance Record          │
├─────────────────────────────────────┤
│  Employee: Budi Santoso             │
│  Date: 15/01/2026                   │
│                                     │
│  Clock In: *                        │
│  [08:45] [AM/PM]                    │
│                                     │
│  Clock Out:                         │
│  [17:30] [AM/PM]                    │
│                                     │
│  Status: *                          │
│  [ ON_TIME ▼ ]                      │
│    - ON_TIME                        │
│    - LATE                           │
│    - ABSENT                         │
│    - LEAVE                          │
│                                     │
│  Location Status:                   │
│  ☑ Override GPS validation          │
│                                     │
│  Reason for Edit: *                 │
│  ┌─────────────────────────────┐   │
│  │ Employee forgot to clock    │   │
│  │ out, confirmed via CCTV     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Cancel ]      [ Save Changes ]  │
└─────────────────────────────────────┘
```

---

## 🗑️ Delete Attendance

**Confirmation Required:**
```
⚠️ Delete Attendance Record?

Employee: Budi Santoso
Date: 15/01/2026
Clock In: 08:45 AM
Clock Out: 17:30 PM

This action cannot be undone.

Reason for deletion: *
[________________________]

[ Cancel ]  [ Delete ]
```

**Audit Trail:** All deletions logged with reason

---

## 📊 Attendance Reports

### Report Types

**1. Daily Report**
- All attendance hari ini
- Summary by status
- Late/absent employees
- Export: Excel/CSV/PDF

**2. Weekly Report**
- Attendance 7 hari terakhir
- Trend analysis
- Department comparison
- Individual performance

**3. Monthly Report**
- Full month attendance
- Statistics per employee
- Department summary
- Leave & overtime included

**4. Custom Report**
- Custom date range
- Filter by department/employee
- Multiple export formats

### Generate Report

```
┌─────────────────────────────────────┐
│  📊 Generate Attendance Report      │
├─────────────────────────────────────┤
│  Report Type: *                     │
│  ( ) Daily                          │
│  ( ) Weekly                         │
│  (•) Monthly                        │
│  ( ) Custom                         │
│                                     │
│  Period: *                          │
│  Month: [January ▼]                 │
│  Year:  [2026 ▼]                    │
│                                     │
│  Filter:                            │
│  Department: [All ▼]                │
│  Employee:   [All ▼]                │
│  Status:     [All ▼]                │
│                                     │
│  Export Format:                     │
│  ☑ Excel (.xlsx)                    │
│  ☐ PDF                              │
│  ☐ CSV                              │
│                                     │
│  ☐ Send via email                   │
│                                     │
│  [ Cancel ]    [ Generate Report ]  │
└─────────────────────────────────────┘
```

---

## 🤖 Auto-Absent Configuration

### Settings

```
┌─────────────────────────────────────┐
│  ⚙️ Auto-Absent Settings            │
├─────────────────────────────────────┤
│  ☑ Enable Auto-Absent               │
│                                     │
│  Schedule:                          │
│  Primary:   [18:00] daily           │
│  Secondary: [23:00] daily           │
│                                     │
│  Exclusions:                        │
│  ☑ Skip if on approved leave        │
│  ☑ Skip holidays                    │
│  ☑ Skip inactive employees          │
│                                     │
│  Notifications:                     │
│  ☑ Send email to absent employees   │
│  ☑ Notify admin                     │
│                                     │
│  [ Save Settings ]                  │
└─────────────────────────────────────┘
```

**Cron Job:**
```javascript
// Run at 18:00 daily
cron.schedule('0 18 * * *', async () => {
  await autoSetAbsent();
});

// Final check at 23:00
cron.schedule('0 23 * * *', async () => {
  await autoSetAbsent();
});
```

---

## 📧 Bulk Actions

### Send Reminder

**To Late Employees:**
```
Subject: ⏰ Late Arrival Notice

Hi [Name],

You were late today (Clock in: 09:15 AM).
Please ensure punctuality.

Your attendance record:
- This month: 3 late arrivals
- Warning threshold: 5

Please contact HR if you have concerns.
```

**To Absent Employees:**
```
Subject: ❌ Absent Notice

Hi [Name],

You were marked absent on 15/01/2026.

If this is a mistake, please contact HR immediately.
If you were sick, please submit sick leave request.
```

---

## 📊 Statistics & Analytics

### Department Performance

```
┌────────────────────────────────────┐
│  Department: Engineering           │
│  Total: 45 employees               │
├────────────────────────────────────┤
│  Present:   42 (93.3%)             │
│  Late:      3 (6.7%)               │
│  Absent:    0 (0%)                 │
│                                    │
│  Avg Clock In:  08:52 AM           │
│  Avg Work Time: 8.5 hours          │
│                                    │
│  Trend: ↑ Improving                │
└────────────────────────────────────┘
```

### Individual Performance

```
Employee: Budi Santoso
Period: January 2026

┌────────────────────────────────────┐
│  Total Days:     15                │
│  Present:        14 (93.3%)        │
│  Late:           2 (13.3%)         │
│  Absent:         1 (6.7%)          │
│                                    │
│  Avg Clock In:   08:55 AM          │
│  Avg Work Time:  8.2 hours         │
│                                    │
│  Performance:    ⚠️ Needs improve  │
└────────────────────────────────────┘
```

---

## 🔍 Search & Filter

**Filter Options:**
- 📅 Date Range
- 👥 Employee
- 🏢 Department
- 📊 Status (ON_TIME, LATE, ABSENT, dll)
- 🕐 Shift
- 📍 Location Status

**Advanced Search:**
```sql
-- Example query
SELECT * FROM Attendances
WHERE date BETWEEN '2026-01-01' AND '2026-01-31'
  AND status = 'LATE'
  AND UserId IN (SELECT id FROM Users WHERE department = 'Engineering')
ORDER BY clockIn DESC;
```

---

## ⚡ Quick Actions

**Keyboard Shortcuts:**
- `Ctrl + F` - Search
- `Ctrl + E` - Export
- `Ctrl + R` - Refresh
- `Ctrl + N` - New (manual entry)

**Bulk Operations:**
- Select multiple records
- Bulk approve location
- Bulk send reminders
- Bulk export

---

## 🔐 Permissions

**Admin Can:**
- ✅ View all attendance
- ✅ Edit any record
- ✅ Delete records
- ✅ Approve/reject validation
- ✅ Generate reports
- ✅ Configure settings

**Audit Trail:**
- All admin actions logged
- Changes tracked
- Who, what, when, why

---

## ✅ Best Practices

**Daily Tasks:**
- ✅ Review today's attendance
- ✅ Process location violations
- ✅ Contact absent employees
- ✅ Manual adjustments as needed

**Weekly Tasks:**
- ✅ Generate weekly report
- ✅ Review patterns
- ✅ Performance counseling

**Monthly Tasks:**
- ✅ Monthly report
- ✅ Department review
- ✅ Policy adjustments

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
