# 📅 MANAJEMEN SHIFT - ADMIN

> Setup work shifts, schedules, dan shift assignments

---

## 🎯 Overview

Admin dapat:
- ➕ Create/edit/delete shifts
- 📋 Assign shifts to employees
- 📅 Manage shift schedules
- 🔄 Handle shift swaps
- 📊 Monitor shift coverage
- 🚨 Handle shift violations

---

## 📋 Shift List

### Current Shifts

```
┌────────────────────────────────────────────────────────┐
│  📅 Shift Management                                   │
├────┬──────────────┬─────────┬─────────┬───────┬───────┤
│ ID │ Shift Name   │ Start   │ End     │ Users │ Action│
├────┼──────────────┼─────────┼─────────┼───────┼───────┤
│ 1  │ Morning      │ 07:00   │ 15:00   │ 45    │ Edit  │
│ 2  │ Regular      │ 09:00   │ 17:00   │ 120   │ Edit  │
│ 3  │ Afternoon    │ 13:00   │ 21:00   │ 30    │ Edit  │
│ 4  │ Night        │ 21:00   │ 05:00   │ 15    │ Edit  │
│ 5  │ Flexible     │ Custom  │ 8h req  │ 25    │ Edit  │
└────┴──────────────┴─────────┴─────────┴───────┴───────┘

[ + Add New Shift ]
```

**Shift Types:**
- 🌅 Morning: 07:00 - 15:00
- 🏢 Regular: 09:00 - 17:00
- 🌇 Afternoon: 13:00 - 21:00
- 🌙 Night: 21:00 - 05:00 (next day)
- ⚡ Flexible: Custom hours

---

## ➕ Create New Shift

### Add Shift Form

```
┌─────────────────────────────────────────┐
│  ➕ Add New Shift                       │
├─────────────────────────────────────────┤
│  Shift Name: *                          │
│  [Morning Shift]                        │
│                                         │
│  Start Time: *                          │
│  [07:00] [AM ▼]                         │
│                                         │
│  End Time: *                            │
│  [03:00] [PM ▼]                         │
│                                         │
│  Break Time:                            │
│  [60] minutes                           │
│                                         │
│  Total Working Hours:                   │
│  8 hours (calculated)                   │
│                                         │
│  Late Tolerance:                        │
│  [15] minutes                           │
│  (Grace period before marked LATE)      │
│                                         │
│  Color Code:                            │
│  [🟡 Yellow]                            │
│                                         │
│  Active Days:                           │
│  ☑ Monday                               │
│  ☑ Tuesday                              │
│  ☑ Wednesday                            │
│  ☑ Thursday                             │
│  ☑ Friday                               │
│  ☐ Saturday                             │
│  ☐ Sunday                               │
│                                         │
│  Description:                           │
│  ┌─────────────────────────────────┐   │
│  │ Morning shift untuk tim         │   │
│  │ production dan warehouse        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Cancel ]          [ Create Shift ]  │
└─────────────────────────────────────────┘
```

**Validation:**
- ✅ Start time < End time (except night shift)
- ✅ Min 4 hours, max 12 hours
- ✅ Break time reasonable (30-120 min)
- ✅ Late tolerance 0-30 min

---

## ✏️ Edit Shift

### Modify Existing Shift

```
┌─────────────────────────────────────────┐
│  ✏️ Edit Shift - Regular Shift          │
├─────────────────────────────────────────┤
│  Current Settings:                      │
│  Start: 09:00 AM                        │
│  End: 05:00 PM                          │
│  Break: 60 minutes                      │
│  Assigned: 120 employees                │
│                                         │
│  ⚠️ Warning:                            │
│  Changing shift affects 120 employees   │
│  and their attendance records.          │
│                                         │
│  New Start Time:                        │
│  [09:00] [AM ▼]                         │
│                                         │
│  New End Time:                          │
│  [05:30] [PM ▼]                         │
│  (+30 min from current)                 │
│                                         │
│  Effective Date: *                      │
│  (•) Immediately                        │
│  ( ) From specific date: [____]         │
│                                         │
│  ☑ Notify affected employees            │
│                                         │
│  [ Cancel ]          [ Save Changes ]  │
└─────────────────────────────────────────┘
```

