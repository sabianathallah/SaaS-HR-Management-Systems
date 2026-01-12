# 🚀 Admin Panel - Quick Start Guide

## 📌 Quick Access

### **Login Credentials**
```
Email: admin@company.com
Password: admin123
```

### **URLs**
```
Login:        http://localhost:5173/login
Dashboard:    http://localhost:5173/admin/dashboard
Employees:    http://localhost:5173/admin/employees
Attendance:   http://localhost:5173/admin/attendance
Leave:        http://localhost:5173/admin/leave
Shift:        http://localhost:5173/admin/shift
Overtime:     http://localhost:5173/admin/overtime
Organization: http://localhost:5173/admin/organization
Reports:      http://localhost:5173/admin/reports
Notifications:http://localhost:5173/admin/notifications
Settings:     http://localhost:5173/admin/settings
```

---

## 🎯 Page Features

### **1. 📊 Dashboard** (`/admin/dashboard`)
- **Overview statistics**
- Total employees, present today, on leave, late comers
- Attendance charts
- Recent leave requests
- Quick actions

### **2. 👥 Employees** (`/admin/employees`)
- **CRUD Operations**
  - ➕ Create new employee
  - ✏️ Edit employee data
  - 🗑️ Delete employee
  - 👁️ View employee details
- **Search & Filter**
- **Pagination**
- **Export to Excel/CSV**

### **3. ✓ Attendance** (`/admin/attendance`)
- **View all attendance records**
- **Manual entry** for missed punch
- **Date range filtering**
- **Export reports**
- **Attendance statistics**

### **4. 🏖️ Leave** (`/admin/leave`)
- **View leave requests**
- **Approve/Reject** requests
- **Leave quota management**
- **Filter by status** (Pending, Approved, Rejected)
- **Leave balance adjustment**

### **5. ⏰ Shift & Schedule** (`/admin/shift`)
- **Create shift templates**
- **Assign shifts to employees**
- **Work schedule management**
- **Shift calendar view**

### **6. ⏱️ Overtime** (`/admin/overtime`)
- **View overtime requests**
- **Approve/Reject** overtime
- **Overtime reports**
- **Filter by status**

### **7. ⚖️ Organization** (`/admin/organization`)
- **Office location management**
- **GPS coordinates setup**
- **Location-based validation**
- **Add/Edit/Delete locations**

### **8. 📊 Reports** (`/admin/reports`)
- **Attendance reports**
- **Leave reports**
- **Overtime reports**
- **Export to Excel/CSV**
- **Custom date ranges**
- **Visual analytics**

### **9. 🔔 Notifications** (`/admin/notifications`)
- **System audit logs**
- **User activity tracking**
- **Filter by action type**
- **Search functionality**

### **10. ⚙️ Settings** (`/admin/settings`)
- **General settings**
- **Company information**
- **Working hours**
- **Attendance policies**
- **System preferences**

---

## 🎨 UI Elements

### **Sidebar Navigation**
```
┌─────────────────────┐
│  ◉ HRIS Admin      │  Logo & Title
├─────────────────────┤
│ 📊 Dashboard       │  ← Active (Blue)
│ 👥 Employees       │
│ ✓  Attendance      │
│ 🏖️ Leave           │
│ ⏰ Shift & Schedule│
│ ⏱️ Overtime         │
│ ⚖️ Organization    │
│ 📊 Reports         │
│ 🔔 Notifications  3│  ← Badge
│ ⚙️ Settings        │
├─────────────────────┤
│ 👤 Admin HR        │  User Info
│ admin@company.com  │
│ [Logout Button]    │
└─────────────────────┘
```

### **Top Header**
```
┌────────────────────────────────────────────────┐
│ Welcome, Admin HR!                  👤 Profile │
│ Tuesday, January 12, 2026           ADMIN      │
└────────────────────────────────────────────────┘
```

---

## 🔑 Common Actions

### **Creating New Employee**
1. Navigate to **Employees** page
2. Click **"Add Employee"** button
3. Fill in form:
   - Name, Email, Password
   - Position, Department
   - Role (ADMIN/EMPLOYEE)
   - Join Date
