# Endpoint Mapping - Frontend to Backend

## ✅ Endpoint yang Sudah Diperbaiki

Semua endpoint di frontend sudah disesuaikan dengan route backend yang benar.

### 1. Authentication
- **POST** `/login` - Login user
- **POST** `/register` - Register user (Admin only, dengan authentication)

### 2. User Management (Admin)
Route prefix: `/users/admin`
- **GET** `/users/admin` - Get all users
- **GET** `/users/admin/:id` - Get user detail
- **PUT** `/users/admin/:id` - Update user
- **PATCH** `/users/admin/:id/status` - Toggle user status
- **PATCH** `/users/admin/:id/employment-dates` - Update employment dates

### 3. Attendance (Employee)
Route prefix: `/attendances`
- **GET** `/attendances` - Get my attendance
- **POST** `/attendances/check-in` - Clock in (with photo)
- **POST** `/attendances/check-out` - Clock out (with photo)
- **GET** `/attendances/my-attendance` - Get my attendance history
- **GET** `/attendances/my-statistics` - Get my attendance statistics
- **GET** `/attendances/today-attendance` - Get today's attendance

### 4. Attendance (Admin)
Route prefix: `/attendances/admin`
- **GET** `/attendances/admin/all-attendance` - Get all attendance records
- **GET** `/attendances/admin/today-attendance` - Get today's attendance (all users)
- **POST** `/attendances/admin/manual-attendance` - Create manual attendance
- **PUT** `/attendances/admin/manual-attendance/:id` - Update manual attendance
- **POST** `/attendances/admin/auto-set-absent` - Trigger auto-set-absent
- **GET** `/attendances/admin/summary` - Get attendance summary
- **GET** `/attendances/admin/employee-statistics/:userId` - Get employee statistics
- **GET** `/attendances/admin/all-statistics` - Get all employees statistics

### 5. Leave Requests (Employee)
Route prefix: `/leave-requests`
- **GET** `/leave-requests/my-requests` - Get my leave requests
- **GET** `/leave-requests/my-balance` - Get my leave balance
- **POST** `/leave-requests` - Create leave request
- **DELETE** `/leave-requests/:id` - Cancel leave request

### 6. Leave Requests (Admin)
Route prefix: `/leave-requests/admin`
- **GET** `/leave-requests/admin/all` - Get all leave requests
- **PUT** `/leave-requests/admin/:id/approve` - Approve leave request
- **PUT** `/leave-requests/admin/:id/reject` - Reject leave request
- **PUT** `/leave-requests/admin/adjust-quota/:userId` - Adjust leave quota
- **GET** `/leave-requests/admin/balance/:userId` - Get employee leave balance

### 7. Overtime (Employee)
Route prefix: `/overtimes`
- **GET** `/overtimes/my-requests` - Get my overtime requests
- **GET** `/overtimes/my-history` - Get my overtime history
- **POST** `/overtimes/request` - Create overtime request
- **DELETE** `/overtimes/:id` - Cancel overtime request

### 8. Overtime (Admin)
Route prefix: `/overtimes/admin`
- **GET** `/overtimes/admin/requests` - Get all overtime requests
- **GET** `/overtimes/admin/summary` - Get overtime summary
- **GET** `/overtimes/admin/pending-count` - Get pending count
- **PATCH** `/overtimes/admin/:id/approve` - Approve overtime
- **PATCH** `/overtimes/admin/:id/reject` - Reject overtime

### 9. Shift Management (Admin)
Route prefix: `/shifts/admin`
- **GET** `/shifts/admin/shifts` - Get all shifts
- **GET** `/shifts/admin/shifts/:id` - Get shift by ID
- **POST** `/shifts/admin/shifts` - Create shift
- **PUT** `/shifts/admin/shifts/:id` - Update shift
- **DELETE** `/shifts/admin/shifts/:id` - Delete shift
- **PUT** `/shifts/admin/users/:userId/shift` - Assign shift to user
- **DELETE** `/shifts/admin/users/:userId/shift` - Remove shift from user

### 10. Audit Logs (Admin)
Route prefix: `/audit-logs`
- **GET** `/audit-logs` - Get all audit logs with filters
- **GET** `/audit-logs/:id` - Get single audit log
- **GET** `/audit-logs/stats` - Get audit statistics
- **GET** `/audit-logs/recent` - Get recent activities
- **GET** `/audit-logs/user/:userId` - Get logs by user
- **GET** `/audit-logs/record/:tableName/:recordId` - Get logs by record

### 11. Reports (Admin)
Route prefix: `/reports`
- **GET** `/reports/export/excel` - Export to Excel
- **GET** `/reports/export/csv` - Export to CSV
- **GET** `/reports/monthly` - Generate monthly report
- **GET** `/reports/preview` - Get report preview
- **GET** `/reports/employee-performance` - Get employee performance report