---

## 👥 Assign Shift to Employees

### Bulk Assignment

```
┌─────────────────────────────────────────┐
│  👥 Assign Shift to Employees           │
├─────────────────────────────────────────┤
│  Select Shift: *                        │
│  [Regular Shift ▼]                      │
│  09:00 AM - 05:00 PM                    │
│                                         │
│  Select Employees:                      │
│  ┌─────────────────────────────────┐   │
│  │ Search: [_____________]  🔍     │   │
│  ├─────────────────────────────────┤   │
│  │ ☑ Select All (150 employees)    │   │
│  ├─────────────────────────────────┤   │
│  │ Filter by:                      │   │
│  │ Dept: [All ▼] Position: [All ▼]│   │
│  ├─────────────────────────────────┤   │
│  │ ☑ Budi Santoso (Engineering)    │   │
│  │ ☑ Ani Wijaya (Sales)            │   │
│  │ ☐ Citra Dewi (HR)               │   │
│  │ ☑ Doni Prakoso (Engineering)    │   │
│  │ ... (146 more)                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Selected: 120 employees                │
│                                         │
│  Effective From:                        │
│  [16/01/2026] (Tomorrow)                │
│                                         │
│  ☑ Send notification                    │
│  ☑ Update attendance system             │
│                                         │
│  [ Cancel ]            [ Assign Shift ] │
└─────────────────────────────────────────┘
```

---

## 📅 Shift Schedule Calendar

### Monthly View

```
        January 2026
┌───┬───┬───┬───┬───┬───┬───┐
│ S │ M │ T │ W │ T │ F │ S │
├───┼───┼───┼───┼───┼───┼───┤
│   │   │   │ 1 │ 2 │ 3 │ 4 │
│   │   │   │ R │ R │ R │   │
├───┼───┼───┼───┼───┼───┼───┤
│ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │
│   │ M │ M │ M │ M │ M │   │
├───┼───┼───┼───┼───┼───┼───┤
│12 │13 │14 │15 │16 │17 │18 │
│   │ A │ A │ A │ N │ N │   │
└───┴───┴───┴───┴───┴───┴───┘

Legend:
M = Morning Shift (45 users)
R = Regular Shift (120 users)
A = Afternoon Shift (30 users)
N = Night Shift (15 users)

Click date to view detail:
├─ Who's working
├─ Shift coverage
└─ Add/remove assignments
```

---

## 🔄 Shift Swap Requests

### Manage Swap Requests

```
┌────────────────────────────────────────────────────────┐
│  🔄 Shift Swap Requests                                │
├──────┬──────────┬──────────┬──────┬──────────┬────────┤
│ ID   │ From     │ To       │ Date │ Reason   │ Action │
├──────┼──────────┼──────────┼──────┼──────────┼────────┤
│ #301 │ Budi     │ Ani      │20/01 │ Personal │ Review │
│      │ (Regular)│ (Morning)│      │          │        │
├──────┼──────────┼──────────┼──────┼──────────┼────────┤
│ #302 │ Citra    │ Doni     │22/01 │ Doctor   │ Review │
│      │ (Night)  │ (Regular)│      │ appt     │        │
└──────┴──────────┴──────────┴──────┴──────────┴────────┘
```

### Review Swap Detail

```
┌─────────────────────────────────────────┐
│  🔄 Shift Swap Request #301             │
├─────────────────────────────────────────┤
│  Requester: Budi Santoso                │
│  Current Shift: Regular (09:00-17:00)   │
│                                         │
│  Swap With: Ani Wijaya                  │
│  Target Shift: Morning (07:00-15:00)    │
│                                         │
│  Date: 20 January 2026 (Friday)         │
│                                         │
│  Reason:                                │
│  "Perlu ambil anak sekolah jam 4 sore"  │
│                                         │
│  Status: ✅ Ani approved                │
│          ⏳ Pending admin approval      │
│                                         │
│  ⚠️ Considerations:                     │
│  ☑ Both employees qualified             │
│  ☑ No shift coverage conflict           │
│  ☑ Within company policy                │
│                                         │
│  [ ❌ Reject ] [ ✅ Approve ]           │
└─────────────────────────────────────────┘
```

