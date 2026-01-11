# Admin Page - Documentation

## 📋 Overview
AdminPage.jsx adalah halaman utama untuk HR/Admin yang menyediakan panel manajemen komprehensif untuk sistem HRIS.

## 🎯 Fitur Utama

### 1. 📊 Admin Dashboard
**File:** `AdminDashboard.jsx`
- **Total Employees**: Jumlah total karyawan
- **Attendance Today**: 
  - Present (On Time)
  - Late
  - Absent
  - On Leave
- **Pending Approvals**: 
  - Leave Requests
  - Overtime Requests
- **Today's Attendance Summary**: Tabel detail absensi hari ini
- **Quick Actions**: Tombol aksi cepat

**Endpoints Used:**
- `GET /user/admin` - Get all employees
- `GET /attendance/admin/today-attendance` - Get today's attendance
- `GET /leave-request/admin/all` - Get all leave requests
- `GET /overtime/admin/all` - Get all overtime requests

---

### 2. 👥 Employee Management
**File:** `EmployeeManagement.jsx`

**Features:**
- ✅ Employee List dengan search dan filter
- ✅ Add Employee (form lengkap)
- ✅ Edit Employee
- ✅ Toggle Status (Active/Inactive)
- ✅ Export CSV
- ✅ Filter by status (Active/Inactive/All)

**Endpoints Used:**
- `GET /user/admin` - Get all users
- `POST /register` - Add new employee
- `PUT /user/admin/:id` - Update employee
- `PATCH /user/admin/:id/status` - Toggle employee status

**Data Fields:**
- Name, Email, Password
- Phone Number
- Position, Department
- Role (EMPLOYEE/ADMIN)
- Join Date
- Active Status

---

### 3. 📅 Attendance Management
**File:** `AttendanceManagement.jsx`

**Features:**
- ✅ Attendance Recap (harian/bulanan)
- ✅ Filter by:
  - Date Range (From - To)
  - Employee
  - Status (ON_TIME, LATE, ABSENT, LEAVE, HOLIDAY)
- ✅ Manual Attendance Entry (dengan audit log otomatis)
- ✅ Edit Attendance Record
- ✅ Export to Excel
- ✅ Statistics Dashboard

**Endpoints Used:**
- `GET /attendance/admin/all-attendance` - Get all attendance
- `POST /attendance/admin/manual-attendance` - Create manual attendance
- `PUT /attendance/admin/manual-attendance/:id` - Update attendance
- `GET /report/admin/export/excel` - Export to Excel

**Statistics Shown:**
- Total Records
- On Time Count
- Late Count
- Absent Count
- On Leave Count

---

### 4. 🏖️ Leave Management
**File:** `LeaveManagement.jsx`

**Features:**
- ✅ Leave Request List
- ✅ Approve/Reject Leave Requests
- ✅ View Leave Details
- ✅ Adjust Leave Quota per Employee
- ✅ Filter by Status (PENDING/APPROVED/REJECTED)
- ✅ Leave Balance Tracking
- ✅ Leave Types:
  - Annual Leave
  - Sick Leave
  - Unpaid Leave

**Endpoints Used:**
- `GET /leave-request/admin/all` - Get all leave requests
- `PUT /leave-request/admin/:id/approve` - Approve leave
- `PUT /leave-request/admin/:id/reject` - Reject leave
- `PUT /leave-request/admin/adjust-quota/:userId` - Adjust quota
- `GET /leave-request/admin/balance/:userId` - Get employee balance

**Statistics:**
- Pending Requests
- Approved Requests
- Rejected Requests
- Total Requests

---

### 5. ⏰ Shift & Schedule Management
**File:** `ShiftScheduleManagement.jsx`

**Features:**
- ✅ Create Shift
- ✅ Edit Shift
- ✅ Delete Shift
- ✅ Assign Shift to Employee
- ✅ Remove Shift from Employee
- ✅ View Employee Shift Assignments
- ✅ Working Hours Configuration

**Endpoints Used:**
- `GET /shift/admin/shifts` - Get all shifts
- `POST /shift/admin/shifts` - Create shift
- `PUT /shift/admin/shifts/:id` - Update shift
- `DELETE /shift/admin/shifts/:id` - Delete shift
- `PUT /shift/admin/users/:userId/shift` - Assign shift
- `DELETE /shift/admin/users/:userId/shift` - Remove shift

**Shift Data:**
- Name (e.g., Morning Shift, Night Shift)
- Start Time
- End Time
- Work Days (optional)

---

### 6. ⏱️ Overtime Management
**File:** `OvertimeManagement.jsx`

**Features:**
- ✅ View All Overtime Requests
- ✅ Approve Overtime
- ✅ Reject Overtime (with reason)
- ✅ Filter by Status
- ✅ Statistics Dashboard

**Endpoints Used:**
- `GET /overtime/admin/all` - Get all overtime requests
- `PUT /overtime/admin/:id/approve` - Approve overtime
- `PUT /overtime/admin/:id/reject` - Reject overtime

**Statistics:**
- Pending Count
- Approved Count
- Rejected Count
- Total Count

---

### 7. 📍 Office Location Management
**File:** `OfficeLocationManagement.jsx`

**Features:**
- ✅ View Office Locations
- 🚧 GPS Geofencing Settings (Coming Soon)

**Endpoints Used:**
- `GET /office-location/admin` - Get all office locations

---

### 8. 📈 Reports & Analytics
**File:** `ReportAnalytics.jsx`

**Features:**
- ✅ Export Attendance to Excel (.xlsx)
- ✅ Export Attendance to CSV (.csv)
- ✅ Date Range Filter
- ✅ Employee Filter (all or specific)
- ✅ Download Reports

