# 👨‍💼 PANDUAN LENGKAP ADMIN - SALMON HRIS

> Dokumentasi komprehensif untuk Administrator sistem HR Management

---

## 🎯 Overview Admin Dashboard

Sebagai **Admin**, Anda memiliki akses penuh untuk:
- 📊 Monitoring kehadiran real-time
- 👥 Mengelola karyawan
- ✅ Approve/reject leave & overtime
- 📈 Generate reports & analytics
- ⚙️ Konfigurasi sistem
- 🔍 Audit trail & security

---

## 🚀 Quick Start Admin

### Login sebagai Admin

**Credentials:**
```
Email: admin@company.com
Password: admin123
```

**Redirect:**
- Auto redirect ke: `/admin/dashboard`

### First Time Setup Checklist

Setelah login pertama kali, lakukan:

- [ ] **1. Setup Office Locations**
  - Tambah lokasi kantor utama
  - Set GPS coordinates
  - Tentukan radius geo-fencing

- [ ] **2. Create Shifts**
  - Buat shift Office
  - Buat shift WFH
  - Buat shift Flexible

- [ ] **3. Add Employees**
  - Register karyawan baru
  - Assign shift default
  - Set annual leave quota

- [ ] **4. Configure Holidays**
  - Tambah hari libur nasional tahun ini
  - Set holiday calendar

- [ ] **5. Review Notifications**
  - Check pending approvals
  - Lihat recent activities

---

## 📱 Interface Admin Dashboard

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  [Logo] [Search] [Notifications 🔔] [Profile 👤]    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │           MAIN CONTENT                   │
│          │                                          │
│ Dashboard│  ┌───────────────────────────────────┐  │
│ Employees│  │                                   │  │
│ Attendance│  │      Page Content Here           │  │
│ Leave    │  │                                   │  │
│ Shift    │  └───────────────────────────────────┘  │
│ Overtime │                                          │
│ Organiz. │                                          │
│ Reports  │                                          │
│ Notif    │                                          │
│ Settings │                                          │
│          │                                          │
│ [Logout] │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Sidebar Menu

| Menu | Icon | Link | Fungsi |
|------|------|------|--------|
| **Dashboard** | 📊 | `/admin/dashboard` | Overview & analytics |
| **Employees** | 👥 | `/admin/employees` | Manajemen karyawan |
| **Attendance** | 📋 | `/admin/attendance` | Monitoring absensi |
| **Leave** | 🏖️ | `/admin/leave` | Approval cuti |
| **Shift** | 🕐 | `/admin/shift` | Manajemen shift |
| **Overtime** | ⏰ | `/admin/overtime` | Approval lembur |
| **Organization** | 🏢 | `/admin/organization` | Lokasi & struktur |
| **Reports** | 📈 | `/admin/reports` | Laporan & export |
| **Notifications** | 🔔 | `/admin/notifications` | Notifikasi sistem |
| **Settings** | ⚙️ | `/admin/settings` | Pengaturan |

---

## 📊 Dashboard Analytics

### KPI Cards (Key Performance Indicators)

Dashboard menampilkan 12 KPI cards utama:

#### 1. Employee Metrics
```
┌─────────────────────┐
│ 👥 Total Employees  │
│     150             │
│  ↑ +5 this month    │
└─────────────────────┘
```
- **Total Employees:** Jumlah semua karyawan
- **Active Employees:** Karyawan aktif (isActive = true)
- **Trend:** Perubahan dari bulan lalu

#### 2. Today's Attendance
```
┌─────────────────────┐
│ ✅ Present Today    │
│     142 / 150       │
│  94.7%              │
└─────────────────────┘
```
- **Present:** Sudah clock-in hari ini
- **Percentage:** % kehadiran
- **Target:** ≥ 95%

#### 3. Late Arrivals
```
┌─────────────────────┐
│ ⏰ Late Today       │
│     8               │
│  5.3%               │
└─────────────────────┘
```
- **Late Count:** Clock-in > 09:00
- **Percentage:** % dari total present
- **Alert:** Jika > 10%

#### 4. Absent
```
┌─────────────────────┐
│ ❌ Absent Today     │
│     5               │
│  3.3%               │
└─────────────────────┘
```
- **Auto Set:** Otomatis jam 18:00
- **Manual:** Admin bisa set manual
- **Exclude:** Karyawan yang cuti/libur

