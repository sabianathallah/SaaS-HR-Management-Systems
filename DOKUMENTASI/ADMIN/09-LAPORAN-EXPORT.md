# 📊 LAPORAN & EXPORT - ADMIN

> Generate comprehensive reports dan export data dalam berbagai format

---

## 🎯 Overview

Admin dapat:
- 📈 Generate various reports
- 📥 Export ke Excel/PDF/CSV
- 📊 Custom report builder
- 📅 Scheduled reports
- 📧 Email reports
- 📂 Report history

---

## 📊 Available Reports

### Report Categories

```
┌────────────────────────────────────────────────────────┐
│  📊 Report Center                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  👥 EMPLOYEE REPORTS                                   │
│  ├─ Employee Master List                              │
│  ├─ Employee Directory                                │
│  ├─ New Hires Report                                  │
│  └─ Termination Report                                │
│                                                        │
│  📋 ATTENDANCE REPORTS                                 │
│  ├─ Daily Attendance Summary                          │
│  ├─ Monthly Attendance Report                         │
│  ├─ Late/Absent Analysis                              │
│  ├─ GPS Violation Report                              │
│  └─ Work Hours Summary                                │
│                                                        │
│  🏖️ LEAVE REPORTS                                     │
│  ├─ Leave Balance Report                              │
│  ├─ Leave Usage Summary                               │
│  ├─ Pending Leave Requests                            │
│  └─ Leave Expiration Alert                            │
│                                                        │
│  ⏰ OVERTIME REPORTS                                   │
│  ├─ Overtime Summary                                  │
│  ├─ Overtime Cost Analysis                            │
│  ├─ Department Overtime Comparison                    │
│  └─ Employee Overtime Ranking                         │
│                                                        │
│  💰 PAYROLL REPORTS                                    │
│  ├─ Payroll Summary                                   │
│  ├─ Overtime Payroll Export                           │
│  └─ Department Cost Breakdown                         │
│                                                        │
│  📈 ANALYTICS & INSIGHTS                               │
│  ├─ Department Performance                            │
│  ├─ Productivity Metrics                              │
│  ├─ Trend Analysis                                    │
│  └─ Executive Dashboard Report                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Generate Reports

### Report Generation Form

```
┌─────────────────────────────────────────┐
│  📊 Generate Report                     │
├─────────────────────────────────────────┤
│  Select Report Type: *                  │
│  [Monthly Attendance Report ▼]          │
│                                         │
│  Period: *                              │
│  From: [01/01/2026]                     │
│  To:   [31/01/2026]                     │
│                                         │
│  Quick Select:                          │
│  [ This Month ] [ Last Month ]          │
│  [ This Quarter ] [ This Year ]         │
│                                         │
│  Filters:                               │
│  Department: [All ▼]                    │
│    ☐ Engineering                        │
│    ☐ Sales                              │
│    ☑ HR                                 │
│    ☐ Finance                            │
│                                         │
│  Employee: [All ▼]                      │
│  Status: [All ▼]                        │
│    ☐ Active                             │
│    ☐ Inactive                           │
│                                         │
│  Export Format: *                       │
│  ☑ Excel (.xlsx)                        │
│  ☐ PDF (.pdf)                           │
│  ☐ CSV (.csv)                           │
│  ☐ JSON (.json)                         │
│                                         │
│  Options:                               │
│  ☑ Include summary statistics           │
│  ☑ Include charts & graphs              │
│  ☐ Include detailed breakdown           │
│  ☐ Include employee photos              │
│                                         │
│  Delivery:                              │
│  (•) Download immediately               │
│  ( ) Email to: [_____________]          │
│  ( ) Schedule: [Weekly ▼]               │
│                                         │
│  [ Cancel ]        [ Generate Report ]  │
└─────────────────────────────────────────┘
```

---

## 📊 Report Examples

### 1. Monthly Attendance Report

**Excel Output Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Sheet 1: Summary                                       │
├─────────────────────────────────────────────────────────┤
│  Period: January 2026                                   │
│  Generated: 15/01/2026 10:30 AM                         │
│                                                         │
│  Overall Statistics:                                    │
│  Total Employees:     150                               │
│  Total Working Days:  22                                │
│  Avg Attendance:      97.5%                             │
│  Total Late:          45 (1.4%)                         │
│  Total Absent:        32 (1.0%)                         │
│                                                         │
│  ┌────────────┬──────┬────┬───────┬──────┬────────┐    │
│  │ Department │ Total│ %  │ Late  │ Abs  │ Avg Hrs│    │
│  ├────────────┼──────┼────┼───────┼──────┼────────┤    │
│  │ Engineering│ 45   │ 98%│ 8     │ 2    │ 8.5h   │    │
│  │ Sales      │ 30   │ 96%│ 15    │ 5    │ 8.2h   │    │
│  │ HR         │ 8    │ 100│ 0     │ 0    │ 8.0h   │    │
│  │ Finance    │ 12   │ 99%│ 2     │ 1    │ 8.3h   │    │
│  └────────────┴──────┴────┴───────┴──────┴────────┘    │
│                                                         │
│  [Chart: Attendance Trend]                              │
│  [Chart: Department Comparison]                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Sheet 2: Detail                                        │
├─────────────────────────────────────────────────────────┤
│  ┌────┬──────────┬──────┬──────┬──────┬──────┬────────┐│
│  │ ID │ Employee │ Dept │ Days │ Late │ Abs  │ Status ││
│  ├────┼──────────┼──────┼──────┼──────┼──────┼────────┤│
│  │ 001│ Budi     │ Eng  │ 22   │ 2    │ 0    │ Good   ││
│  │ 002│ Ani      │ Sales│ 20   │ 3    │ 2    │ Warning││
│  │ 003│ Citra    │ HR   │ 22   │ 0    │ 0    │ Perfect││
│  │... │          │      │      │      │      │        ││
│  └────┴──────────┴──────┴──────┴──────┴──────┴────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Sheet 3: Pivot Table                                   │
├─────────────────────────────────────────────────────────┤
│  Department vs Attendance Status                        │
│  [Interactive Pivot Table]                              │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Leave Balance Report

**PDF Output Preview:**
```
╔═══════════════════════════════════════════╗
║   LEAVE BALANCE REPORT                    ║
║   Period: 2026                            ║
║   Generated: 15 Jan 2026                  ║
╚═══════════════════════════════════════════╝