### 12. Notifications (Employee)
Route prefix: `/notifications`
- **GET** `/notifications` - Get notifications (with pagination)
- **GET** `/notifications/unread-count` - Get unread count
- **PATCH** `/notifications/:id/read` - Mark as read
- **PATCH** `/notifications/read-all` - Mark all as read
- **DELETE** `/notifications/:id` - Delete notification
- **DELETE** `/notifications/clear-read` - Clear all read notifications

### 13. Office Locations (Admin)
Route prefix: `/office-locations/admin`
- **GET** `/office-locations/admin` - Get all office locations
- (Additional endpoints to be implemented)

### 14. Profile (Employee)
Route prefix: `/profile`
- **GET** `/profile` - Get my profile
- **PUT** `/profile` - Update my profile
- **PUT** `/profile/photo` - Update profile photo

### 15. Work Location Change Request (Employee) 🆕
Route prefix: `/work-location-changes`
- **POST** `/work-location-changes` - Create work location change request
- **GET** `/work-location-changes` - Get my work location change requests
- **PATCH** `/work-location-changes/:id/cancel` - Cancel pending request

### 16. Work Location Change Request (Admin) 🆕
Route prefix: `/work-location-changes/admin`
- **GET** `/work-location-changes/admin` - Get all work location change requests
- **GET** `/work-location-changes/admin/pending` - Get pending requests
- **GET** `/work-location-changes/admin/statistics` - Get statistics
- **PATCH** `/work-location-changes/admin/:id/approve` - Approve request
- **PATCH** `/work-location-changes/admin/:id/reject` - Reject request (requires rejectionReason)

### 17. Hybrid Schedule (Employee) 🆕
Route prefix: `/hybrid-schedules`
- **GET** `/hybrid-schedules` - Get my hybrid schedule
- **PUT** `/hybrid-schedules` - Create/update my hybrid schedule
- **DELETE** `/hybrid-schedules` - Delete my hybrid schedule

### 18. Hybrid Schedule (Admin) 🆕
Route prefix: `/hybrid-schedules/admin`
- **GET** `/hybrid-schedules/admin` - Get all hybrid schedules
- **GET** `/hybrid-schedules/admin/statistics` - Get statistics
- **GET** `/hybrid-schedules/admin/user/:userId` - Get schedule by user ID
- **PUT** `/hybrid-schedules/admin/user/:userId` - Create/update schedule for user
- **DELETE** `/hybrid-schedules/admin/user/:userId` - Delete schedule for user

## 📝 Catatan Penting

### HTTP Methods yang Digunakan:
- **GET** - Untuk mengambil data
- **POST** - Untuk membuat data baru
- **PUT** - Untuk update data lengkap
- **PATCH** - Untuk update sebagian data (partial update)
- **DELETE** - Untuk menghapus data

### Authentication:
- Semua endpoint (kecuali `/login`) memerlukan token authentication
- Token disimpan di localStorage dengan key `access_token`
- Format header: `Authorization: Bearer <token>`

### Admin Authorization:
- Endpoint dengan prefix `admin` memerlukan role ADMIN atau SUPER_ADMIN
- Middleware `isAdmin` digunakan untuk verifikasi

### File Upload:
- Attendance check-in/out: Support photo upload (multipart/form-data)
- Profile photo: Support photo upload (multipart/form-data)
- Manual attendance: Support optional photo upload

### Response Format:
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response Format:
```json
{
  "message": "Error message"
}
```

## 🔧 Environment Variables

Frontend (.env):
```
VITE_BASE_URL=http://localhost:3000
```

## 📦 Component Structure

### Admin Components
- `AdminDashboard.jsx` - Dashboard overview
- `EmployeeManagement.jsx` - User management
- `AttendanceManagement.jsx` - Attendance management
- `LeaveManagement.jsx` - Leave request management
- `OvertimeManagement.jsx` - Overtime request management
- `ShiftScheduleManagement.jsx` - Shift scheduling
- `ReportAnalytics.jsx` - Reports and analytics
- `AuditLogViewer.jsx` - Audit log viewer
- `OfficeLocationManagement.jsx` - Office location management

### Employee Components
- `EmployeePage.jsx` - Employee main page (dashboard, attendance, leave, overtime, etc.)

## ✅ Status Perbaikan

Semua endpoint di file-file berikut sudah diperbaiki:
- ✅ `EmployeeManagement.jsx`
- ✅ `AttendanceManagement.jsx`
- ✅ `LeaveManagement.jsx`
- ✅ `OvertimeManagement.jsx`
- ✅ `ShiftScheduleManagement.jsx`
- ✅ `ReportAnalytics.jsx`
- ✅ `AuditLogViewer.jsx`
- ✅ `OfficeLocationManagement.jsx`
- ✅ `AdminDashboard.jsx`
- ✅ `Login.jsx`
- ✅ `EmployeePage.jsx`

Folder `services/` telah dihapus sesuai permintaan.