#### 5. On Progress
```
┌─────────────────────┐
│ 🟡 On Progress      │
│     137             │
│  Belum clock-out    │
└─────────────────────┘
```
- **Real-time:** Update setiap 30 detik
- **Status:** Sudah clock-in, belum clock-out
- **Action:** Auto update saat clock-out

#### 6. Leave Today
```
┌─────────────────────┐
│ 🏖️ On Leave        │
│     3               │
│  Approved leaves    │
└─────────────────────┘
```
- **Source:** LeaveRequest status APPROVED
- **Date:** Cuti hari ini
- **Types:** Annual, Sick, Permission

#### 7. Remote Workers
```
┌─────────────────────┐
│ 🏠 Remote (WFH)     │
│     15              │
│  Working from home  │
└─────────────────────┘
```
- **Shift Type:** WFH
- **GPS:** Not validated
- **Flexible:** Bisa dari mana saja

#### 8. Onsite Workers
```
┌─────────────────────┐
│ 🏢 Onsite           │
│     127             │
│  Working at office  │
└─────────────────────┘
```
- **Shift Type:** Office
- **GPS:** Validated
- **Location:** Dalam radius kantor

#### 9. Valid Location
```
┌─────────────────────┐
│ ✅ Valid Location   │
│     120 / 127       │
│  94.5%              │
└─────────────────────┘
```
- **Criteria:** Dalam radius kantor
- **Percentage:** GPS validation success rate
- **Good:** > 90%

#### 10. Outside Radius
```
┌─────────────────────┐
│ ⚠️ Outside Radius   │
│     7               │
│  Need review        │
└─────────────────────┘
```
- **Alert:** Perlu review manual
- **Reason:** GPS di luar radius
- **Action:** Approve/reject manual

#### 11. Pending Leave
```
┌─────────────────────┐
│ 🟡 Pending Leave    │
│     12              │
│  Need approval      │
└─────────────────────┘
```
- **Status:** PENDING
- **Action Required:** Approve/Reject
- **SLA:** < 24 jam

#### 12. Pending Overtime
```
┌─────────────────────┐
│ 🟡 Pending Overtime │
│     5               │
│  Need approval      │
└─────────────────────┘
```
- **Status:** PENDING
- **Action Required:** Approve/Reject
- **SLA:** < 48 jam

---

## 📈 Charts & Visualizations

### 1. Attendance Trend Chart

**Type:** Line Chart  
**Data:** Attendance over time (7 atau 30 hari)

```
Attendance Trend (Last 7 Days)
     Present │ ●───●───●───●───●───●───●
        Late │ ●───●───●───●───●───●───●
      Absent │ ●───●───●───●───●───●───●
             └─────────────────────────
             Mon Tue Wed Thu Fri Sat Sun
```

**Insights:**
- Trend kehadiran
- Hari dengan absent tertinggi
- Pattern keterlambatan
- Perbandingan week over week

**Actions:**
- Toggle period: 7 days / 30 days
- Hover untuk detail
- Export chart as image

---

### 2. Attendance Status Distribution

**Type:** Doughnut Chart  
**Data:** Distribusi status hari ini

```
     ┌─────────────┐
     │   ON_TIME   │ 60%
     │   LATE      │ 25%
     │   ABSENT    │ 10%
     │   LEAVE     │ 5%
     └─────────────┘
```

**Color Coding:**
- 🟢 ON_TIME - Green
- 🟡 LATE - Yellow
- 🔴 ABSENT - Red
- 🔵 LEAVE - Blue

---

## 🔝 Top Late Employees

Widget menampilkan 5 karyawan dengan keterlambatan terbanyak (periode tertentu):

```
┌────────────────────────────────────────────────┐
│ 🏆 Top Late Employees (This Month)            │
├────┬─────────────────┬──────────┬─────────────┤
│ #  │ Name            │ Position │ Late Count  │
├────┼─────────────────┼──────────┼─────────────┤
│ 1  │ Budi Santoso    │ Staff    │ 8 times     │
│ 2  │ Ani Wijaya      │ Manager  │ 6 times     │
│ 3  │ Citra Dewi      │ Staff    │ 5 times     │
│ 4  │ Doni Ahmad      │ Senior   │ 5 times     │
│ 5  │ Eko Prabowo     │ Junior   │ 4 times     │
└────┴─────────────────┴──────────┴─────────────┘
```

**Purpose:**
- Identifikasi pola keterlambatan
- Performance review data
- Counseling candidates

