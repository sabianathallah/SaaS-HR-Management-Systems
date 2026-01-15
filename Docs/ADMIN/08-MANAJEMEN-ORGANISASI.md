# 🏢 MANAJEMEN ORGANISASI - ADMIN

> Setup office locations, GPS fencing, holidays, dan organization structure

---

## 🎯 Overview

Admin dapat:
- 📍 Manage office locations
- 🗺️ Configure GPS geo-fencing
- 📅 Set company holidays
- 🏗️ Organization structure
- ⚙️ Company settings
- 🌍 Multi-branch management

---

## 📍 Office Location Management

### Location List

```
┌────────────────────────────────────────────────────────┐
│  📍 Office Locations                                   │
├────┬──────────────┬──────────────┬────────┬───┬───────┤
│ ID │ Location     │ Address      │ Radius │ # │ Action│
├────┼──────────────┼──────────────┼────────┼───┼───────┤
│ 1  │ HQ Jakarta   │ SCBD, Jkt    │ 50m    │142│ Edit  │
│ 2  │ Branch BSD   │ BSD City     │ 100m   │ 45│ Edit  │
│ 3  │ Warehouse    │ Cakung       │ 200m   │ 23│ Edit  │
└────┴──────────────┴──────────────┴────────┴───┴───────┘

[ + Add New Location ]
```

---

### Add New Location

```
┌─────────────────────────────────────────┐
│  ➕ Add Office Location                 │
├─────────────────────────────────────────┤
│  Location Name: *                       │
│  [HQ Jakarta]                           │
│                                         │
│  Address: *                             │
│  [Jl. Sudirman Kav. 52-53, SCBD]       │
│  [Jakarta Selatan 12190]                │
│                                         │
│  📍 GPS Coordinates: *                  │
│  Latitude:  [-6.200050]                 │
│  Longitude: [106.816700]                │
│  [ 📍 Pick from Map ] [ 🔍 Auto-Detect ]│
│                                         │
│  🗺️ Map Preview:                       │
│  ┌─────────────────────────────────┐   │
│  │         [MAP VIEW]              │   │
│  │                                 │   │
│  │         📍 Marker               │   │
│  │        ( )  Radius              │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Geo-Fence Radius: *                    │
│  [50] meters                            │
│  ━━━━━━━━━━━━ 50m                      │
│  (Recommended: 50-200m)                 │
│                                         │
│  Validation Mode:                       │
│  (•) Strict (Must be within radius)     │
│  ( ) Moderate (Flag if outside)         │
│  ( ) Loose (GPS optional)               │
│                                         │
│  Active Status:                         │
│  ☑ Active for attendance                │
│  ☑ Show in employee app                 │
│                                         │
│  [ Cancel ]       [ Save Location ]     │
└─────────────────────────────────────────┘
```

**Validation Modes:**
- 🔴 **Strict:** Reject if outside radius
- 🟡 **Moderate:** Allow but flag for review
- 🟢 **Loose:** GPS optional (manual entry OK)

---

## 🗺️ GPS Geo-Fencing Configuration

### How It Works

```
┌─────────────────────────────────────────┐
│  Employee Clock-In Process              │
├─────────────────────────────────────────┤
│  1. Employee clicks "Clock In"          │
│  2. App requests GPS permission         │
│  3. Get current coordinates             │
│     Lat: -6.200050                      │
│     Lng: 106.816700                     │
│                                         │
│  4. Calculate distance to office:       │
│     ┌─────────────────────────────┐    │
│     │ Haversine Formula           │    │
│     │ d = 2r × arcsin(√...)       │    │
│     │                             │    │
│     │ Distance: 45 meters         │    │
│     │ Radius:   50 meters         │    │
│     │ Status:   ✅ INSIDE         │    │
│     └─────────────────────────────┘    │
│                                         │
│  5. Validation:                         │
│     ✅ 45m < 50m → APPROVED             │
│     ❌ 125m > 50m → REJECTED            │
│                                         │
│  6. locationValidationStatus:           │
│     - "valid" (inside radius)           │
│     - "outside_radius" (needs review)   │
│     - "gps_error" (GPS failed)          │
└─────────────────────────────────────────┘
```

### Geofence Map Visualization

```
Office Location (HQ Jakarta)
📍 Lat: -6.200050, Lng: 106.816700

        North
          ↑
          │
West ←────┼────→ East
          │
          ↓
        South

Radius: 50 meters
┌─────────────────────┐
│    . . . . . . .    │  ← 50m boundary
│  .             .    │
│ .       📍       .  │  ← Office center
│  .             .    │
│    . . . . . . .    │
└─────────────────────┘

✅ Inside: 0-50m (Auto-approve)
⚠️ Outside: 51-200m (Review required)
❌ Far: >200m (Auto-reject)
```

---

### Test GPS Coordinates

