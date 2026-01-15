# 🔔 SISTEM NOTIFIKASI - ADMIN

> Manage notifications, broadcasts, templates, dan notification settings

---

## 🎯 Overview

Admin dapat:
- 📢 Send broadcast messages
- 📧 Email notifications
- 🔔 In-app notifications
- 📝 Notification templates
- ⚙️ Configure notification rules
- 📊 Notification analytics

---

## 📢 Broadcast Messages

### Send Broadcast

```
┌─────────────────────────────────────────┐
│  📢 Send Broadcast Message              │
├─────────────────────────────────────────┤
│  Recipients: *                          │
│  (•) All Employees (250)                │
│  ( ) Specific Department:               │
│      ☐ Engineering (45)                 │
│      ☐ Sales (30)                       │
│      ☐ HR (8)                           │
│      ☐ Finance (12)                     │
│  ( ) Custom Selection                   │
│                                         │
│  Channels:                              │
│  ☑ In-App Notification                  │
│  ☑ Email                                │
│  ☐ SMS (Premium)                        │
│  ☐ Push Notification (Mobile App)       │
│                                         │
│  Priority:                              │
│  ( ) 🟢 Low (No urgency)                │
│  (•) 🟡 Normal (Standard)               │
│  ( ) 🔴 High (Urgent - Red banner)      │
│  ( ) 🚨 Critical (Alert sound)          │
│                                         │
│  Subject: *                             │
│  [Company Holiday Announcement]         │
│                                         │
│  Message: *                             │
│  ┌─────────────────────────────────┐   │
│  │ Dear Team,                      │   │
│  │                                 │   │
│  │ This is to inform that office   │   │
│  │ will be closed on 31 Mar - 1   │   │
│  │ Apr for Eid al-Fitr.            │   │
│  │                                 │   │
│  │ Happy holidays!                 │   │
│  │                                 │   │
│  │ HR Team                         │   │
│  └─────────────────────────────────┘   │
│  550/1000 characters                    │
│                                         │
│  Scheduling:                            │
│  (•) Send Now                           │
│  ( ) Schedule:                          │
│      Date: [____] Time: [____]          │
│                                         │
│  ☑ Save as draft                        │
│  ☑ Track read status                    │
│                                         │
│  [ Cancel ]       [ 📢 Send Broadcast ] │
└─────────────────────────────────────────┘
```

---

## 📧 Notification Types

### System Notifications

**Auto-Generated Notifications:**

```
┌────────────────────────────────────────────────────────┐
│  🔔 System Notifications                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ATTENDANCE                                            │
│  ├─ ⏰ Late arrival notification                       │
│  ├─ ❌ Absent notification                             │
│  ├─ 📸 Missing attendance photo                        │
│  ├─ 📍 GPS validation failed                           │
│  └─ ✅ Attendance approved                             │
│                                                        │
│  LEAVE REQUESTS                                        │
│  ├─ 📬 New leave request (to admin)                    │
│  ├─ ✅ Leave approved                                  │
│  ├─ ❌ Leave rejected                                  │
│  ├─ ⚠️ Leave balance low (<3 days)                    │
│  └─ 📅 Leave expiring soon                             │
│                                                        │
│  OVERTIME                                              │
│  ├─ 📬 New overtime request (to admin)                 │
│  ├─ ✅ Overtime approved                               │
│  ├─ ❌ Overtime rejected                               │
│  └─ ⚠️ Budget limit warning                           │
│                                                        │
│  PROFILE & ACCOUNT                                     │
│  ├─ 🎉 Welcome new employee                            │
│  ├─ 🔑 Password changed                                │
│  ├─ 👤 Profile updated                                 │
│  └─ 🎂 Birthday reminder                               │
│                                                        │
│  SHIFTS                                                │
│  ├─ 📅 Shift assigned                                  │
│  ├─ 🔄 Shift swap request                              │
│  ├─ ✅ Shift swap approved                             │
│  └─ ⚠️ Shift coverage alert (to admin)                │
│                                                        │
│  REMINDERS                                             │
│  ├─ 📋 Pending approvals (to admin)                    │
│  ├─ ⏰ Clock-out reminder (17:00)                      │
│  ├─ 📊 Weekly report ready                             │
│  └─ 🎯 Monthly performance review                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📝 Notification Templates

### Template Management

```
┌────────────────────────────────────────────────────────┐
│  📝 Notification Templates                             │
├────┬───────────────────┬──────────┬────────┬──────────┤
│ ID │ Template Name     │ Type     │ Status │ Action   │
├────┼───────────────────┼──────────┼────────┼──────────┤
│ 1  │ Leave Approved    │ Email    │ Active │ Edit     │
│ 2  │ OT Rejected       │ In-App   │ Active │ Edit     │
│ 3  │ Late Arrival      │ Email    │ Active │ Edit     │
│ 4  │ Welcome Email     │ Email    │ Active │ Edit     │
│ 5  │ Birthday Wish     │ In-App   │ Active │ Edit     │
└────┴───────────────────┴──────────┴────────┴──────────┘