Executive Summary:
──────────────────────────────────────────
Total Leave Quota:      1,800 days
Used to Date:          450 days (25%)
Remaining:             1,350 days (75%)
At Risk (expiring):    120 days (6.7%)

Low Balance Employees (< 3 days):
──────────────────────────────────────────
1. Budi Santoso       - 2 days remaining
2. Doni Prakoso       - 0 days remaining
3. Eko Wijaya         - 1 day remaining

Department Breakdown:
──────────────────────────────────────────
┌──────────────┬────────┬──────┬──────────┐
│ Department   │ Quota  │ Used │ Remaining│
├──────────────┼────────┼──────┼──────────┤
│ Engineering  │ 540    │ 243  │ 297 (55%)│
│ Sales        │ 360    │ 223  │ 137 (38%)│
│ HR           │ 96     │ 32   │ 64 (67%) │
│ Finance      │ 144    │ 67   │ 77 (53%) │
└──────────────┴────────┴──────┴──────────┘

[PIE CHART: Leave Usage by Type]
[BAR CHART: Department Comparison]

Recommendations:
──────────────────────────────────────────
• Encourage Doni Prakoso to take leave
• Sales dept high usage - review staffing
• HR low usage - promote work-life balance

──────────────────────────────────────────
Report generated by: Admin User
Date: 15 January 2026, 10:30 AM
Page 1 of 3
```

---

### 3. Overtime Cost Analysis

**Excel Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  OVERTIME COST ANALYSIS - January 2026                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💰 Total Overtime Cost: Rp 6,300,000                   │
│  📊 Total Hours: 168 hours                              │
│  👥 Employees: 45 (30% of workforce)                    │
│  📈 vs Last Month: +15% (Rp 900,000)                    │
│                                                         │
│  Cost Breakdown by Type:                                │
│  ┌──────────┬───────┬──────────┬────────┐              │
│  │ Type     │ Hours │ Rate     │ Cost   │              │
│  ├──────────┼───────┼──────────┼────────┤              │
│  │ Weekday  │ 120h  │ Rp37,500 │ 4.5M   │ [███████  ] │
│  │ Weekend  │ 36h   │ Rp40,000 │ 1.4M   │ [██       ] │
│  │ Holiday  │ 12h   │ Rp30,000 │ 360K   │ [█        ] │
│  └──────────┴───────┴──────────┴────────┘              │
│                                                         │
│  Top 5 Cost Centers:                                    │
│  1. Engineering  - Rp 3,500,000 (56%) [████████    ]   │
│  2. Sales        - Rp 1,800,000 (29%) [████        ]   │
│  3. Support      - Rp 1,000,000 (15%) [██          ]   │
│                                                         │
│  Top 5 Employees:                                       │
│  1. Budi    - 24h - Rp 720,000 ⚠️ High                 │
│  2. Ani     - 20h - Rp 600,000                          │
│  3. Citra   - 18h - Rp 540,000                          │
│                                                         │
│  Budget Status:                                         │
│  Engineering: [████████░░] 80% ⚠️                       │
│  Sales:       [██████░░░░] 60%                          │
│  HR:          [███░░░░░░░] 30%                          │
│                                                         │
│  [LINE CHART: Daily Overtime Trend]                     │
│  [HEATMAP: Overtime by Day & Department]                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Custom Report Builder

### Build Your Own Report

```
┌─────────────────────────────────────────┐
│  🔧 Custom Report Builder               │
├─────────────────────────────────────────┤
│  Step 1: Select Data Source             │
│  ┌─────────────────────────────────┐   │
│  │ ☑ Attendances                   │   │
│  │ ☑ Leave Requests                │   │
│  │ ☐ Overtime                      │   │
│  │ ☐ Employees                     │   │
│  │ ☐ Shifts                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Step 2: Select Fields                  │
│  ┌─────────────────────────────────┐   │
│  │ Available       →    Selected   │   │
│  ├──────────────   ──  ────────────┤   │
│  │ ☐ Employee ID   │  ☑ Name       │   │
│  │ ☐ Department    │  ☑ Date       │   │
│  │ ☐ Position      │  ☑ Clock In   │   │
│  │ ☐ Shift         │  ☑ Clock Out  │   │
│  │ ☐ GPS Lat/Lng   │  ☑ Status     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Step 3: Filters                        │
│  Date Range: [01/01/26] - [31/01/26]   │
│  Status: [All ▼]                        │
│  Department: [Engineering ▼]            │
│                                         │
│  Step 4: Group & Aggregate              │
│  Group By: [Department ▼]               │
│  Aggregate:                             │
│  ☑ Count records                        │
│  ☑ Sum hours                            │
│  ☐ Average                              │
│  ☐ Min/Max                              │
│                                         │
│  Step 5: Sort & Format                  │
│  Sort By: [Date ▼] [Desc ▼]            │
│  Format: [Excel ▼]                      │
│                                         │
│  ☑ Save as template                     │
│  Template name: [_______________]       │
│                                         │
│  [ Preview ] [ Reset ] [ Generate ]     │
└─────────────────────────────────────────┘
```

---

## 📅 Scheduled Reports

### Auto-Generate Reports

```
┌─────────────────────────────────────────┐
│  📅 Schedule Reports                    │
├─────────────────────────────────────────┤
│  Active Schedules:                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📊 Daily Attendance Summary     │   │
│  │ Schedule: Every day at 18:00    │   │
│  │ Format: PDF                     │   │
│  │ Email to: hr@company.com        │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📊 Weekly Overtime Report       │   │
│  │ Schedule: Every Monday 09:00    │   │
│  │ Format: Excel                   │   │
│  │ Email to: finance@company.com   │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📊 Monthly Leave Balance        │   │
│  │ Schedule: 1st of month, 08:00   │   │
│  │ Format: PDF + Excel             │   │
│  │ Email to: all-managers@co.com   │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ + Add New Schedule ]                 │
└─────────────────────────────────────────┘
```

### Create Schedule

```
┌─────────────────────────────────────────┐
│  ➕ Create Report Schedule              │
├─────────────────────────────────────────┤
│  Report: [Daily Attendance ▼]           │
│                                         │
│  Frequency: *                           │
│  (•) Daily                              │
│  ( ) Weekly on: [Mon ▼]                 │
│  ( ) Monthly on day: [1] of month       │
│  ( ) Custom (cron): [______]            │
│                                         │
│  Time: [18:00]                          │
│                                         │
│  Period:                                │
│  (•) Previous day                       │
│  ( ) Previous week                      │
│  ( ) Previous month                     │
│  ( ) Custom                             │
│                                         │
│  Format: [PDF ▼]                        │
│                                         │
│  Recipients: *                          │
│  ┌─────────────────────────────────┐   │
│  │ hr@company.com                  │   │
│  │ manager@company.com             │   │
│  │ [+ Add email]                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Subject: [Daily Attendance Report]     │
│  Message:                               │
│  ┌─────────────────────────────────┐   │
│  │ Please find attached daily      │   │
│  │ attendance report.              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Cancel ]    [ Create Schedule ]      │
└─────────────────────────────────────────┘
```

---

## 📂 Report History

### Download Archive

```
┌────────────────────────────────────────────────────────┐
│  📂 Report History                                     │
├────┬───────────────┬────────────┬────────┬──────┬─────┤
│ #  │ Report Name   │ Generated  │ Format │ Size │ DL  │
├────┼───────────────┼────────────┼────────┼──────┼─────┤
│ 1  │ Daily Attend  │ 15/01 18:00│ PDF    │ 2.5MB│ 📥  │
│ 2  │ Weekly OT     │ 13/01 09:00│ Excel  │ 1.2MB│ 📥  │
│ 3  │ Leave Balance │ 01/01 08:00│ PDF    │ 850KB│ 📥  │
│ 4  │ Monthly Attend│ 31/12 23:00│ Excel  │ 5.2MB│ 📥  │
└────┴───────────────┴────────────┴────────┴──────┴─────┘

