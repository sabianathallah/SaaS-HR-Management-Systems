# 📬 Notification System Documentation

## 📋 **Overview**

Sistem notifikasi yang terintegrasi dengan fitur-fitur utama HR Management System. Mendukung **2 channel**:
1. **In-App Notification** - Tersimpan di database, bisa diakses via API
2. **Email Notification** - Dikirim via SMTP (optional)

---

## 🎯 **Notification Types**

System mendukung **7 tipe notifikasi**:

| Type | Trigger | Recipient | Email Support |
|------|---------|-----------|---------------|
| `LEAVE_APPROVED` | Admin approve leave request | Employee | ✅ |
| `LEAVE_REJECTED` | Admin reject leave request | Employee | ✅ |
| `OVERTIME_APPROVED` | Admin approve overtime request | Employee | ✅ |
| `OVERTIME_REJECTED` | Admin reject overtime request | Employee | ✅ |
| `ATTENDANCE_CORRECTION` | Admin create/update manual attendance | Employee | ✅ |
| `WORK_SCHEDULE_CHANGE` | Admin update work schedule | All Users | ✅ |
| `HOLIDAY_ANNOUNCEMENT` | Admin add new holiday | All Users | ✅ |
| `LEAVE_QUOTA_ADJUSTMENT` | Admin adjust employee quota | Employee | ✅ |
| `CLOCK_IN_REMINDER` | Cron job (10 min before work) | All Employees | ✅ |

---

## 🗄️ **Database Schema**

### **Tabel: Notifications**

```sql
CREATE TABLE Notifications (
  id SERIAL PRIMARY KEY,
  UserId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  type ENUM(...) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE NOT NULL,
  metadata JSON,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

### **Model Relations**

```javascript
Notification.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
```

---

## 📧 **Email Configuration**

### **Setup SMTP (Optional)**

Email notifications bersifat **optional**. Jika tidak dikonfigurasi, hanya in-app notification yang akan berfungsi.

#### **1. Create `.env` file**

```bash
cd server
cp .env.example .env
```

#### **2. Configure SMTP Settings**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### **Gmail Setup**

1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password as `SMTP_PASS`

#### **Other Providers**

- **Outlook**: `smtp.office365.com` (port 587)
- **Yahoo**: `smtp.mail.yahoo.com` (port 587)
- **SendGrid, Mailgun**: Follow provider docs

---

## ⏰ **Clock-In Reminder Scheduler**

System otomatis mengirim reminder **10 menit sebelum jam kerja dimulai**.

### **How It Works**

```
Work Start Time: 09:00
Reminder Sent: 08:50 (automatically calculated)
```

### **Configuration**

Reminder time dihitung otomatis berdasarkan `workStartTime` di `WorkSchedule`:

```javascript
// Contoh: workStartTime = "09:00"
// Reminder akan dikirim pukul 08:50
```

### **Cron Job Setup**

Sudah otomatis setup di `server/scheduler/cronJobs.js`:

```javascript
const reminderTime = workStartTime - 10 minutes;
cron.schedule(reminderCronExpression, sendClockInReminders);
```

---

## 🔌 **API Endpoints**

Base URL: `/api/notifications`

### **1. Get My Notifications**

```http
GET /notifications
Authorization: Bearer <token>
Query Parameters:
  - isRead: boolean (optional)
  - type: string (optional)
  - limit: number (default: 50)
  - offset: number (default: 0)

Response:
{
  "message": "My notifications",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "type": "LEAVE_APPROVED",
      "title": "✅ Leave Request Approved",
      "message": "Your annual leave request from 2026-01-10 to 2026-01-12 has been approved.",
      "isRead": false,
      "metadata": {
        "leaveRequestId": 1,
        "leaveType": "ANNUAL_LEAVE",
        "startDate": "2026-01-10",
        "endDate": "2026-01-12"
      },
      "createdAt": "2026-01-06T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "unreadCount": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### **2. Get Unread Count**

```http
GET /notifications/unread-count
Authorization: Bearer <token>

Response:
{
  "message": "Unread notification count",
  "data": {
    "unreadCount": 3
  }
}
```

### **3. Mark as Read**

```http
PATCH /notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "isRead": true,
    ...
  }
}
```

### **4. Mark All as Read**

```http
PATCH /notifications/read-all
Authorization: Bearer <token>

Response:
{
  "message": "5 notification(s) marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

### **5. Delete Notification**

```http
DELETE /notifications/:id
Authorization: Bearer <token>

Response:
{
  "message": "Notification deleted successfully"
}
```

### **6. Clear All Read Notifications**

```http
DELETE /notifications/clear-read
Authorization: Bearer <token>

Response:
{
  "message": "3 read notification(s) cleared",
  "data": {
    "deletedCount": 3
  }
}
```

---

## 💻 **Usage Examples**

### **1. Get Unread Notifications Only**

```bash
curl -X GET "http://localhost:3000/notifications?isRead=false" \
  -H "Authorization: Bearer <employee-token>"
```

### **2. Get Specific Type Notifications**

```bash
curl -X GET "http://localhost:3000/notifications?type=LEAVE_APPROVED" \
  -H "Authorization: Bearer <employee-token>"
```

### **3. Pagination**

```bash
curl -X GET "http://localhost:3000/notifications?limit=10&offset=0" \
  -H "Authorization: Bearer <employee-token>"
```

### **4. Mark All as Read**

```bash
curl -X PATCH "http://localhost:3000/notifications/read-all" \
  -H "Authorization: Bearer <employee-token>"
```

---

## 🔔 **Automatic Notifications**

### **Triggered Automatically**

Notifikasi otomatis dikirim saat:

1. **Leave Request**
   - Admin approve → Employee dapat notif `LEAVE_APPROVED`
   - Admin reject → Employee dapat notif `LEAVE_REJECTED`

2. **Overtime Request**
   - Admin approve → Employee dapat notif `OVERTIME_APPROVED`
   - Admin reject → Employee dapat notif `OVERTIME_REJECTED`

3. **Attendance Correction**
   - Admin create manual attendance → Employee dapat notif
   - Admin update attendance → Employee dapat notif

4. **Work Schedule Change**
   - Admin update work schedule → **All users** dapat notif

5. **Holiday Announcement**
   - Admin add holiday → **All users** dapat notif

6. **Leave Quota Adjustment**
   - Admin adjust quota → Employee dapat notif

7. **Clock-In Reminder**
   - Cron job (08:50 daily) → **All employees** dapat reminder

---

## 🧪 **Testing**

### **1. Test Leave Approval Notification**

```bash
# 1. Employee submit leave request
curl -X POST http://localhost:3000/leave-requests \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "ANNUAL_LEAVE",
    "startDate": "2026-01-15",
    "endDate": "2026-01-17",
    "reason": "Family vacation"
  }'