```
┌─────────────────────────────────────────┐
│  🔍 Test GPS Validation                 │
├─────────────────────────────────────────┤
│  Office: [HQ Jakarta ▼]                 │
│  Center: -6.200050, 106.816700          │
│  Radius: 50 meters                      │
│                                         │
│  Test Coordinates:                      │
│  Latitude:  [-6.200100]                 │
│  Longitude: [106.816750]                │
│                                         │
│  [ Calculate Distance ]                 │
│                                         │
│  Result:                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  Distance: 45 meters                    │
│  Status: ✅ INSIDE RADIUS               │
│  Validation: APPROVED                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━             │
│                                         │
│  Map:                                   │
│  ┌─────────────────────────────────┐   │
│  │  📍 Office                      │   │
│  │   \                             │   │
│  │    \ 45m                        │   │
│  │     \                           │   │
│  │      📌 Test Point              │   │
│  │                                 │   │
│  │  ( ) 50m radius                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 📅 Company Holiday Calendar

### Holiday List

```
┌────────────────────────────────────────────────────────┐
│  📅 Company Holidays - 2026                            │
├────┬──────────────────┬────────────┬─────────┬────────┤
│ ID │ Holiday Name     │ Date       │ Type    │ Action │
├────┼──────────────────┼────────────┼─────────┼────────┤
│ 1  │ New Year         │ 01 Jan     │ National│ Edit   │
│ 2  │ Isra Mi'raj      │ 27 Jan     │ National│ Edit   │
│ 3  │ Chinese New Year │ 29 Jan     │ National│ Edit   │
│ 4  │ Nyepi            │ 11 Mar     │ National│ Edit   │
│ 5  │ Good Friday      │ 29 Mar     │ National│ Edit   │
│ 6  │ Eid al-Fitr      │ 31 Mar-1Apr│ National│ Edit   │
│ 7  │ Labor Day        │ 01 May     │ National│ Edit   │
│ 8  │ Company Anniv    │ 15 Jul     │ Company │ Edit   │
│... │                  │            │         │        │
└────┴──────────────────┴────────────┴─────────┴────────┘

Total: 15 holidays (12 national, 3 company)

[ + Add Holiday ] [ Import from Template ] [ Sync with Gov ]
```

---

### Add Holiday

```
┌─────────────────────────────────────────┐
│  ➕ Add Company Holiday                 │
├─────────────────────────────────────────┤
│  Holiday Name: *                        │
│  [Eid al-Fitr]                          │
│                                         │
│  Date: *                                │
│  Start: [31/03/2026]                    │
│  End:   [01/04/2026]                    │
│  Duration: 2 days (collective leave)    │
│                                         │
│  Type:                                  │
│  (•) National Holiday                   │
│  ( ) Religious Holiday                  │
│  ( ) Company Event                      │
│  ( ) Regional Holiday                   │
│                                         │
│  Applies To:                            │
│  (•) All employees                      │
│  ( ) Specific branches: [___]           │
│  ( ) Specific departments: [___]        │
│                                         │
│  Attendance Rules:                      │
│  ☑ Skip auto-absent                     │
│  ☑ Don't require clock-in/out           │
│  ☐ Allow voluntary attendance           │
│  ☐ Holiday pay multiplier (3x)          │
│                                         │
│  Description:                           │
│  ┌─────────────────────────────────┐   │
│  │ Eid al-Fitr (Lebaran)           │   │
│  │ Office closed for 2 days        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ☑ Notify all employees                 │
│  ☑ Add to calendar                      │
│                                         │
│  [ Cancel ]          [ Add Holiday ]    │
└─────────────────────────────────────────┘
```

**Holiday Effects:**
- ✅ No attendance required
- ✅ Auto-absent skipped
- ✅ Leave requests blocked
- ✅ Marked in calendar
- ✅ Notifications sent

---

## 🏗️ Organization Structure

### Department Management

```
┌────────────────────────────────────────────────────────┐
│  🏗️ Departments                                        │
├────┬──────────────┬──────────┬──────────┬──────┬──────┤
│ ID │ Department   │ Manager  │ Members  │ Budget│ Act. │
├────┼──────────────┼──────────┼──────────┼──────┼──────┤
│ 1  │ Engineering  │ Budi     │ 45       │ 500M │ Edit │
│ 2  │ Sales        │ Ani      │ 30       │ 300M │ Edit │
│ 3  │ HR           │ Citra    │ 8        │ 80M  │ Edit │
│ 4  │ Finance      │ Doni     │ 12       │ 120M │ Edit │
│ 5  │ Marketing    │ Eko      │ 15       │ 150M │ Edit │
└────┴──────────────┴──────────┴──────────┴──────┴──────┘

[ + Add Department ]
```

### Organization Chart

```
                    📊 CEO
                    John Doe
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    📈 CFO         🏭 COO         💼 CHRO
    Finance      Operations         HR
        │              │              │
    ┌───┴───┐      ┌───┴───┐         │
    │       │      │       │         │
  Acct   Tax   Eng    Sales      Recruit
   12     8     45      30          8