Auto-delete: After 90 days
Storage used: 45 MB / 1 GB (5%)

[ 🗑️ Clear Old Reports ] [ ⚙️ Settings ]
```

---

## 📊 Export Formats

### Available Formats

**1. Excel (.xlsx)**
- ✅ Multiple sheets
- ✅ Formulas & pivot tables
- ✅ Charts & graphs
- ✅ Conditional formatting
- ✅ Best for: Data analysis

**2. PDF (.pdf)**
- ✅ Professional layout
- ✅ Charts & images
- ✅ Page numbers & headers
- ✅ Print-ready
- ✅ Best for: Presentations

**3. CSV (.csv)**
- ✅ Universal format
- ✅ Import to any system
- ✅ Lightweight
- ✅ Best for: Data transfer

**4. JSON (.json)**
- ✅ API integration
- ✅ Structured data
- ✅ Best for: Developers

---

## 📧 Email Reports

### Email Configuration

```
Report: Monthly Attendance
To: hr@company.com, manager@company.com
Subject: Monthly Attendance Report - January 2026

Dear Team,

Please find attached the Monthly Attendance Report
for January 2026.

Key Highlights:
• Overall attendance: 97.5%
• Total late arrivals: 45 (1.4%)
• Total absences: 32 (1.0%)

Top Performing Department: HR (100%)
Needs Attention: Sales (96%)