[ + Create New Template ]
```

### Edit Template

```
┌─────────────────────────────────────────┐
│  ✏️ Edit Template: Leave Approved       │
├─────────────────────────────────────────┤
│  Template Name: *                       │
│  [Leave Request Approved]               │
│                                         │
│  Type: [Email ▼]                        │
│                                         │
│  Subject: *                             │
│  [✅ Your {{leaveType}} Request Approved]│
│                                         │
│  Email Body:                            │
│  ┌─────────────────────────────────┐   │
│  │ Hi {{employeeName}},            │   │
│  │                                 │   │
│  │ Your {{leaveType}} request has  │   │
│  │ been APPROVED.                  │   │
│  │                                 │   │
│  │ Details:                        │   │
│  │ - Leave Type: {{leaveType}}     │   │
│  │ - Start Date: {{startDate}}     │   │
│  │ - End Date: {{endDate}}         │   │
│  │ - Duration: {{duration}} days   │   │
│  │                                 │   │
│  │ Your remaining leave balance:   │   │
│  │ {{remainingQuota}} days         │   │
│  │                                 │   │
│  │ Have a great time off!          │   │
│  │                                 │   │
│  │ Best regards,                   │   │
│  │ HR Team                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Available Variables:                   │
│  {{employeeName}}  {{leaveType}}        │
│  {{startDate}}     {{endDate}}          │
│  {{duration}}      {{remainingQuota}}   │
│  {{approvedBy}}    {{approvedDate}}     │
│  {{notes}}         {{companyName}}      │
│                                         │
│  Preview:                               │
│  [ 👁️ Preview Template ]                │
│                                         │
│  Status:                                │
│  (•) Active                             │
│  ( ) Inactive                           │
│                                         │
│  [ Cancel ]          [ Save Template ]  │
└─────────────────────────────────────────┘
```

**Preview Output:**
```
──────────────────────────────────────
Subject: ✅ Your Annual Leave Request Approved

Hi Budi Santoso,

Your Annual Leave request has been APPROVED.

Details:
- Leave Type: Annual Leave
- Start Date: 01 Feb 2026
- End Date: 03 Feb 2026
- Duration: 3 days

Your remaining leave balance: 6 days

Have a great time off!

Best regards,
HR Team
──────────────────────────────────────
```

---

## ⚙️ Notification Settings

### Global Configuration

```
┌─────────────────────────────────────────┐
│  ⚙️ Notification Settings               │
├─────────────────────────────────────────┤
│  Default Channels:                      │
│  ☑ In-App Notifications                 │
│  ☑ Email Notifications                  │
│  ☐ SMS Notifications (Premium)          │
│  ☐ Push Notifications (Mobile)          │
│                                         │
│  Email Settings:                        │
│  SMTP Server: [smtp.gmail.com]          │
│  Port:        [587]                     │
│  From Email:  [noreply@company.com]     │
│  From Name:   [Salmon HRIS]             │
│                                         │
│  Notification Timing:                   │
│  Working Hours: [09:00] - [17:00]       │
│  ☑ Quiet hours (no notifications):      │
│     [22:00] - [07:00]                   │
│  ☐ Weekend notifications                │
│                                         │
│  Notification Rules:                    │
│  ┌─────────────────────────────────┐   │
│  │ Event           Channel Priority│   │
│  ├─────────────────────────────────┤   │
│  │ Leave Request   Email   High    │   │
│  │ Attendance      In-App  Normal  │   │
│  │ Overtime        Email   Normal  │   │
│  │ Birthday        In-App  Low     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Rate Limiting:                         │
│  Max emails/user/day:  [10]             │
│  Max in-app/user/day:  [50]             │
│  Batch digest:         [✅ Enabled]     │
│    Send digest at:     [08:00 daily]    │
│                                         │
│  Retention:                             │
│  In-App: [30] days                      │
│  Email:  Keep forever                   │
│                                         │
│  [ Save Settings ]                      │
└─────────────────────────────────────────┘
```

---

## 🔔 In-App Notification Center

### Admin View

```
┌────────────────────────────────────────────────────────┐
│  🔔 Notification Center                                │
├────────────────────────────────────────────────────────┤
│  [ All ] [ Unread (12) ] [ Sent ] [ Scheduled ]       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔴 HIGH PRIORITY                                      │
│  ┌────────────────────────────────────────────────┐   │
│  │ ⚠️ Budget Alert: Engineering OT at 80%         │   │
│  │ 2 hours ago • System                           │   │
│  │ [View Details]                                 │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  🟡 NORMAL                                             │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📬 New Leave Request from Budi                 │   │
│  │ 3 hours ago • Leave Management                 │   │
│  │ [Review] [Mark as Read]                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📬 New Overtime Request from Ani               │   │
│  │ 5 hours ago • Overtime Management              │   │
│  │ [Review] [Mark as Read]                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  🟢 LOW                                                │
│  ┌────────────────────────────────────────────────┐   │
│  │ 🎂 Birthday: Citra (tomorrow)                  │   │
│  │ 1 day ago • Reminder                           │   │
│  │ [Send Wishes] [Dismiss]                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ✅ READ                                               │
│  ┌────────────────────────────────────────────────┐   │
│  │ ✅ Leave approved for Doni                     │   │
│  │ 2 days ago • Leave Management                  │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘

