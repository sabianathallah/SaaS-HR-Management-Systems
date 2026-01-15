# 🏖️ MANAJEMEN LEAVE REQUEST - ADMIN

> Approval workflow, quota management, dan leave reports

---

## 🎯 Overview

Admin dapat:
- 📋 View all leave requests
- ✅ Approve/reject requests
- 📊 Monitor leave balance
- ✏️ Adjust quota
- 📅 Leave calendar view
- 📈 Generate reports

---

## 📋 Leave Request Queue

### Pending Requests Dashboard

```
┌────────────────────────────────────────────────────────┐
│  🏖️ Leave Requests - Pending Approval                 │
├────────────────────────────────────────────────────────┤
│  Total Pending: 12 | This Week: 5 | Overdue: 2 (>24h) │
├────────────────────────────────────────────────────────┤
│  [ All ] [ Pending ] [ Approved ] [ Rejected ]        │
├──────┬────────────┬──────────┬──────┬────────┬────────┤
│ ID   │ Employee   │ Type     │ Days │ Period │ Action │
├──────┼────────────┼──────────┼──────┼────────┼────────┤
│ #123 │ Budi       │ Annual   │ 3    │ 1-3 Feb│ Review │
│ #122 │ Ani        │ Sick     │ 2    │ 15-16  │ Review │
│ #121 │ Citra      │ Annual   │ 5    │ 20-24  │ Review │
└──────┴────────────┴──────────┴──────┴────────┴────────┘
```

**Priority Indicators:**
- 🔴 Overdue (>24h)
- 🟡 Urgent (<48h before start date)
- 🟢 Normal

---

## ✅ Approval Workflow

### Review Request Detail

```
┌─────────────────────────────────────────┐
│  📋 Leave Request #123                  │
├─────────────────────────────────────────┤
│  👤 Employee: Budi Santoso              │
│  📧 Email: budi@company.com             │
│  🏢 Dept: Engineering                   │
│                                         │
│  📝 Leave Details:                      │
│  Type:        Annual Leave              │
│  Start Date:  01 Feb 2026               │
│  End Date:    03 Feb 2026               │
│  Duration:    3 days                    │
│                                         │
│  Reason:                                │
│  "Liburan keluarga ke Bali"            │
│                                         │
│  📎 Attachment:                         │
│  [ No attachment ]                      │
│                                         │
│  📊 Leave Balance:                      │
│  Annual Quota:  12 days                 │
│  Used:          3 days                  │
│  This Request:  3 days                  │
│  Remaining:     6 days (after approval) │
│                                         │
│  📅 Submitted: 10/01/2026 10:30 AM     │
│  ⏰ SLA Status: ✅ Within 24h           │
│                                         │
│  ⚠️ Team Impact:                        │
│  Same period leaves: 2 others           │
│  - Siti (1-2 Feb)                       │
│  - Ahmad (2-3 Feb)                      │
│                                         │
│  [ ❌ Reject ] [ ✅ Approve ]           │
└─────────────────────────────────────────┘
```

### Approve Flow

```
Admin clicks "Approve"
   ↓
Confirmation Dialog
   ↓
System Process:
├─ Update status → APPROVED
├─ Update usedLeaveQuota (+3)
├─ Create attendance records (status: LEAVE)
├─ Send notification to employee
├─ Create audit log
└─ Send email confirmation
   ↓
✅ Leave Approved!
```

**API Call:**
```javascript
PUT /leave-requests/admin/:id/approve
{
  approvedBy: adminId,
  approvedAt: now,
  notes: "Approved, enjoy your vacation!"
}
```

---

### Reject Flow

```
Admin clicks "Reject"
   ↓
Rejection Form:
┌─────────────────────────────────────┐
│  ❌ Reject Leave Request #123      │
├─────────────────────────────────────┤
│  Reason for Rejection: *            │
│  ┌─────────────────────────────┐   │
│  │ Insufficient staff coverage │   │
│  │ during this period.         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Suggestion:                        │
│  ┌─────────────────────────────┐   │
│  │ Please reschedule to        │   │
│  │ the following week.         │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Cancel ]  [ Confirm Rejection ]  │
└─────────────────────────────────────┘
   ↓
System Process:
├─ Update status → REJECTED
├─ DON'T deduct quota
├─ Send notification with reason
├─ Create audit log
└─ Send email with explanation
   ↓
❌ Leave Rejected!
```

---

## 📊 Leave Balance Management

### View Employee Leave Balance

```
┌──────────────────────────────────────────────────┐
│  📊 Leave Balance - All Employees                │
├──────────┬──────────┬──────┬──────────┬─────────┤
│ Employee │ Annual   │ Used │ Remaining│ Status  │
├──────────┼──────────┼──────┼──────────┼─────────┤
│ Budi     │ 12       │ 8    │ 4        │ 🟡 Low  │
│ Ani      │ 12       │ 3    │ 9        │ 🟢 Good │
│ Citra    │ 15       │ 2    │ 13       │ 🟢 Good │
│ Doni     │ 12       │ 12   │ 0        │ 🔴 Empty│
└──────────┴──────────┴──────┴──────────┴─────────┘
```

**Color Coding:**
- 🟢 Green: > 50% remaining
- 🟡 Yellow: 20-50% remaining
- 🔴 Red: < 20% or empty

---

### Adjust Leave Quota

**Use Cases:**
- New employee pro-rata
- Bonus leave days
- Carry over from previous year
- Correction/adjustment