Report Details:
- Period: 01 Jan - 31 Jan 2026
- Generated: 15 Jan 2026 10:30 AM
- Format: Excel (2 sheets + pivot)
- File size: 2.5 MB

For questions, contact HR Department.

Best regards,
HR System (Automated)

──────────────────────────────────────
Salmon HRIS | hr@company.com
```

---

## 📊 Advanced Analytics

### Executive Dashboard Report

**Monthly Executive Summary (PDF):**
```
╔════════════════════════════════════════╗
║  EXECUTIVE DASHBOARD REPORT            ║
║  January 2026                          ║
╚════════════════════════════════════════╝

🎯 KEY METRICS
──────────────────────────────────────
Headcount:           250 (+5 vs Dec)
Active:              242 (97%)
Attendance Rate:     97.5% ↑
Avg Work Hours:      8.3h/day
Employee Turnover:   2.1% ↓

💼 ATTENDANCE
──────────────────────────────────────
Total Working Days:  22 days
On-Time Rate:        96.4% ↑
Late Rate:           1.4% ↓
Absence Rate:        1.0% →

[CHART: Attendance Trend (6 months)]

🏖️ LEAVE MANAGEMENT
──────────────────────────────────────
Pending Approvals:   12 requests
Avg Approval Time:   8 hours
Leave Usage:         25% of quota
At Risk (expiring):  120 days

⏰ OVERTIME
──────────────────────────────────────
Total Hours:         168h (+15%)
Total Cost:          Rp 6.3M (+12%)
Avg per Employee:    3.7h/month
Budget Status:       65% used

📊 DEPARTMENT PERFORMANCE
──────────────────────────────────────
Top Performer:       HR (100%)
Needs Focus:         Sales (96%)
High OT:             Engineering (80h)

🚨 ALERTS & RECOMMENDATIONS
──────────────────────────────────────
⚠️ Engineering overtime budget at 80%
⚠️ 5 employees with 0 leave balance
✅ Overall attendance improving
💡 Consider hiring for Sales dept

──────────────────────────────────────
Generated: 15 Jan 2026 | Page 1/5
```

---

## ✅ Best Practices

**Report Generation:**
- ✅ Clear date ranges
- ✅ Appropriate format for purpose
- ✅ Include summary & detail
- ✅ Add context & insights
- ✅ Regular schedule

**Data Quality:**
- ✅ Validate before export
- ✅ Check for completeness
- ✅ Remove duplicates
- ✅ Consistent formatting

**Distribution:**
- ✅ Right audience
- ✅ Timely delivery
- ✅ Secure transmission
- ✅ Archive properly

**Security:**
- ✅ Sensitive data handling
- ✅ Access controls
- ✅ Encrypted email
- ✅ Audit trail

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
