# 🔔 SISTEM NOTIFIKASI - EMPLOYEE

> Panduan lengkap sistem notifikasi Salmon HRIS

---

## 🎯 Overview

Sistem Notifikasi memungkinkan karyawan untuk:
- 📬 Menerima pemberitahuan real-time
- 🔴 Badge counter untuk unread notifications
- 📋 History notifikasi lengkap
- ✅ Tandai sebagai dibaca/belum dibaca

---

## 📱 Jenis Notifikasi

### 1. Leave Notifications 🏖️

**Leave Request Approved:**
```
✅ Leave request approved
Your leave request #12 for 3 days (01-03 Feb) 
has been approved.
```

**Leave Request Rejected:**
```
❌ Leave request rejected
Your leave request #11 has been rejected.
Reason: Insufficient leave balance.
```

**Leave Reminder:**
```
📅 Leave reminder
Your approved leave starts tomorrow (01 Feb).
Have a great time off!
```

---

### 2. Overtime Notifications ⏰

**Overtime Approved:**
```
✅ Overtime request approved
Your overtime request #15 for 3 hours on 14/01 
has been approved.
Compensation: Rp 255,681
```

**Overtime Rejected:**
```
❌ Overtime request rejected
Your overtime request #14 has been rejected.
Please check with your manager.
```

**Overtime Modified:**
```
⚠️ Overtime modified
Your overtime request was approved with changes:
Requested: 4 hours → Approved: 3 hours
```

---

### 3. Attendance Notifications 📋

**Late Arrival Warning:**
```
⏰ Late arrival detected
You clocked in at 09:15 AM today.
This has been recorded in your attendance.
```

**Forgot to Clock Out:**
```
⚠️ Forgot to clock out?
You haven't clocked out yesterday.
Please contact admin for manual correction.
```

**Absent Alert:**
```
❌ Absent today
You didn't clock in today.
If this is a mistake, contact HR immediately.
```

---

### 4. System Notifications 🔔

**Password Changed:**
```
🔒 Password changed successfully
Your password was changed on 15/01/2026 at 10:30 AM.
If this wasn't you, contact support immediately.
```

**Profile Updated:**
```
👤 Profile updated
Your profile information has been updated by admin.
Please review your profile.
```

**Shift Changed:**
```
🔄 Shift assignment changed
Your default shift has been changed to: WFH Shift
Effective from: 16/01/2026
```

---

### 5. Announcement 📢

**Company Announcement:**
```
📢 Company announcement
Holiday Notice: National holiday on 17/08/2026.
Office will be closed.
```

**System Maintenance:**
```
🔧 System maintenance
HRIS system will undergo maintenance on 
Saturday, 20/01/2026, 22:00-24:00.
```

---

## 🔔 Notification Badge

### Badge Counter

Di header, Anda akan lihat icon 🔔 dengan badge merah:

```
🔔  ⓪  → No unread notifications
🔔  ①  → 1 unread
🔔  ⑤  → 5 unread
🔔  12  → 12 unread
```

**Badge Color:**
- 🔴 Red → Ada unread notifications
- ⚪ None → Semua sudah dibaca

---

## 📬 Cara Melihat Notifikasi

### Method 1: Quick View (Dropdown)

**Step 1:** Klik icon 🔔 di header

**Step 2:** Dropdown akan muncul dengan 5 notifikasi terbaru:

```
┌─────────────────────────────────────┐
│  🔔 Notifications              [×]  │
├─────────────────────────────────────┤
│                                     │
│  ✅ Leave request approved          │
│  Your leave request #12...          │
│  2 minutes ago                      │
│  ────────────────────────────────   │
│                                     │
│  ⏰ Overtime request approved       │
│  Your overtime request #15...       │
│  1 hour ago                         │
│  ────────────────────────────────   │
│                                     │
│  📢 Company announcement            │
│  Holiday notice...                  │
│  3 hours ago                        │
│  ────────────────────────────────   │
│                                     │
│  [ View All Notifications ]         │
└─────────────────────────────────────┘
```

**Features:**
- Menampilkan 5 terbaru
- Klik notifikasi untuk lihat detail
- Klik "View All" untuk halaman lengkap

---

### Method 2: Full Notification Page

**Step 1:** Klik menu **"Notifications"** di sidebar

**Step 2:** Halaman full notification akan muncul

---

## 📋 Halaman Notifications

### Layout Halaman

```
┌─────────────────────────────────────────────┐
│  🔔 Notifications                           │
├─────────────────────────────────────────────┤
│                                             │
│  [ All ] [ Unread ] [ Read ]               │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ ✅ Leave request approved    NEW   │    │
│  │ Your leave request #12 for 3 days  │    │
│  │ has been approved.                 │    │
│  │ 📅 15/01/2026 10:30 AM            │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ ⏰ Overtime request approved       │    │
│  │ Your overtime request #15 for      │    │
│  │ 3 hours has been approved.         │    │
│  │ 📅 15/01/2026 09:15 AM            │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 📢 Company announcement            │    │
│  │ Holiday notice: 17/08/2026         │    │
│  │ 📅 14/01/2026 14:00 PM            │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Showing 1-10 of 25    [ ◄ 1 2 3 ► ]      │
└─────────────────────────────────────────────┘
```

---

### Filter Options

**All:**
- Menampilkan semua notifikasi
- Read & Unread

**Unread:**
- Hanya notifikasi yang belum dibaca
- Badge: 🔴 NEW

**Read:**
- Hanya notifikasi yang sudah dibaca
- Warna text lebih pudar

---

## ✅ Menandai sebagai Dibaca

### Auto Mark as Read

**Saat Anda:**
1. Klik notifikasi di dropdown
2. Klik notifikasi di halaman Notifications
3. View detail notifikasi