Click department to view:
├─ Department details
├─ Team members
├─ Budget & expenses
└─ Performance metrics
```

---

## ⚙️ Company Settings

### General Settings

```
┌─────────────────────────────────────────┐
│  ⚙️ Company Settings                    │
├─────────────────────────────────────────┤
│  Company Info:                          │
│  Name:    [PT Salmon HRIS]              │
│  Email:   [hr@company.com]              │
│  Phone:   [021-1234567]                 │
│  Website: [www.company.com]             │
│                                         │
│  Working Hours:                         │
│  Days/Week:     [5] days                │
│  Hours/Day:     [8] hours               │
│  Total/Week:    40 hours                │
│                                         │
│  Attendance:                            │
│  ☑ Require GPS validation               │
│  ☑ Require photo (selfie)               │
│  ☑ Auto-absent at 18:00                 │
│  ☑ Late tolerance: [15] minutes         │
│                                         │
│  Leave Quota (Annual):                  │
│  New Employee: [12] days                │
│  > 1 year:     [12] days                │
│  > 5 years:    [15] days                │
│                                         │
│  Overtime:                              │
│  Weekday:  [1.5]x                       │
│  Weekend:  [2.0]x                       │
│  Holiday:  [3.0]x                       │
│  Night:    [+0.5]x                      │
│                                         │
│  Notifications:                         │
│  ☑ Email notifications                  │
│  ☑ In-app notifications                 │
│  ☐ SMS notifications                    │
│                                         │
│  [ Save Settings ]                      │
└─────────────────────────────────────────┘
```

---

## 🌍 Multi-Branch Management

### Branch Setup

```
┌─────────────────────────────────────────┐
│  🌍 Branch: BSD Office                  │
├─────────────────────────────────────────┤
│  Branch Name: [BSD City Office]         │
│  Branch Code: [BSD01]                   │
│                                         │
│  Location:                              │
│  Address: BSD City, Tangerang           │
│  GPS: -6.302100, 106.651900             │
│  Radius: 100 meters                     │
│                                         │
│  Local Settings:                        │
│  Timezone: [WIB (GMT+7)]                │
│  Currency: [IDR]                        │
│  Language: [Bahasa Indonesia]           │
│                                         │
│  Working Hours:                         │
│  Regular Shift: 09:00 - 17:00           │
│  (Different from HQ Jakarta)            │
│                                         │
│  Staff:                                 │
│  Employees: 45                          │
│  Manager: Doni Prakoso                  │
│                                         │
│  Budget Allocation:                     │
│  Monthly: Rp 150,000,000                │
│  Overtime: Rp 10,000,000                │
│                                         │
│  Local Holidays:                        │
│  ☑ Include national holidays            │
│  ☑ Include regional holidays            │
│                                         │
│  [ Save Branch Settings ]               │
└─────────────────────────────────────────┘
```

---

## 📊 Organization Analytics

### Company Overview

```
┌────────────────────────────────────────┐
│  📊 Organization Overview              │
├────────────────────────────────────────┤
│  Total Employees:    250               │
│  Active:            242 (97%)          │
│  On Leave:          5 (2%)             │
│  Inactive:          3 (1%)             │
│                                        │
│  By Department:                        │
│  Engineering:  45 (18%)  [████    ]   │
│  Sales:        30 (12%)  [███     ]   │
│  HR:           8 (3%)    [█        ]   │
│  Finance:      12 (5%)   [█        ]   │
│  Marketing:    15 (6%)   [██       ]   │
│  Others:       140 (56%) [███████  ]   │
│                                        │
│  By Location:                          │
│  HQ Jakarta:   142 (57%)               │
│  BSD Branch:   45 (18%)                │
│  Warehouse:    23 (9%)                 │
│  Remote:       40 (16%)                │
│                                        │
│  Headcount Trend:                      │
│  Jan 2025: 220 → Jan 2026: 250 (+14%) │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━          │
│  [▂▃▄▅▆▇█] Growing                     │
└────────────────────────────────────────┘
```

---

## 🔍 Location Validation Reports

### GPS Validation Status

```
Period: January 2026

Total Check-Ins: 4,850
├─ Valid (inside): 4,650 (96%)
├─ Outside radius: 150 (3%)
└─ GPS error: 50 (1%)

Top Violation Locations:
1. BSD Office (45 violations)
   - Reason: Nearby mall parking
   - Action: Expand radius to 150m

2. Warehouse (23 violations)
   - Reason: Large facility
   - Action: Multiple GPS points

Recommendations:
📌 Review radius settings
📌 Add secondary GPS points
📌 Employee GPS education
```

---

## ✅ Best Practices

**Location Setup:**
- ✅ Accurate GPS coordinates
- ✅ Appropriate radius (50-200m)
- ✅ Test before deployment
- ✅ Multiple points for large areas
- ✅ Consider building structure (GPS blocking)

**Holiday Management:**
- ✅ Set holidays early (min 1 month notice)
- ✅ Sync with government calendar
- ✅ Communicate clearly
- ✅ Update yearly
- ✅ Consider regional differences

**Organization:**
- ✅ Clear hierarchy
- ✅ Regular updates
- ✅ Budget tracking
- ✅ Performance monitoring
- ✅ Fair resource allocation

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
