# 🚀 Notification System - Quick Start Guide

## ⚡ **5-Minute Setup**

### **1. Install Dependencies** ✅ Already Done

```bash
npm install nodemailer
```

### **2. Run Migration** ✅ Already Done

```bash
npx sequelize-cli db:migrate
```

### **3. Configure Email (Optional)**

Create `.env` file in `/server` directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

**⚠️ Important**: If you skip this step, email notifications will be disabled but **in-app notifications will still work**.

---

## 🎯 **Quick Test**

### **Test 1: Check Notifications API**

```bash
# Get user notifications
curl -X GET "http://localhost:3000/notifications" \
  -H "Authorization: Bearer <your-token>"
```

### **Test 2: Trigger Notification**

```bash
# Admin approve a leave request (will send notification to employee)
curl -X PUT "http://localhost:3000/leave-requests/admin/1/approve" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"approvalNote": "Approved!"}'

# Employee check their notifications
curl -X GET "http://localhost:3000/notifications?isRead=false" \
  -H "Authorization: Bearer <employee-token>"
```

---

## 📬 **What's Included**

✅ **7 Notification Types**:
1. Leave Approved/Rejected
2. Overtime Approved/Rejected
3. Attendance Correction
4. Work Schedule Change
5. Holiday Announcement
6. Leave Quota Adjustment
7. **Clock-In Reminder** (automated, 10 min before work)

✅ **2 Delivery Channels**:
- In-App (always works)
- Email (optional, requires SMTP)

✅ **Full REST API**:
- GET notifications
- Mark as read
- Delete notifications
- Unread count

---

## ⏰ **Clock-In Reminder**

### **How It Works**

```
1. System reads workStartTime from database (e.g., 09:00)
2. Calculates reminder time: 09:00 - 10 min = 08:50
3. Cron job automatically runs at 08:50 daily
4. Sends reminder to all active employees
```

### **Customize Work Start Time**

```bash
curl -X PUT "http://localhost:3000/attendances/admin/work-schedule" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workStartTime": "08:30",
    "workEndTime": "17:00"
  }'

# Reminder will now be sent at 08:20 (10 min before 08:30)
```

---

## 📱 **Frontend Integration Example**

### **Get Unread Count (Badge)**

```javascript
// GET /notifications/unread-count
const response = await fetch('/notifications/unread-count', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data } = await response.json();
console.log(data.unreadCount); // Display in badge
```

### **Get Notifications**

```javascript
// GET /notifications
const response = await fetch('/notifications?limit=10', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data, meta } = await response.json();
// data: array of notifications
// meta.unreadCount: total unread
```

### **Mark as Read**

```javascript
// PATCH /notifications/:id/read
await fetch(`/notifications/${notificationId}/read`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🎨 **Notification UI Mockup**

```
┌─────────────────────────────────────────┐
│  Notifications (3 unread)          [x]  │
├─────────────────────────────────────────┤
│ 🔵 ✅ Leave Request Approved             │
│    Your annual leave request from...    │
│    2 hours ago                     [√]  │
├─────────────────────────────────────────┤
│ 🔵 ⏰ Clock-In Reminder                  │
│    Don't forget to clock in! Your...    │
│    5 min ago                       [√]  │
├─────────────────────────────────────────┤
│ ⚪ 📝 Attendance Record Updated          │
│    Your attendance record for...        │
│    1 day ago                       [√]  │
└─────────────────────────────────────────┘
```

---

## 🐛 **Common Issues**

### **Issue: Email not sending**

✅ **Solution**: 
- Check SMTP credentials in `.env`
- For Gmail: Use App Password, not regular password
- In-app notifications still work even if email fails

### **Issue: Clock-in reminder not triggering**

✅ **Solution**:
- Check work schedule exists in database
- Server must be running at reminder time
- Check server logs for cron job execution

### **Issue: 403 Forbidden when accessing notifications**

✅ **Solution**:
- Ensure user is authenticated
- Users can only access their own notifications

---

## 📚 **Next Steps**

1. Read full documentation: `docs (md)/NOTIFICATION_SYSTEM.md`
2. Test all notification types
3. Configure SMTP for email delivery
4. Customize notification templates (in `helpers/emailNotification.js`)
5. Build frontend notification UI

---

## 🎉 **You're Ready!**

Notification system is now fully integrated and working. All leave requests, overtime requests, and attendance corrections will automatically send notifications to users.

**Need help?** Check the full documentation or logs for detailed error messages.

---

**Happy Coding! 🚀**