**Endpoints Used:**
- `GET /report/admin/export/excel` - Export Excel
- `GET /report/admin/export/csv` - Export CSV
- `GET /report/admin/monthly` - Monthly report
- `GET /report/admin/preview` - Report preview
- `GET /report/admin/employee-performance` - Performance report

---

### 9. 📝 Audit Log Viewer
**File:** `AuditLogViewer.jsx`

**Features:**
- ✅ View All System Activities
- ✅ Track CREATE/UPDATE/DELETE actions
- ✅ User Activity Monitoring
- ✅ Timestamp Tracking
- ✅ Action Statistics

**Endpoints Used:**
- `GET /audit-log` - Get all audit logs

**Statistics:**
- Total Logs
- Create Actions
- Update Actions
- Delete Actions

---

## 🔐 Authentication & Authorization

All endpoints require:
```javascript
headers: { 
  Authorization: `Bearer ${token}` 
}
```

Role requirement: `ADMIN` or `SUPER_ADMIN`

---

## 📱 Responsive Design

Semua komponen sudah didesain responsive dengan Tailwind CSS:
- Mobile: 1 column grid
- Tablet (md): 2-3 columns
- Desktop (lg): 4+ columns

---

## 🎨 UI Components Used

### Custom Components:
- `FormInput` - Input field reusable
- `FormSelect` - Select/dropdown reusable
- `FormTextarea` - Textarea reusable
- `Modal` - Modal dialog reusable

### Color Scheme:
- **Blue**: Primary actions, info
- **Green**: Success, approve, on-time
- **Yellow**: Warnings, pending, late
- **Red**: Danger, reject, absent
- **Purple**: Special actions (admin, adjust quota)
- **Gray**: Neutral, disabled

---

## 🔄 State Management

Menggunakan React Hooks:
- `useState` - Local state management
- `useEffect` - Side effects & data fetching
- `useNavigate` - Routing

---

## 📊 Statistics & Analytics

Setiap page menampilkan:
1. **Count Cards** - Visual statistics
2. **Filters** - Dynamic filtering
3. **Tables** - Data display dengan pagination
4. **Action Buttons** - Quick actions

---

## 🚀 Next Steps / Improvements

### Recommended Additions:

1. **Dashboard Enhancements:**
   - Real-time updates dengan WebSocket
   - Charts/Graphs (Chart.js atau Recharts)
   - More detailed analytics

2. **Employee Management:**
   - Bulk Import CSV
   - Employee Profile Picture Upload
   - Department Management
   - Position Hierarchy

3. **Attendance:**
   - Calendar View
   - Attendance Patterns Analysis
   - Late Trends Report

4. **Leave Management:**
   - Leave Calendar View
   - Auto-calculate Working Days
   - Holiday Integration

5. **Shift Management:**
   - Shift Rotation Planning
   - Shift Swap Requests
   - Overtime Calculation from Shifts

6. **Reports:**
   - PDF Export
   - Custom Report Builder
   - Email Report Scheduling

7. **Audit Logs:**
   - Advanced Filters
   - Export Audit Logs
   - Retention Policies

8. **Office Locations:**
   - Add/Edit/Delete Locations
   - Map Integration (Google Maps/Mapbox)
   - Multiple Office Support
   - Radius Configuration

---

## 🐛 Error Handling

Setiap API call sudah dilengkapi dengan:
- Try-catch blocks
- User-friendly error messages
- Console logging untuk debugging

---

## 💡 Tips Penggunaan

1. **Filter Data**: Gunakan filter untuk mempercepat pencarian
2. **Export Regular**: Export data secara berkala untuk backup
3. **Monitor Audit Logs**: Cek audit logs untuk tracking perubahan
4. **Pending Actions**: Prioritaskan approval yang pending
5. **Statistics**: Gunakan dashboard untuk quick insights

---

## 📞 Support & Maintenance

Untuk menambah fitur atau modifikasi:
1. Update endpoint di file komponen terkait
2. Sesuaikan interface dengan design system
3. Test dengan berbagai skenario
4. Update dokumentasi ini

---

## ✅ Checklist Implementasi

- [x] Admin Dashboard
- [x] Employee Management (CRUD)
- [x] Attendance Management
- [x] Leave Management
- [x] Shift & Schedule
- [x] Overtime Management
- [x] Reports & Export
- [x] Audit Logs
- [ ] Office Location Management (Basic)
- [ ] Advanced Analytics
- [ ] Notification System Integration

---

## 🎯 Key Features Summary

| Feature | Create | Read | Update | Delete | Export |
|---------|--------|------|--------|--------|--------|
| Employees | ✅ | ✅ | ✅ | ✅ (Deactivate) | ✅ CSV |
| Attendance | ✅ (Manual) | ✅ | ✅ | ❌ | ✅ Excel/CSV |
| Leave | ❌ | ✅ | ✅ (Approve/Reject) | ❌ | ❌ |
| Shifts | ✅ | ✅ | ✅ | ✅ | ❌ |
| Overtime | ❌ | ✅ | ✅ (Approve/Reject) | ❌ | ❌ |
| Reports | ❌ | ✅ | ❌ | ❌ | ✅ Excel/CSV |
| Audit Logs | Auto | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Notes

- Semua komponen menggunakan localStorage untuk authentication token
- Auto-redirect ke login jika tidak ada token
- Auto-redirect ke employee page jika bukan admin
- Semua modal dapat ditutup dengan tombol Cancel atau Close
- Confirmation dialog untuk destructive actions
