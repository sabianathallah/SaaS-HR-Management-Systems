# 📬 Notification System

## 🎯 Overview

Sistem notifikasi terintegrasi yang mendukung **in-app** dan **email notifications** untuk semua aktivitas penting di HR Management System.

---

## ✨ Features

### **9 Notification Types**
1. ✅ **Leave Approved** - Saat admin approve cuti
2. ✅ **Leave Rejected** - Saat admin reject cuti
3. ✅ **Overtime Approved** - Saat admin approve lembur
4. ✅ **Overtime Rejected** - Saat admin reject lembur
5. ✅ **Attendance Correction** - Saat admin create/update attendance manual
6. ✅ **Work Schedule Change** - Saat admin ubah jam kerja
7. ✅ **Holiday Announcement** - Saat admin tambah hari libur
8. ✅ **Leave Quota Adjustment** - Saat admin adjust quota cuti
9. ⏰ **Clock-In Reminder** - Otomatis 10 menit sebelum jam kerja

### **2 Delivery Channels**
- 📱 **In-App Notification** - Tersimpan di database, akses via API
- 📧 **Email Notification** - Dikirim via SMTP (optional)

---

## 🚀 Quick Start

### 1. Email Configuration (Optional)

```bash
# Copy .env example
cp .env.example .env

# Edit .env and add SMTP credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

⚠️ **Note**: Jika tidak dikonfigurasi, email akan di-skip tapi in-app notification tetap bekerja.

### 2. API Endpoints

```bash
# Get my notifications
GET /notifications

# Get unread count
GET /notifications/unread-count

# Mark as read
PATCH /notifications/:id/read

# Mark all as read
PATCH /notifications/read-all

# Delete notification
DELETE /notifications/:id

# Clear all read notifications
DELETE /notifications/clear-read
```

---

## ⏰ Clock-In Reminder

System otomatis mengirim reminder **10 menit sebelum jam kerja dimulai**.

```
Work Start Time: 09:00
Reminder Sent At: 08:50 (automatic)
```

Cron job akan automatically adjust jika work schedule berubah.

---

## 📚 Documentation

- **Full Docs**: [`NOTIFICATION_SYSTEM.md`](./NOTIFICATION_SYSTEM.md)
- **Quick Start**: [`NOTIFICATION_QUICK_START.md`](./NOTIFICATION_QUICK_START.md)
- **Summary**: [`NOTIFICATION_IMPLEMENTATION_SUMMARY.md`](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)

---

## 🧪 Example Usage

### Frontend Integration

```javascript
// Get notifications
const response = await fetch('/notifications?isRead=false', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data, meta } = await response.json();

// Display unread count in badge
const unreadCount = meta.unreadCount;

// Mark as read when user clicks
await fetch(`/notifications/${id}/read`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}` }
});
```

### Backend - Send Custom Notification

```javascript
const notificationHelper = require('./helpers/notificationHelper');
const { Notification } = require('./models');

// Send to single user
await notificationHelper.sendNotification(
  userId,
  Notification.NOTIFICATION_TYPE.LEAVE_APPROVED,
  '✅ Leave Approved',
  'Your leave request has been approved.',
  { leaveRequestId: 1 },
  true // Send email
);

// Send to all employees
await notificationHelper.sendToAllEmployees(
  Notification.NOTIFICATION_TYPE.HOLIDAY_ANNOUNCEMENT,
  '🎉 Holiday Announcement',
  'New holiday: Independence Day',
  { holidayId: 1 },
  true
);
```

---

## 🔔 Automatic Triggers

Notifications are automatically sent when:

| Action | Notification Type | Recipient |
|--------|------------------|-----------|
| Admin approves leave | LEAVE_APPROVED | Employee |
| Admin rejects leave | LEAVE_REJECTED | Employee |
| Admin approves overtime | OVERTIME_APPROVED | Employee |
| Admin rejects overtime | OVERTIME_REJECTED | Employee |
| Admin creates/updates attendance | ATTENDANCE_CORRECTION | Employee |
| Admin updates work schedule | WORK_SCHEDULE_CHANGE | All Users |
| Admin adds holiday | HOLIDAY_ANNOUNCEMENT | All Users |
| Admin adjusts quota | LEAVE_QUOTA_ADJUSTMENT | Employee |
| Cron job (10 min before work) | CLOCK_IN_REMINDER | All Employees |

---

## 🎨 UI Mockup

```
┌──────────────────────────────────────┐
│  🔔 Notifications (3 unread)    [x]  │
├──────────────────────────────────────┤
│ 🔵 ✅ Leave Request Approved          │
│    Your annual leave has been...     │
│    2 hours ago                  [√]  │
├──────────────────────────────────────┤
│ 🔵 ⏰ Clock-In Reminder               │
│    Work starts in 10 minutes!        │
│    5 min ago                    [√]  │
├──────────────────────────────────────┤
│ ⚪ 📝 Attendance Updated               │
│    Your attendance record for...     │
│    1 day ago                    [√]  │
└──────────────────────────────────────┘
```

---

## ✅ Status

- ✅ Database & Models
- ✅ Email Integration (Nodemailer)
- ✅ In-App Notification Helper
- ✅ Cron Job Scheduler
- ✅ API Endpoints
- ✅ Integration with all features
- ✅ Documentation

**Status**: Production Ready 🚀

---

## 🔧 Configuration

### SMTP Providers

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password!
```

**Outlook:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Custom SMTP:**
```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

---

## 📊 Benefits

✅ **Real-time Updates** - Users instantly know about status changes  
✅ **No Manual Checks** - Automatic notifications reduce manual work  
✅ **Better UX** - Users stay informed without refreshing  
✅ **Email Backup** - Important notifications also sent via email  
✅ **Automated Reminders** - Clock-in reminder prevents late attendance  
✅ **Audit Trail** - All notifications logged in database  

---

**Created**: January 6, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete & Production Ready