4. Click **Save**

### **Approving Leave Request**
1. Navigate to **Leave** page
2. Find pending request
3. Click **"View"** or **"Approve"**
4. Add approval note (optional)
5. Click **Confirm**

### **Manual Attendance Entry**
1. Navigate to **Attendance** page
2. Click **"Add Manual Entry"**
3. Select employee and date
4. Enter clock in/out time
5. Add notes
6. Click **Save**

### **Generating Report**
1. Navigate to **Reports** page
2. Select report type
3. Choose date range
4. Click **"Generate Report"**
5. Click **"Export to Excel"** or **"Export to CSV"**

### **Adding Office Location**
1. Navigate to **Organization** page
2. Click **"Add Location"**
3. Enter:
   - Location Name
   - Address
   - GPS Coordinates (lat/long)
   - Radius (meters)
4. Click **Save**

---

## 🛡️ Permissions

### **ADMIN Role Can:**
- ✅ View all pages
- ✅ Create/Edit/Delete employees
- ✅ Approve/Reject leave requests
- ✅ Approve/Reject overtime
- ✅ Manage shifts and schedules
- ✅ Manual attendance entry
- ✅ View all reports
- ✅ Manage office locations
- ✅ View audit logs
- ✅ Configure settings

### **EMPLOYEE Role Cannot:**
- ❌ Access admin panel
- ❌ View other employees' data
- ❌ Approve requests
- ❌ Manage system settings

---

## 📱 Responsive Design

### **Desktop** (> 1024px)
- Full sidebar visible
- Wide content area
- Multi-column layouts

### **Tablet** (768px - 1024px)
- Sidebar visible
- Adjusted content width
- Responsive tables

### **Mobile** (< 768px)
- Collapsible sidebar (future enhancement)
- Stacked layouts
- Touch-friendly buttons

---

## 🔍 Search & Filter

### **Available Filters:**
- **Employees**: Name, email, role, department
- **Attendance**: Date range, status, employee
- **Leave**: Status, leave type, date range
- **Overtime**: Status, date range, employee
- **Audit Logs**: User, action type, date range

---

## 📊 Export Options

### **Supported Formats:**
- **Excel (.xlsx)** - Full formatting
- **CSV (.csv)** - Plain data

### **Exportable Data:**
- Employee list
- Attendance records
- Leave history
- Overtime records
- Reports

---

## 🚨 Troubleshooting

### **Page Not Loading?**
- Check if logged in as ADMIN
- Verify backend server is running
- Check browser console for errors
- Clear cache and reload

### **Sidebar Not Highlighting?**
- Check URL matches route exactly
- Ensure `NavLink` is working
- Verify React Router is configured

### **Data Not Updating?**
- Check API response in Network tab
- Verify backend endpoint is correct
- Check authorization token
- Reload page to fetch fresh data

---

## 🔗 Backend Integration

### **Base URL**
```javascript
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
```

### **Authentication**
```javascript
// Token stored in localStorage
const token = localStorage.getItem('access_token')

// Sent in headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

### **Common API Calls**
```javascript
// Get all employees
GET /api/admin/users

// Create employee
POST /api/admin/users

// Approve leave
PUT /api/admin/leave-requests/:id/approve

// Get dashboard stats
GET /api/admin/dashboard-stats
```

---

## 💡 Tips & Best Practices

1. **Always validate** user input before submitting
2. **Show loading states** during API calls
3. **Handle errors** gracefully with toast messages
4. **Refresh data** after CRUD operations
5. **Use confirmations** for delete actions
6. **Keep session alive** with token refresh
7. **Log important actions** for audit trail

---

## 🎯 Next Steps

1. ✅ Login to admin panel
2. ✅ Explore all pages
3. ✅ Create test employee
4. ✅ Test attendance management
5. ✅ Generate sample report
6. ✅ Configure settings
7. ✅ Review audit logs

---

**Need Help?** Check `/docs/ADMIN_REFACTORING.md` for detailed documentation.