# 2. Admin approve
curl -X PUT http://localhost:3000/leave-requests/admin/1/approve \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNote": "Approved. Enjoy!"
  }'

# 3. Employee check notifications
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer <employee-token>"
```

### **2. Test Clock-In Reminder (Manual Trigger)**

```javascript
// In Node.js console or create test endpoint
const { sendClockInReminders } = require('./scheduler/cronJobs');
await sendClockInReminders();
```

### **3. Test Work Schedule Change Notification**

```bash
curl -X PUT http://localhost:3000/attendances/admin/work-schedule \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workStartTime": "08:30",
    "workEndTime": "17:30"
  }'

# All users will receive notification
```

---

## 🛠️ **Helper Functions**

### **Send Notification to Single User**

```javascript
const notificationHelper = require('./helpers/notificationHelper');
const { Notification } = require('./models');

await notificationHelper.sendNotification(
  userId,
  Notification.NOTIFICATION_TYPE.LEAVE_APPROVED,
  '✅ Leave Approved',
  'Your leave request has been approved.',
  { leaveRequestId: 1 },
  true // Send email
);
```

### **Send to All Employees**

```javascript
await notificationHelper.sendToAllEmployees(
  Notification.NOTIFICATION_TYPE.HOLIDAY_ANNOUNCEMENT,
  '🎉 Holiday Announcement',
  'New holiday: Independence Day on 2026-08-17',
  { holidayId: 1 },
  true
);
```

### **Send to All Users (Including Admins)**

```javascript
await notificationHelper.sendToAllUsers(
  Notification.NOTIFICATION_TYPE.WORK_SCHEDULE_CHANGE,
  '📅 Work Schedule Updated',
  'Work hours changed to 08:30 - 17:30',
  { workStartTime: '08:30', workEndTime: '17:30' },
  true
);
```

---

## 🚀 **Deployment Checklist**

- [ ] Configure SMTP settings in production `.env`
- [ ] Test email delivery
- [ ] Verify cron job runs correctly (check server logs at 08:50 daily)
- [ ] Test all notification types
- [ ] Configure email rate limiting (if needed)
- [ ] Setup email error monitoring

---

## 🔍 **Troubleshooting**

### **Email Not Sending**

1. Check SMTP configuration in `.env`
2. Check console logs for error messages
3. Verify SMTP credentials (try Gmail App Password)
4. In-app notifications still work even if email fails

### **Clock-In Reminder Not Sending**

1. Check work schedule in database
2. Verify cron job is running (check server logs)
3. Test manually: `await sendClockInReminders()`

### **Notifications Not Appearing**

1. Check notification table in database
2. Verify user authentication token
3. Check API endpoint `/notifications`

---

## 📊 **Performance Considerations**

- **Bulk Notifications**: Use `sendBulkNotification` for multiple users
- **Email Queue**: Consider adding job queue (Bull, Bee-Queue) for large-scale deployments
- **Database Cleanup**: Periodically delete old read notifications
- **Rate Limiting**: Implement email rate limiting to avoid SMTP blocks

---

## ✅ **Feature Checklist**

- [x] In-app notification system
- [x] Email notification system
- [x] Leave request notifications
- [x] Overtime request notifications
- [x] Attendance correction notifications
- [x] Work schedule change notifications
- [x] Holiday announcement notifications
- [x] Leave quota adjustment notifications
- [x] Clock-in reminder (scheduled)
- [x] Mark as read functionality
- [x] Delete notifications
- [x] Unread count
- [x] API endpoints
- [x] Documentation

---

## 🎓 **Best Practices**

1. **Email Fallback**: System degrades gracefully if SMTP fails
2. **User Ownership**: Only users can access their own notifications
3. **Metadata**: Store additional context in `metadata` field
4. **Soft Delete**: Consider keeping notifications for audit trail
5. **Notification Preferences**: Future: Allow users to configure notification preferences

---

## 📝 **Future Enhancements**

1. Push notifications (FCM/APNS)
2. SMS notifications
3. Notification preferences per user
4. Notification templates (customizable)
5. Notification history/archive
6. Real-time notifications (WebSocket/Socket.io)
7. Notification grouping/threading
8. Digest emails (daily/weekly summary)

---

**Created**: January 6, 2026  
**Version**: 1.0.0  
**Author**: HR Management System Team
