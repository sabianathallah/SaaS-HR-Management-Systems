# ⏰ MANAJEMEN OVERTIME - ADMIN

> Approve, track, dan manage overtime requests & payroll

---

## 🎯 Overview

Admin dapat:
- 📋 Review overtime requests
- ✅ Approve/reject requests
- 💰 Calculate overtime pay
- 📊 Budget tracking
- 📈 Generate overtime reports
- ⚙️ Configure overtime rules

---

## 📋 Overtime Request Queue

### Pending Dashboard

```
┌────────────────────────────────────────────────────────┐
│  ⏰ Overtime Requests - Pending Approval               │
├────────────────────────────────────────────────────────┤
│  Pending: 8 | Total Hours: 32h | Est Cost: Rp 960K    │
├──────┬────────────┬──────┬──────────┬──────────┬───────┤
│ ID   │ Employee   │ Date │ Duration │ Est Pay  │ Action│
├──────┼────────────┼──────┼──────────┼──────────┼───────┤
│ #201 │ Budi       │15/01 │ 3h       │ Rp 90K   │ Review│
│ #202 │ Ani        │15/01 │ 4h       │ Rp 120K  │ Review│
│ #203 │ Citra      │16/01 │ 5h       │ Rp 150K  │ Review│
└──────┴────────────┴──────┴──────────┴──────────┴───────┘
```

**Priority:**
- 🔴 High: Holiday/weekend overtime
- 🟡 Medium: Weekday >3 hours
- 🟢 Normal: Regular overtime

---

## ✅ Approval Workflow

### Review Request Detail

```
┌─────────────────────────────────────────┐
│  ⏰ Overtime Request #201               │
├─────────────────────────────────────────┤
│  👤 Employee: Budi Santoso              │
│  💼 Position: Senior Developer          │
│  💵 Hourly Rate: Rp 30,000/h            │
│                                         │
│  📅 Overtime Details:                   │
│  Date:          15 Jan 2026             │
│  Start Time:    17:00                   │
│  End Time:      20:00                   │
│  Duration:      3 hours                 │
│  Type:          Weekday                 │
│                                         │
│  Reason:                                │
│  "Deploy urgent fix untuk client X.     │
│   Deadline malam ini."                  │
│                                         │
│  📊 Calculation:                        │
│  Base Rate:     Rp 30,000/h             │
│  Multiplier:    1.5x (weekday)          │
│  Rate:          Rp 45,000/h             │
│  Total Hours:   3h                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  Total Pay:     Rp 135,000              │
│                                         │
│  📈 Budget Impact:                      │
│  Dept Budget:   Rp 5,000,000/month      │
│  Used This Mo:  Rp 2,100,000 (42%)      │
│  After Approval:Rp 2,235,000 (45%)      │
│  Remaining:     Rp 2,765,000 (55%)      │
│                                         │
│  📅 Submitted:  15/01/2026 17:15        │
│                                         │
│  [ ❌ Reject ] [ ✅ Approve ]           │
└─────────────────────────────────────────┘
```

### Approve Process

```
Admin clicks "Approve"
   ↓
Calculation Confirmation:
┌─────────────────────────────────────┐
│  💰 Overtime Payment Calculation    │
│                                     │
│  Duration:    3 hours               │
│  Rate:        Rp 45,000/h           │
│  Total Pay:   Rp 135,000            │
│                                     │
│  ☑ Add to payroll                   │
│  ☑ Deduct from department budget    │
│  ☑ Send confirmation to employee    │
│                                     │
│  [ Cancel ] [ Confirm Approval ]    │
└─────────────────────────────────────┘
   ↓
System Process:
├─ Update status → APPROVED
├─ Lock calculation
├─ Add to payroll list
├─ Update budget tracker
├─ Send notification
├─ Create audit log
└─ Email confirmation
   ↓
✅ Overtime Approved!
```

**API Call:**
```javascript
PUT /overtime/admin/:id/approve
{
  approvedBy: adminId,
  calculatedAmount: 135000,
  approvedAt: now
}
```

---

### Reject Process

```
┌─────────────────────────────────────┐
│  ❌ Reject Overtime Request #201   │
├─────────────────────────────────────┤
│  Reason for Rejection: *            │
│  ( ) Budget exceeded                │
│  ( ) Not urgent                     │
│  ( ) Lack of documentation          │
│  (•) Other                          │
│                                     │
│  Details:                           │
│  ┌─────────────────────────────┐   │
│  │ Overtime not pre-approved.  │   │
│  │ Please get approval before  │   │
│  │ working overtime.           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Cancel ]  [ Confirm Rejection ]  │
└─────────────────────────────────────┘
```