[ Mark All as Read ] [ Clear All ] [ ⚙️ Settings ]
```

---

## 📊 Notification Analytics

### Delivery Stats

```
┌─────────────────────────────────────────┐
│  📊 Notification Analytics              │
│  Period: Last 30 Days                   │
├─────────────────────────────────────────┤
│  Total Sent:        3,450               │
│  Delivered:         3,380 (98%)         │
│  Failed:            70 (2%)             │
│  Read Rate:         78%                 │
│  Avg Read Time:     2.5 hours           │
│                                         │
│  By Channel:                            │
│  ┌─────────────┬──────┬─────────┐       │
│  │ Channel     │ Sent │ Read %  │       │
│  ├─────────────┼──────┼─────────┤       │
│  │ In-App      │ 2100 │ 85%     │       │
│  │ Email       │ 1200 │ 68%     │       │
│  │ SMS         │ 150  │ 92%     │       │
│  └─────────────┴──────┴─────────┘       │
│                                         │
│  By Type:                               │
│  Leave Requests:    450 (13%)           │
│  Attendance:        1200 (35%)          │
│  Overtime:          300 (9%)            │
│  System Alerts:     150 (4%)            │
│  Reminders:         800 (23%)           │
│  Broadcasts:        550 (16%)           │
│                                         │
│  Top Notification Times:                │
│  🕐 09:00 - 1200 sent (peak)            │
│  🕐 18:00 - 800 sent                    │
│  🕐 08:00 - 600 sent                    │
│                                         │
│  Failed Deliveries:                     │
│  ├─ Invalid email: 45                   │
│  ├─ SMTP error: 15                      │
│  ├─ User blocked: 5                     │
│  └─ Other: 5                            │
│                                         │
│  [📊 View Full Report] [📥 Export]      │
└─────────────────────────────────────────┘
```

---

## 📅 Scheduled Notifications

### Auto-Reminders

```
┌─────────────────────────────────────────┐
│  📅 Scheduled Notifications             │
├─────────────────────────────────────────┤
│  Active Schedules:                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⏰ Daily Clock-Out Reminder     │   │
│  │ Time: 16:45 daily               │   │
│  │ To: All active employees        │   │
│  │ Message: "Don't forget to       │   │
│  │          clock out!"            │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📋 Weekly Pending Approvals     │   │
│  │ Time: Mon 09:00                 │   │
│  │ To: All admins                  │   │
│  │ Message: "You have X pending    │   │
│  │          approvals"             │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎂 Birthday Notifications       │   │
│  │ Time: 08:00 on birthday         │   │
│  │ To: Employee + team             │   │
│  │ Message: "Happy Birthday!"      │   │
│  │ Status: ✅ Active               │   │
│  │ [Edit] [Pause] [Delete]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ + Add New Schedule ]                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Smart Notifications

### AI-Powered Alerts

```
┌─────────────────────────────────────────┐
│  🤖 Smart Notification Rules            │
├─────────────────────────────────────────┤
│  Pattern Detection:                     │
│                                         │
│  ☑ Burnout Risk Detection               │
│    Alert if: >20h overtime/month        │
│    Action: Notify admin + employee      │
│                                         │
│  ☑ Attendance Pattern Alert             │
│    Alert if: 3 consecutive late         │
│    Action: Notify manager               │
│                                         │
│  ☑ Leave Balance Warning                │
│    Alert if: <3 days remaining          │
│    Action: Encourage to take leave      │
│                                         │
│  ☑ Budget Threshold Alert               │
│    Alert if: >80% budget used           │
│    Action: Notify finance + admin       │
│                                         │
│  ☑ Shift Coverage Alert                 │
│    Alert if: <90% coverage              │
│    Action: Notify HR to fill gaps       │
│                                         │
│  ☑ Performance Review Reminder          │
│    Alert if: Review overdue >7 days     │
│    Action: Notify manager               │
│                                         │
│  [ Save Rules ]                         │
└─────────────────────────────────────────┘
```

---

## 📱 User Notification Preferences

### Employee Settings (Admin Can View)