**Actions:**
- Klik nama untuk lihat detail
- Export list
- Send warning notification

---

## ⚠️ Location Violations

Widget menampilkan karyawan yang clock-in dari luar radius kantor:

```
┌────────────────────────────────────────────────┐
│ ⚠️ Location Violations (Today)                 │
├──────────────────┬────────────┬────────────────┤
│ Employee         │ Time       │ Status         │
├──────────────────┼────────────┼────────────────┤
│ Agus Pratama     │ 08:45 AM   │ Outside Radius │
│ Siti Nurhaliza   │ 09:15 AM   │ Outside Radius │
│ Rudi Hermawan    │ 08:30 AM   │ GPS Error      │
└──────────────────┴────────────┴────────────────┘
```

**Validation Status:**
- **outside_radius** - Di luar area kantor
- **gps_error** - GPS tidak terdeteksi
- **valid** - Dalam radius (tidak muncul di sini)

**Actions:**
- 👁️ **View Details** - Lihat koordinat GPS, jarak
- ✅ **Approve** - Terima sebagai valid (WFH/fieldwork)
- ❌ **Reject** - Tandai sebagai pelanggaran
- 📧 **Send Warning** - Kirim notifikasi

---

## 🔔 Recent Activity Feed

Widget menampilkan 10 aktivitas terbaru dari Audit Logs:

```
┌────────────────────────────────────────────────┐
│ 📋 Recent Activity                             │
├────────────────────────────────────────────────┤
│ 🟢 Budi Santoso clocked in                     │
│    2 minutes ago                               │
├────────────────────────────────────────────────┤
│ ✅ Admin approved leave request #123           │
│    5 minutes ago                               │
├────────────────────────────────────────────────┤
│ 📝 Ani Wijaya submitted overtime request       │
│    15 minutes ago                              │
├────────────────────────────────────────────────┤
│ ❌ Admin rejected leave request #122           │
│    30 minutes ago                              │
└────────────────────────────────────────────────┘
```

**Activity Types:**
- 🟢 **Clock In/Out** - Attendance events
- ✅ **Approvals** - Leave/Overtime approved
- ❌ **Rejections** - Leave/Overtime rejected
- 📝 **Submissions** - New requests
- 👥 **User Management** - Create/update users
- ⚙️ **System Changes** - Settings updates

**Source:** AuditLog table  
**Filter:** Exclude READ actions  
**Limit:** 10 latest

---

## 🔄 Auto Refresh

Dashboard memiliki **auto-refresh** setiap 30 detik untuk data real-time:

```javascript
useEffect(() => {
  fetchDashboardData();
  const interval = setInterval(fetchDashboardData, 30000);
  return () => clearInterval(interval);
}, []);
```

**Benefits:**
- Real-time monitoring
- No manual refresh needed
- Up-to-date KPIs

**Performance:**
- Optimized API calls
- Parallel data fetching
- Cached static data

---

## 🎨 Color Coding & Status

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Green | `#10B981` | ON_TIME, Approved |
| Warning | Yellow | `#F59E0B` | LATE, Pending |
| Danger | Red | `#EF4444` | ABSENT, Rejected |
| Info | Blue | `#3B82F6` | LEAVE, Info |
| Gray | Gray | `#6B7280` | Inactive, Disabled |

### Icon System

- ✅ Success/Approved
- ⏰ Late/Time-related
- ❌ Absent/Rejected
- 🟡 Pending/Warning
- 📊 Statistics/Reports
- 👥 Employees
- 🏢 Organization
- ⚙️ Settings

---

## 📊 Dashboard Data Flow

### Backend API Calls

Saat dashboard load, sistem melakukan **parallel API calls**:

```javascript
const [
  employeesRes,
  todayAttendanceRes,
  allAttendanceRes,
  leaveRequestsRes,
  overtimeRes,
  auditLogsRes,
] = await Promise.all([
  axios.get('/users/admin'),
  axios.get('/attendances/admin/today-attendance'),
  axios.get('/attendances/admin/all-attendance?startDate=...&endDate=...'),
  axios.get('/leave-requests/admin/all'),
  axios.get('/overtimes/admin/requests'),
  axios.get('/audit-logs?limit=20'),
]);
```

**Performance:**
- ⚡ Parallel requests = Faster load
- 🔄 Single loading state
- ❌ Handle errors gracefully

---