---

## 💰 Overtime Rate Configuration

### Rate Setup

```
┌─────────────────────────────────────────┐
│  ⚙️ Overtime Rate Configuration         │
├─────────────────────────────────────────┤
│  Base Calculation:                      │
│  (•) Per Hour                           │
│  ( ) Per Day                            │
│                                         │
│  Multipliers:                           │
│  ┌─────────────────────────────────┐   │
│  │ Type         Base    Multiplier │   │
│  ├─────────────────────────────────┤   │
│  │ Weekday      Hourly  1.5x       │   │
│  │ Weekend      Hourly  2.0x       │   │
│  │ Holiday      Hourly  3.0x       │   │
│  │ Night (22-6) Hourly  +0.5x      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Example Calculation:                   │
│  Employee Rate: Rp 30,000/h             │
│  Sunday Night (Weekend + Night):        │
│  = Rp 30,000 × (2.0 + 0.5)             │
│  = Rp 75,000/h                          │
│                                         │
│  [ Reset to Default ] [ Save ]          │
└─────────────────────────────────────────┘
```

**Rate Types:**
- **Weekday:** 1.5x base rate
- **Weekend:** 2.0x base rate
- **Holiday:** 3.0x base rate
- **Night Shift:** +0.5x additional

---

## 📊 Budget Management

### Department Budget Tracking

```
┌────────────────────────────────────────────────────┐
│  💰 Overtime Budget - January 2026                │
├────────────────────────────────────────────────────┤
│  Department: Engineering                          │
│  Monthly Budget: Rp 5,000,000                     │
│  Used: Rp 2,100,000 (42%)                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  [████████████░░░░░░░░░░░░░░] 42%                │
│  Remaining: Rp 2,900,000 (58%)                    │
│                                                   │
│  Pending Approvals:                               │
│  Amount: Rp 960,000                               │
│  After Approval: 61% budget used                  │
│                                                   │
│  ⚠️ Warning: High budget usage                    │
└────────────────────────────────────────────────────┘
```

**Budget Alerts:**
- 🟢 <50%: Safe
- 🟡 50-80%: Warning
- 🔴 >80%: Critical
- 🚫 100%: Budget exceeded (auto-reject)

---

### Set Department Budget

```
┌─────────────────────────────────────┐
│  💰 Set Overtime Budget             │
├─────────────────────────────────────┤
│  Department: [Engineering ▼]        │
│                                     │
│  Period: [Monthly ▼]                │
│                                     │
│  Budget Amount: *                   │
│  Rp [5,000,000]                     │
│                                     │
│  Alert Thresholds:                  │
│  ☑ 50% - Send warning               │
│  ☑ 80% - Require special approval   │
│  ☑ 100% - Auto-reject               │
│                                     │
│  Apply to:                          │
│  (•) This month only                │
│  ( ) Recurring monthly              │
│  ( ) All months in 2026             │
│                                     │
│  [ Cancel ]      [ Save Budget ]    │
└─────────────────────────────────────┘
```

---

## 📈 Reports & Analytics

### Monthly Overtime Report

```
┌────────────────────────────────────────┐
│  📊 Overtime Report - January 2026    │
├────────────────────────────────────────┤
│  Total Requests:     45                │
│  Approved:          42 (93%)           │
│  Rejected:          3 (7%)             │
│                                        │
│  Total Hours:       168 hours          │
│  Total Cost:        Rp 6,300,000       │
│  Avg Cost/Employee: Rp 140,000         │
│                                        │
│  By Type:                              │
│  Weekday:   120h (71%) - Rp 4,500,000  │
│  Weekend:   36h (21%)  - Rp 1,440,000  │
│  Holiday:   12h (7%)   - Rp 360,000    │
│                                        │
│  Top 5 Employees:                      │
│  1. Budi    - 24h - Rp 720,000         │
│  2. Ani     - 20h - Rp 600,000         │
│  3. Citra   - 18h - Rp 540,000         │
│  4. Doni    - 16h - Rp 480,000         │
│  5. Eko     - 14h - Rp 420,000         │
│                                        │
│  By Department:                        │
│  Engineering: Rp 3,500,000 (56%)       │
│  Sales:       Rp 1,800,000 (29%)       │
│  Support:     Rp 1,000,000 (15%)       │
└────────────────────────────────────────┘
```

### Export Options

```
Generate Overtime Report:

Format:
☑ Excel (.xlsx)
  - Summary sheet
  - Detail sheet
  - Pivot table
  - Charts

☐ PDF
  - Executive summary
  - Charts & graphs

☐ CSV
  - Raw data export

Include:
☑ Employee details
☑ Cost breakdown
☑ Budget comparison
☑ Approval timeline

[ Generate Report ]
```