**Otomatis:**
- Status berubah jadi "READ"
- Badge counter berkurang
- Notifikasi hilang dari filter "Unread"

---

### Manual Mark as Read

**Bulk Action:**
1. Select multiple notifications (checkbox)
2. Klik "Mark as Read"
3. Semua selected → READ

**Mark All as Read:**
1. Klik tombol "Mark All as Read"
2. Confirmation: "Mark all 25 notifications as read?"
3. Semua notifikasi → READ
4. Badge counter → 0

---

## 🔕 Notification Settings

### Preference Settings

```
┌─────────────────────────────────────┐
│  🔔 Notification Preferences        │
├─────────────────────────────────────┤
│                                     │
│  Email Notifications:               │
│  ☑ Leave approval/rejection         │
│  ☑ Overtime approval/rejection      │
│  ☑ System announcements             │
│  ☐ Daily attendance summary         │
│  ☐ Weekly attendance report         │
│                                     │
│  In-App Notifications:              │
│  ☑ Real-time notifications          │
│  ☑ Show badge counter               │
│  ☑ Sound notification               │
│                                     │
│  [ Save Preferences ]               │
└─────────────────────────────────────┘
```

---

## 📧 Email Notifications

### Kapan Email Dikirim?

**Otomatis kirim email untuk:**
- ✅ Leave approved/rejected
- ✅ Overtime approved/rejected
- ⚠️ Important system alerts
- 📢 Company announcements

**Email Format:**
```
From: noreply@salmonhris.com
To: budi@company.com
Subject: ✅ Leave Request Approved

Hi Budi Santoso,

Your leave request #12 has been approved.

Details:
- Leave Type: Annual Leave
- Start Date: 01 Feb 2026
- End Date: 03 Feb 2026
- Duration: 3 days

Have a great time off!

---
This is an automated email from Salmon HRIS.
Do not reply to this email.
```

---

## 🔔 Notification Priority

### Priority Levels

**HIGH (Urgent):**
- 🔴 Red indicator
- Email + In-app
- Immediate action required
- Examples:
  - Leave rejected (need resubmit)
  - Password changed (security)
  - Account deactivated

**MEDIUM (Normal):**
- 🟡 Yellow indicator
- In-app notification
- Review recommended
- Examples:
  - Leave approved
  - Overtime approved
  - Shift changed

**LOW (Info):**
- 🔵 Blue indicator
- In-app only
- FYI purposes
- Examples:
  - Announcements
  - Tips & tricks
  - System updates

---

## 📊 Notification Statistics

### Personal Stats

```
┌─────────────────────────────────────┐
│  📊 Notification Stats - Jan 2026   │
├─────────────────────────────────────┤
│  Total Received:     45             │
│  Read:               40 (89%)       │
│  Unread:             5 (11%)        │
│                                     │
│  By Type:                           │
│  • Leave:           15 (33%)        │
│  • Overtime:        10 (22%)        │
│  • Attendance:      8 (18%)         │
│  • System:          12 (27%)        │
│                                     │
│  Avg Response Time: 2.5 hours       │
└─────────────────────────────────────┘
```

---

## 🔍 Search Notifications

### Search Function

**Search by:**
- 📝 Title
- 📄 Message content
- 📅 Date range
- 🏷️ Type

**Example:**
```
Search: "leave"

Results:
- ✅ Leave request approved
- ❌ Leave request rejected
- 📅 Leave reminder
```

---

## ⏰ Notification Timing

### Real-Time Notifications

**Instant Delivery:**
- Leave/Overtime approval → Immediately
- System alerts → Immediately
- Announcements → Scheduled by admin

**Batch Notifications:**
- Daily summary → 17:00 daily
- Weekly report → Monday 08:00
- Monthly report → 1st day of month

---

## 🗑️ Delete Notifications

### Delete Options

**Single Delete:**
1. Hover over notification
2. Click ❌ delete icon
3. Confirmation: "Delete this notification?"
4. Notification removed

**Bulk Delete:**
1. Select multiple (checkbox)
2. Click "Delete Selected"
3. Confirmation
4. All selected removed

**Delete All Read:**
1. Click "Delete All Read"
2. Confirmation: "Delete 40 read notifications?"
3. All read notifications removed
4. Unread preserved

---

## 💡 Best Practices

### DO (Lakukan)
- ✅ Check notifications regularly (minimal 2x sehari)
- ✅ Respond to urgent notifications segera
- ✅ Mark as read setelah action
- ✅ Archive old notifications
- ✅ Enable email for important alerts
- ✅ Keep unread count < 10

### DON'T (Jangan)
- ❌ Ignore unread notifications
- ❌ Disable all email notifications
- ❌ Delete without reading
- ❌ Let unread pile up (100+)
- ❌ Miss important announcements

---

## 🆘 Troubleshooting

### Problem: Tidak menerima notifikasi

**Solusi:**
1. Check notification preferences (enabled?)
2. Check email spam folder
3. Refresh halaman
4. Logout & login kembali
5. Clear browser cache

---

### Problem: Badge counter tidak update

**Solusi:**
1. Refresh halaman (F5)
2. Mark notifications as read manually
3. Logout & login kembali

---

### Problem: Email notifikasi tidak masuk

**Solusi:**
1. Check spam/junk folder
2. Add noreply@salmonhris.com to contacts
3. Check email preferences (enabled?)
4. Verify email address di profile
5. Contact IT support

---

### Problem: Duplicate notifications

**Solusi:**
1. Refresh halaman
2. Report bug ke IT
3. Sementara: delete duplicates

---

## 📞 Butuh Bantuan?

Hubungi:
- 📧 Email: support@salmonhris.com
- 📱 Phone: +62 xxx xxxx xxxx

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
