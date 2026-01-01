# Attendance System - Visual Flow Diagram

## 📊 Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTENDANCE SYSTEM FLOW                   │
└─────────────────────────────────────────────────────────────┘

User Action               Status                  Condition
─────────────────────────────────────────────────────────────

                         START
                           │
                           ▼
                    ┌─────────────┐
                    │  NEW DAY    │
                    └─────────────┘
                           │
           ┌───────────────┼───────────────┐
           │                               │
           ▼                               ▼
    ┌─────────────┐               ┌──────────────┐
    │  CLOCK-IN   │               │ NO CLOCK-IN  │
    └─────────────┘               └──────────────┘
           │                               │
           │                               │ (Auto at 6PM)
           ▼                               ▼
    ┌─────────────┐               ┌──────────────┐
    │ ON_PROGRESS │               │   ABSENT     │
    └─────────────┘               └──────────────┘
           │                               │
           │                               │
           ▼                               ▼
    Check Time:                          [END]
    Is Late?
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Clock-In      Clock-In
< 09:00       > 09:00
    │             │
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│CLOCK   │   │CLOCK   │
│ OUT    │   │ OUT    │
└────────┘   └────────┘
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│ON_TIME │   │  LATE  │
└────────┘   └────────┘
    │             │
    ▼             ▼
  [END]         [END]
```

## 🕐 Time-Based Status Determination

```
Timeline:        00:00           09:00           18:00          23:59
                  │               │               │               │
                  ├───────────────┼───────────────┼───────────────┤
                  │               │               │               │
Clock-In:         │    ON TIME    │     LATE      │               │
                  │   (< 09:00)   │   (> 09:00)   │               │
                  │               │               │               │
Auto Absent:      │               │               │   ✓ Run       │
                  │               │               │ (6PM & 11PM)  │
                  └───────────────┴───────────────┴───────────────┘
```

## 📈 Status Transition Table

| From Status   | Action     | To Status  | Duration Calculated? |
|--------------|------------|------------|----------------------|
| -            | Clock-In   | ON_PROGRESS| No                   |
| ON_PROGRESS  | Clock-Out  | ON_TIME    | ✅ Yes               |
| ON_PROGRESS  | Clock-Out  | LATE       | ✅ Yes               |
| -            | Auto Set   | ABSENT     | No                   |

## 🎯 Decision Logic

```
function clockOut() {
    if (attendance exists) {
        clockOutTime = NOW
        
        if (clockInTime <= 09:00) {
            status = ON_TIME
        } else {
            status = LATE
        }
        
        duration = clockOutTime - clockInTime
        return { status, duration }
    }
}

function autoSetAbsent() {
    for each user {
        if (NO attendance record today) {
            create attendance {
                status: ABSENT
            }
        }
    }
}
```

## 📋 Complete Status List

```
╔════════════════╦═══════════════════════════════════════════╗
║    Status      ║           Description                     ║
╠════════════════╬═══════════════════════════════════════════╣
║ ON_PROGRESS    ║ User sedang bekerja (setelah clock-in)   ║
║ ON_TIME        ║ Hadir tepat waktu (clock-in ≤ 09:00)    ║
║ LATE           ║ Hadir terlambat (clock-in > 09:00)       ║
║ ABSENT         ║ Tidak hadir (auto set atau manual)       ║
║ LEAVE          ║ Cuti (future feature)                    ║
║ HOLIDAY        ║ Libur nasional (future feature)          ║
╚════════════════╩═══════════════════════════════════════════╝
```

## 🔄 Daily Cycle

```
Day Start (00:00)
    │
    ├─► User 1: Clock-in 08:30 → ON_PROGRESS
    ├─► User 2: Clock-in 09:15 → ON_PROGRESS
    ├─► User 3: No clock-in
    │
Clock-Out Period
    │
    ├─► User 1: Clock-out 17:00 → ON_TIME (8.5 hours)
    ├─► User 2: Clock-out 18:30 → LATE (9.25 hours)
    │
Auto Set Absent (18:00)
    │
    ├─► User 3: Auto marked → ABSENT
    │
Day End (23:59)
```

## 💡 Example Scenarios

### Scenario 1: Pekerja Rajin (On Time)
```
08:45 → POST /clock-in     → Status: ON_PROGRESS
17:30 → POST /clock-out    → Status: ON_TIME
                              Duration: 8.75 hours
```

### Scenario 2: Pekerja Telat (Late)
```
09:30 → POST /clock-in     → Status: ON_PROGRESS
18:00 → POST /clock-out    → Status: LATE
                              Duration: 8.5 hours
```

### Scenario 3: Tidak Masuk (Absent)
```
[No action all day]
18:00 → Auto Cron Job      → Status: ABSENT
                              (No duration)
```

### Scenario 4: Cek Status Hari Ini
```
Anytime → GET /attendances/today
        → Response: Current status + duration (if completed)
```

## 🎨 Visual Status Colors (for Frontend)

```
┌──────────────┬─────────────┬─────────────────┐
│   Status     │   Color     │   Badge         │
├──────────────┼─────────────┼─────────────────┤
│ ON_PROGRESS  │   🟡 Yellow │   In Progress   │
│ ON_TIME      │   🟢 Green  │   On Time       │
│ LATE         │   🟠 Orange │   Late          │
│ ABSENT       │   🔴 Red    │   Absent        │
│ LEAVE        │   🔵 Blue   │   On Leave      │
│ HOLIDAY      │   🟣 Purple │   Holiday       │
└──────────────┴─────────────┴─────────────────┘
```

## ⚙️ Configuration Points

```javascript
// Jam Kerja (Work Start Time)
workStartTime.setHours(9, 0, 0, 0);  // 09:00

// Cron Schedule
'0 18 * * *'  // 6 PM daily (primary)
'0 23 * * *'  // 11 PM daily (backup)

// Duration Precision
Math.round(diffHours * 100) / 100  // 2 decimal places
```