---

## 🔍 Overtime Analysis

### Trend Analysis

```
Overtime Hours by Month:

  Hours
   200│                     ▄▄▄
   180│              ▄▄▄   ████
   160│       ▄▄▄   ████   ████
   140│▄▄▄   ████   ████   ████
   120│███   ████   ████   ████
   100│███   ████   ████   ████
    80│███   ████   ████   ████
    └─────────────────────────────
     Oct   Nov   Dec   Jan

Insights:
📈 Increasing trend (+15% from October)
⚠️ December spike (year-end deadlines)
📊 January remains high (new projects)
```

### Pattern Detection

**High Overtime Employees:**
```
⚠️ Alert: Potential Burnout Risk

Employee: Budi Santoso
Overtime: 24h in January (3h/day avg)
Recommendation: Review workload, hire support

Employee: Ani Wijaya
Overtime: 20h in January
Pattern: Every Friday (deadline day)
Recommendation: Adjust project timeline
```

---

## 🔔 Automated Notifications

**Daily Digest (to Admin):**
```
Subject: ⏰ Daily Overtime Summary

Pending Approvals: 8 requests (32h)
Estimated Cost: Rp 960,000
Budget Status: 61% used

Urgent:
- #203: Citra (5h) - Holiday overtime
- #204: Doni (4h) - Night shift

Please review.
```

**Weekly Report:**
```
Subject: 📊 Weekly Overtime Report

Week of Jan 13-19:
Total: 48 hours (12 requests)
Cost: Rp 1,440,000

Top Department: Engineering (28h)
Top Employee: Budi (12h)

Budget Alert: Engineering at 65%
```

---

## ✅ Approval Guidelines

**Quick Approval Criteria:**
- ✅ Within budget
- ✅ Clear business justification
- ✅ Reasonable duration (<4h)
- ✅ Weekday overtime
- ✅ Manager pre-approved

**Require Special Review:**
- ⚠️ >4 hours duration
- ⚠️ Holiday/weekend
- ⚠️ Budget >80%
- ⚠️ Frequent overtime (same employee)
- ⚠️ No manager approval

**Auto-Reject Scenarios:**
- ❌ Budget exhausted (100%)
- ❌ No reason provided
- ❌ Past date overtime (>7 days)
- ❌ Duplicate request

---

## 💼 Payroll Integration

### Export to Payroll

```
┌─────────────────────────────────────┐
│  💰 Export Overtime to Payroll      │
├─────────────────────────────────────┤
│  Period: January 2026               │
│                                     │
│  Approved Overtime:                 │
│  Total Records: 42                  │
│  Total Hours:   168h                │
│  Total Amount:  Rp 6,300,000        │
│                                     │
│  Export Format:                     │
│  (•) Excel (Payroll template)       │
│  ( ) CSV                            │
│  ( ) JSON API                       │
│                                     │
│  Include:                           │
│  ☑ Employee ID                      │
│  ☑ Name & Position                  │
│  ☑ Total hours                      │
│  ☑ Calculated amount                │
│  ☑ Payment details                  │
│                                     │
│  [ Cancel ]    [ Export to Payroll ]│
└─────────────────────────────────────┘
```

**Payroll Export Format:**
```csv
EmployeeID,Name,Month,TotalHours,Amount,Type
001,Budi Santoso,2026-01,24,720000,Overtime
002,Ani Wijaya,2026-01,20,600000,Overtime
```

---

## ⚙️ System Settings

**Global Settings:**
```
Auto-Approval Rules:
☐ Auto-approve if <2 hours
☐ Auto-approve weekday only
☐ Require manager approval first

Calculation:
☑ Round to nearest 15 minutes
☐ Minimum 1 hour billing
☑ Include break time

Notifications:
☑ Email on approval/rejection
☑ Daily pending reminder to admin
☑ Budget alert at 80%
```

---

## ✅ Best Practices

**For Approvals:**
- ✅ Review within 24 hours
- ✅ Check budget before approve
- ✅ Verify business justification
- ✅ Monitor frequent overtime
- ✅ Fair and consistent decisions

**Budget Management:**
- ✅ Set realistic monthly budgets
- ✅ Monitor trends
- ✅ Plan for peak periods
- ✅ Alert at 80% threshold
- ✅ Review and adjust quarterly

**Communication:**
- ✅ Clear rejection reasons
- ✅ Prompt notifications
- ✅ Regular reports to management
- ✅ Transparency on budget status

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