**Adjustment Form:**
```
┌─────────────────────────────────────┐
│  ✏️ Adjust Leave Quota              │
├─────────────────────────────────────┤
│  Employee: Budi Santoso             │
│                                     │
│  Current Annual Quota: 12 days      │
│  Current Used:         8 days       │
│  Current Remaining:    4 days       │
│                                     │
│  Adjustment Type:                   │
│  (•) Add quota                      │
│  ( ) Deduct quota                   │
│                                     │
│  Amount: [3] days                   │
│                                     │
│  New Annual Quota: 15 days          │
│  Remaining:        7 days           │
│                                     │
│  Reason: *                          │
│  ┌─────────────────────────────┐   │
│  │ Bonus leave for excellent   │   │
│  │ performance in Q4 2025      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ☑ Notify employee                  │
│                                     │
│  [ Cancel ]      [ Save Changes ]  │
└─────────────────────────────────────┘
```

---

## 📅 Leave Calendar View

### Monthly Calendar

```
        January 2026
┌───┬───┬───┬───┬───┬───┬───┐
│ S │ M │ T │ W │ T │ F │ S │
├───┼───┼───┼───┼───┼───┼───┤
│   │   │   │ 1 │ 2 │ 3 │ 4 │
├───┼───┼───┼───┼───┼───┼───┤
│ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │
├───┼───┼───┼───┼───┼───┼───┤
│12 │13 │14 │🟡│🟡│🟡│18 │ ← Budi (15-17)
├───┼───┼───┼───┼───┼───┼───┤
│19 │🔵│🔵│22 │23 │24 │25 │ ← Ani (20-21)
├───┼───┼───┼───┼───┼───┼───┤
│26 │27 │28 │29 │30 │31 │   │
└───┴───┴───┴───┴───┴───┴───┘

Legend:
🟡 Annual Leave
🔵 Sick Leave
🟢 Permission
🔴 Holiday
```

**Features:**
- Hover untuk detail
- Click untuk filter employee
- Export to iCal
- Print calendar

---

## 📊 Leave Reports

### Report Types

**1. Leave Summary Report**
```
Period: January 2026

Total Leave Days:     45 days
By Type:
  - Annual Leave:     30 days (67%)
  - Sick Leave:       12 days (27%)
  - Permission:       3 days (6%)

By Department:
  - Engineering:      18 days
  - Sales:           15 days
  - HR:              7 days
  - Finance:         5 days

Top Leave Takers:
  1. Budi - 8 days
  2. Ani - 6 days
  3. Citra - 5 days
```

**2. Leave Balance Report**
```
Employees with Low Balance (<3 days):
  - Budi: 2 days remaining
  - Doni: 0 days remaining
  - Eko: 1 day remaining

Total Unused Leave: 450 days
At Risk of Expiring: 120 days
```

**3. Leave Approval Report**
```
Period: January 2026

Total Requests:      28
Approved:           24 (86%)
Rejected:           3 (11%)
Pending:            1 (3%)

Avg Approval Time:  8 hours
SLA Compliance:     95%
```

---

## 🔔 Notifications & Reminders

### Auto Notifications

**Pending Reminder (to Admin):**
```
Daily at 09:00 AM:

Subject: 📬 Pending Leave Approvals

You have 12 leave requests pending approval:
- 2 overdue (>24h)
- 5 urgent (<48h before start date)
- 5 normal

Please review and process.
```

**Leave Expiring Reminder:**
```
Monthly reminder:

Subject: ⚠️ Leave Quota Expiring Soon

The following employees have unused leave
that will expire on 31/12/2026:

- Budi: 4 days
- Ani: 9 days
- Citra: 13 days

Encourage them to use their leave.
```

---

## 📈 Analytics & Insights

### Leave Patterns

**Peak Leave Periods:**
```
Month        Requests    Avg Days
December     45          1800 days (Holiday season)
July         28          840 days (School vacation)
April        35          1050 days (Lebaran)
```

**Department Comparison:**
```
Department     Quota   Used   Remaining   Usage %
Engineering    540     243    297         45%
Sales          360     223    137         62% ⚠️
HR             180     68     112         38%
Finance        240     122    118         51%
```

**Insights:**
- 🔍 Sales department high usage → Review staffing
- 🔍 HR low usage → Encourage work-life balance
- 🔍 December spike → Plan coverage

---

## ⚡ Bulk Operations

### Bulk Approval

```
☑ Select All Pending (12 requests)

Bulk Actions:
├─ ✅ Approve Selected
├─ ❌ Reject Selected
└─ 📧 Send Reminder

Confirmation:
"Approve 12 leave requests?"
[ Cancel ] [ Approve All ]
```

**Use Case:** Process simple requests in batch

---

## 🔍 Advanced Filters

**Filter Options:**
- Status: Pending/Approved/Rejected
- Type: Annual/Sick/Permission
- Date Range
- Department
- Employee
- Days: <3, 3-7, >7
- Urgent: Yes/No

**Saved Filters:**
- "Urgent Pending"
- "Long Leave (>5 days)"
- "Sick Leave with Attachment"

---

## ✅ Best Practices

**Approval Guidelines:**
- ✅ Review within 24 hours (SLA)
- ✅ Check team impact before approve
- ✅ Verify attachment for sick leave
- ✅ Consider business needs
- ✅ Fair and consistent decisions
- ✅ Clear rejection reasons

**Quota Management:**
- ✅ Regular balance monitoring
- ✅ Encourage leave usage
- ✅ Plan for peak periods
- ✅ Prevent quota expiration
- ✅ Document all adjustments

**Communication:**
- ✅ Prompt notifications
- ✅ Clear rejection reasons
- ✅ Suggestions for alternatives
- ✅ Regular reminders

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