```
┌─────────────────────────────────────────┐
│  🔔 Employee: Budi Santoso              │
│  Notification Preferences               │
├─────────────────────────────────────────┤
│  Channels:                              │
│  ☑ In-App                               │
│  ☑ Email (budi@company.com)             │
│  ☐ SMS (not configured)                 │
│                                         │
│  Notification Types:                    │
│  ┌─────────────────────────┬────┬───┐  │
│  │ Type                    │App │Eml│  │
│  ├─────────────────────────┼────┼───┤  │
│  │ Leave Approval          │ ☑  │ ☑ │  │
│  │ Overtime Approval       │ ☑  │ ☑ │  │
│  │ Attendance Alerts       │ ☑  │ ☐ │  │
│  │ Shift Changes           │ ☑  │ ☑ │  │
│  │ Broadcasts              │ ☑  │ ☑ │  │
│  │ Birthday/Events         │ ☑  │ ☐ │  │
│  │ System Updates          │ ☑  │ ☐ │  │
│  └─────────────────────────┴────┴───┘  │
│                                         │
│  Quiet Hours:                           │
│  ☑ Enabled                              │
│  From: [22:00] To: [07:00]              │
│                                         │
│  Digest Mode:                           │
│  ☐ Daily digest (08:00)                 │
│  ☐ Weekly digest (Mon 09:00)            │
│                                         │
│  Last Updated: 10/01/2026               │
│  [ View Activity Log ]                  │
└─────────────────────────────────────────┘
```

---

## 🔍 Notification Logs

### Audit Trail

```
┌────────────────────────────────────────────────────────┐
│  🔍 Notification Logs                                  │
├────┬──────────┬─────────┬─────────┬────────┬──────────┤
│ ID │ DateTime │ To      │ Type    │ Status │ Channel  │
├────┼──────────┼─────────┼─────────┼────────┼──────────┤
│ 123│ 15/01 10│ Budi    │ Leave   │ ✅ Read│ Email    │
│ 122│ 15/01 09│ All     │ Brdcast │ ✅ Sent│ In-App   │
│ 121│ 14/01 18│ Ani     │ OT Appr │ ✅ Read│ Email    │
│ 120│ 14/01 17│ Citra   │ Shift   │ ❌ Fail│ Email    │
│ 119│ 14/01 16│ Doni    │ Attend  │ ⏳ Pend│ In-App   │
└────┴──────────┴─────────┴─────────┴────────┴──────────┘

Filter:
Date: [____] - [____]
Status: [All ▼]
Type: [All ▼]
User: [All ▼]

[ Search ] [ Export ] [ Clear Filters ]
```

---

## ✅ Best Practices

**Content:**
- ✅ Clear and concise messages
- ✅ Actionable information
- ✅ Appropriate urgency level
- ✅ Professional tone
- ✅ Consistent formatting

**Timing:**
- ✅ Send during work hours
- ✅ Respect quiet hours
- ✅ Avoid notification spam
- ✅ Batch similar notifications
- ✅ Consider time zones

**Channels:**
- ✅ Use appropriate channel
- ✅ Critical → Email + In-App
- ✅ Routine → In-App only
- ✅ Urgent → All channels
- ✅ Respect user preferences

**Templates:**
- ✅ Professional design
- ✅ Mobile-friendly
- ✅ Clear call-to-action
- ✅ Personalization variables
- ✅ Brand consistency

**Analytics:**
- ✅ Track delivery rates
- ✅ Monitor read rates
- ✅ Analyze response time
- ✅ Optimize based on data
- ✅ A/B testing

---

## 🚨 Emergency Broadcasts

### Critical Announcements

```
┌─────────────────────────────────────────┐
│  🚨 EMERGENCY BROADCAST                 │
├─────────────────────────────────────────┤
│  Use only for critical situations:      │
│  • Natural disasters                    │
│  • Security threats                     │
│  • Office evacuations                   │
│  • System outages                       │
│  • Health emergencies                   │
│                                         │
│  Channels:                              │
│  ☑ In-App (Push notification)           │
│  ☑ Email                                │
│  ☑ SMS (All employees)                  │
│  ☑ Desktop alert                        │
│                                         │
│  Message: *                             │
│  ┌─────────────────────────────────┐   │
│  │ EMERGENCY: Office evacuation    │   │
│  │ due to fire alarm.              │   │
│  │                                 │   │
│  │ Please exit immediately via     │   │
│  │ nearest emergency exit.         │   │
│  │                                 │   │
│  │ Assembly point: Parking Lot A   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ This will override all settings     │
│     including quiet hours               │
│                                         │
│  Confirmation Required:                 │
│  Type "CONFIRM" to send: [_______]      │
│                                         │
│  [ Cancel ]    [ 🚨 SEND EMERGENCY ]    │
└─────────────────────────────────────────┘
```

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