### Data Processing Flow

```
1. Fetch Data dari API
   ↓
2. Process Employee Data
   ├─ Total employees
   ├─ Active employees
   └─ Filter by isActive
   ↓
3. Process Today's Attendance
   ├─ Count present (status != ABSENT)
   ├─ Count late (status = LATE)
   ├─ Count absent (status = ABSENT)
   ├─ Count on-progress (status = ON_PROGRESS)
   └─ Count by shift type (remote/onsite)
   ↓
4. Process Location Validation
   ├─ Valid location (status = valid)
   ├─ Outside radius (status = outside_radius)
   └─ Calculate percentages
   ↓
5. Calculate Late Employees Ranking
   ├─ Group by UserId
   ├─ Count LATE status
   ├─ Sort descending
   └─ Take top 5
   ↓
6. Filter Location Violations
   ├─ Status = outside_radius OR gps_error
   ├─ Sort by time
   └─ Take latest 5
   ↓
7. Process Chart Data
   ├─ Group attendance by date
   ├─ Count by status per date
   └─ Format for Chart.js
   ↓
8. Process Recent Activity
   ├─ Filter audit logs (action != READ)
   ├─ Format action text
   ├─ Sort by time
   └─ Take latest 10
   ↓
9. Process Pending Approvals
   ├─ Leave: status = PENDING
   ├─ Overtime: status = PENDING
   └─ Count each
   ↓
10. Update State & Render
    └─ setStats(), setChartData(), etc.
```

---

## 🔍 Monitoring Best Practices

### Daily Checklist

**Morning (08:00 - 09:00):**
- [ ] Check dashboard KPIs
- [ ] Review pending approvals
- [ ] Check location violations
- [ ] Monitor clock-in rate

**Midday (12:00 - 13:00):**
- [ ] Review late arrivals
- [ ] Check absence notifications
- [ ] Process leave requests
- [ ] Respond to employee inquiries

**Evening (16:00 - 17:00):**
- [ ] Monitor clock-out rate
- [ ] Check overtime requests
- [ ] Review today's attendance summary
- [ ] Prepare for auto-absent (18:00)

**After Hours (18:00+):**
- [ ] Verify auto-absent execution
- [ ] Check for anomalies
- [ ] Send daily report (optional)

---

### Red Flags to Watch

⚠️ **High Absent Rate** (> 5%)
- Investigate causes
- Check for system issues
- Contact absent employees

⚠️ **Many Location Violations** (> 10%)
- GPS system problem?
- Employees not at office?
- Need policy review?

⚠️ **Increasing Late Trend**
- Pattern analysis needed
- Traffic issues?
- Shift time adjustment?

⚠️ **Many Pending Approvals** (> 20)
- Process backlogs
- Delegate to other admins
- Set SLA reminders

---

## 🎯 Performance Metrics

### Target KPIs

| Metric | Target | Good | Warning | Critical |
|--------|--------|------|---------|----------|
| **Attendance Rate** | ≥ 95% | > 95% | 90-95% | < 90% |
| **On-Time Rate** | ≥ 90% | > 90% | 80-90% | < 80% |
| **Late Rate** | ≤ 5% | < 5% | 5-10% | > 10% |
| **Absent Rate** | ≤ 3% | < 3% | 3-5% | > 5% |
| **GPS Valid Rate** | ≥ 95% | > 95% | 90-95% | < 90% |
| **Approval SLA** | < 24h | < 12h | 12-24h | > 24h |

---

## 📱 Mobile Responsiveness

Dashboard fully responsive:
- 📱 **Mobile** (< 768px): Stacked KPI cards, collapsed sidebar
- 💻 **Tablet** (768-1024px): 2-column KPI grid
- 🖥️ **Desktop** (> 1024px): Full layout dengan sidebar

---

## ⚡ Tips untuk Admin

### Efficiency Tips
- ✅ Gunakan keyboard shortcuts
- ✅ Bookmark frequently used pages
- ✅ Enable browser notifications
- ✅ Use filters untuk quick search
- ✅ Export reports untuk offline analysis

### Security Tips
- 🔒 Logout saat tidak digunakan
- 🔒 Jangan share admin credentials
- 🔒 Review audit logs regularly
- 🔒 Monitor suspicious activities
- 🔒 Change password quarterly

---

**Next:** [Dashboard & Analytics Detail](./02-DASHBOARD-ANALYTICS.md)

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