---

## 📊 Shift Coverage Report

### Daily Coverage

```
┌────────────────────────────────────────┐
│  📊 Shift Coverage - 15 Jan 2026      │
├────────────┬─────────┬─────────┬──────┤
│ Shift      │ Required│ Assigned│ %    │
├────────────┼─────────┼─────────┼──────┤
│ Morning    │ 50      │ 45      │ 90%  │
│ Regular    │ 120     │ 120     │ 100% │
│ Afternoon  │ 30      │ 28      │ 93%  │
│ Night      │ 15      │ 15      │ 100% │
├────────────┼─────────┼─────────┼──────┤
│ Total      │ 215     │ 208     │ 97%  │
└────────────┴─────────┴─────────┴──────┘

⚠️ Alerts:
- Morning shift: 5 understaffed
- Afternoon shift: 2 understaffed
```

### Weekly Coverage

```
Week of Jan 13-19, 2026

      Mon  Tue  Wed  Thu  Fri  Sat  Sun
Morn  90%  95%  92%  88%  90%  80%  75%
Reg   100% 100% 98%  100% 100% -    -
Aft   93%  90%  95%  92%  88%  85%  80%
Night 100% 100% 100% 93%  100% 100% 100%

Recommendations:
📌 Hire 5 more for morning shift
📌 Improve weekend coverage
```

---

## 🚨 Shift Violations

### Violation Types

**1. Wrong Shift Clock-In**
```
Employee: Budi
Assigned: Regular (09:00-17:00)
Clocked In: 07:15 (Morning shift time)

Action:
[ Contact Employee ] [ Override ] [ Mark as Violation ]
```

**2. No Shift Assignment**
```
Employee: New Employee (Eko)
Clock In: 09:00
Issue: No shift assigned yet

Action:
[ Assign Shift Now ] [ Mark as Training Day ]
```

**3. Shift Overlap**
```
Employee: Ani
Issue: Assigned to both Morning & Regular shift on 20/01

Action:
[ Remove Duplicate ] [ Contact HR ]
```

---

## ⚙️ Shift Settings

### Global Configuration

```
┌─────────────────────────────────────┐
│  ⚙️ Shift System Settings           │
├─────────────────────────────────────┤
│  Default Settings:                  │
│                                     │
│  Late Tolerance: [15] minutes       │
│  Early Clock-In: [30] minutes       │
│  Auto Clock-Out: [30] min after end │
│                                     │
│  Shift Swap:                        │
│  ☑ Allow employee-to-employee swap  │
│  ☑ Require admin approval           │
│  Min notice: [24] hours before      │
│                                     │
│  Overtime:                          │
│  ☑ Auto-calculate after shift end   │
│  Min overtime: [30] minutes         │
│                                     │
│  Notifications:                     │
│  ☑ Shift assignment email           │
│  ☑ Shift change alert               │
│  ☑ Swap approval notification       │
│                                     │
│  [ Save Settings ]                  │
└─────────────────────────────────────┘
```

---

## 📋 Quick Actions

**Keyboard Shortcuts:**
- `Ctrl + N` - New shift
- `Ctrl + E` - Edit selected
- `Ctrl + A` - Assign employees
- `Ctrl + R` - View report

**Bulk Operations:**
- Assign shift to department
- Copy shift schedule
- Import from Excel
- Export schedule

---

## ✅ Best Practices

**Shift Management:**
- ✅ Consistent shift hours
- ✅ Adequate break times
- ✅ Rotation for fairness
- ✅ Sufficient coverage
- ✅ Emergency backup plan

**Assignments:**
- ✅ Match skills to shift needs
- ✅ Consider employee preferences
- ✅ Fair distribution
- ✅ Advance notice (min 1 week)
- ✅ Document changes

**Communication:**
- ✅ Clear shift schedules
- ✅ Timely notifications
- ✅ Easy swap process
- ✅ Regular coverage reviews

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
