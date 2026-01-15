# 📊 ADVANCED REPORTING SYSTEM - COMPLETE GUIDE

## 🎯 Overview

Sistem reporting yang comprehensive untuk HR Management System dengan 8 jenis report yang berbeda. Dirancang untuk memenuhi semua kebutuhan reporting mulai dari daily operations sampai enterprise compliance.

---

## 📂 Available Reports

### A. **Attendance Report** 📊
**Most frequently used report**

**Features:**
- Employee Name
- Department
- Position  
- Date
- Clock In / Clock Out
- Work Hours
- Late (minutes)
- Location
- Status (Hadir / Telat / Alpha)

**Filters:**
- Date range (startDate, endDate)
- Department
- Location ID
- Status (ON_TIME, LATE, ABSENT, LEAVE)

**Export Formats:**
- ✅ Excel (.xlsx)
- ✅ CSV (.csv)
- 🔜 PDF (future)

**Endpoint:**
```
GET /reports/advanced/attendance
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&department=IT
&status=LATE
&format=excel
```

**Use Case:**
- Daily/weekly attendance monitoring
- Department performance tracking
- Absence analysis

---

### B. **Monthly Recap Report** 📅
**For payroll processing**

**Features:**
- Total hadir (present days)
- Total telat (late count)
- Total alpha (absent days)
- Total jam kerja (total work hours)
- Overtime hours

**Group By:**
- Per Employee
- Per Department

**Filters:**
- Month (1-12)
- Year
- groupBy (employee/department)

**Export Format:**
- ✅ Excel (.xlsx) with multiple sheets

**Endpoint:**
```
GET /reports/advanced/monthly-recap
```

**Query Parameters:**
```
?month=1
&year=2026
&groupBy=employee
```

**Use Case:**
- Monthly payroll preparation
- Department performance comparison
- HR KPI tracking

---

### C. **Overtime Report** ⏰

**Features:**
- Employee Name
- Department
- Date
- Overtime Hours (requested & actual)
- Reason
- Approved By
- Status (pending/approved/rejected)

**Filters:**
- Date range
- Status
- User ID
- Department

**Export Format:**
- ✅ Excel (.xlsx)

**Endpoint:**
```
GET /reports/advanced/overtime
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&status=approved
&department=IT
```

**Use Case:**
- Overtime cost tracking
- Employee overtime analysis
- Approval history

---

### D. **Leave Report** 🏖️

**Features:**
- Employee Name
- Department
- Leave Type (annual/sick/permission)
- Start Date
- End Date
- Duration (days)
- Status (approved/rejected/pending)
- Remaining Leave Quota

**Filters:**
- Date range
- Leave Type
- Status
- User ID
- Department

**Export Format:**
- ✅ Excel (.xlsx)

**Endpoint:**
```
GET /reports/advanced/leave
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-12-31
&leaveType=annual_leave
&status=approved
```

**Use Case:**
- Leave balance tracking
- Annual leave planning
- Leave pattern analysis

---

### E. **Payroll Support Report** 💰
**Export untuk integrasi dengan software payroll eksternal**

**Features:**
- Total Working Days
- Total Work Hours
- Overtime Hours
- Late Count
- Late Penalty (total minutes)
- Absent Days
- Unpaid Leave Days

**Filters:**
- Month (required)
- Year (required)

**Export Format:**
- ✅ Excel (.xlsx) - optimized untuk payroll import

**Endpoint:**
```
GET /reports/advanced/payroll-support
```

**Query Parameters:**
```
?month=1
&year=2026
```

**Use Case:**
- Export ke Talenta, Gadjian, dll
- Salary calculation support
- Payroll verification

**Integration Support:**
- Formatted untuk easy import
- Standardized columns
- Ready untuk formula payroll

---

### F. **Location & GPS Report** 📍
**🔥 Premium Feature - Value differentiator**

**Features:**
- Clock-in Location
- GPS Coordinates (latitude, longitude)
- Distance from Office
- Validation Status (Inside/Outside Radius)
- Clock-out Location & GPS

**Filters:**
- Date range
- Validation Status (inside_radius/outside_radius/not_checked)

**Export Format:**
- ✅ Excel (.xlsx) with GPS data

**Endpoint:**
```
GET /reports/advanced/location-gps
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&validationStatus=outside_radius
```

**Use Case:**
- Field employee tracking
- GPS compliance monitoring
- Location-based attendance verification
- Fraud detection

**Why Premium:**
- Real GPS tracking
- Distance calculation
- Geofencing validation
- Map preview capability (future)

---

### G. **Audit Log Report** 🔒
**ENTERPRISE Feature**

**Features:**
- User (who performed action)
- Action (CREATE/UPDATE/DELETE/EXPORT)
- Module (Attendance/Employee/Leave/Overtime)
- Record ID
- Before (old data)
- After (new data)
- Timestamp
- IP Address

**Filters:**
- Date range
- User ID
- Module (tableName)
- Action type

**Export Format:**
- ✅ Excel (.xlsx)

**Endpoint:**
```
GET /reports/advanced/audit-log
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&module=Attendance
&action=UPDATE
&userId=5
```

**Use Case:**
- Security audit
- Compliance reporting
- Change tracking
- Investigation & forensics
- SOC 2 / ISO 27001 compliance

**Why Enterprise:**
- Full audit trail
- Before/after tracking
- IP logging
- User activity monitoring
- Regulatory compliance

---

### H. **Compliance / Violation Report** ⚠️
**Smart anomaly detection**

**Features:**
- Employee Name
- Department
- Late Count (total telat)
- Clock-in without Photo
- GPS Violations (outside radius)
- Risk Level (Low/Medium/High)

**Automatic Detection:**
- Telat > X kali
- Alpha berturut-turut
- Clock-in tanpa foto
- Suspicious GPS (fake GPS detection)

**Filters:**
- Date range
- Department

**Export Format:**
- ✅ Excel (.xlsx) with risk scoring

**Endpoint:**
```
GET /reports/advanced/compliance
```

**Query Parameters:**
```
?startDate=2026-01-01
&endDate=2026-01-31
&department=IT
```

**Use Case:**
- Early warning system
- Employee discipline tracking
- Policy compliance monitoring
- Fraud prevention

**Risk Level Logic:**
- **Low**: < 5 total violations
- **Medium**: 5-10 violations
- **High**: > 10 violations

---

## 🛠️ Implementation

### Backend Files

1. **Helper:** `/server/helpers/reportAdvanced.js`
   - All report generation logic
   - Excel formatting
   - CSV generation
   - Data aggregation

2. **Controller:** `/server/controllers/reportAdvancedController.js`
   - All 8 report endpoints
   - Filtering logic
   - Data fetching
   - Audit logging

3. **Routes:** `/server/routes/reportAdvanced_isAdmin.js`
   - Route definitions
   - Authentication & authorization
   - Admin-only access

### Frontend Files

1. **Component:** `/client_Salmon-HRIS/src/components/admin/ReportAnalytics.jsx`
   - Tab-based UI for all 8 reports
   - Filter management
   - Download handlers
   - Metadata display

### Registration

**Backend:** `/server/routes/index.js`
```javascript
const reportAdvanced_isAdminRouter = require('./reportAdvanced_isAdmin');
router.use('/reports/advanced', isAdmin, reportAdvanced_isAdminRouter);
```

**Frontend:** Already integrated in admin dashboard

---

## 📝 Usage Examples

### 1. Download Attendance Report (Excel)
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/attendance?startDate=2026-01-01&endDate=2026-01-31&format=excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output attendance.xlsx
```

### 2. Monthly Recap by Department
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/monthly-recap?month=1&year=2026&groupBy=department" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output monthly_recap.xlsx
```

### 3. Overtime Report (Approved Only)
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/overtime?status=approved&startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output overtime.xlsx
```

### 4. Payroll Support Export
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/payroll-support?month=1&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output payroll_data.xlsx
```

### 5. GPS Violations Report
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/location-gps?validationStatus=outside_radius" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output gps_violations.xlsx
```

### 6. Audit Log Export
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/audit-log?module=Attendance&action=UPDATE" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output audit_log.xlsx
```

### 7. Compliance Report
```bash
curl -X GET \
  "http://localhost:3000/reports/advanced/compliance?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output compliance.xlsx
```

---

## 🎨 Frontend Features

### Tab-Based Interface
- 8 different tabs for each report type
- Color-coded tabs for easy navigation
- Icon indicators for visual clarity

### Smart Filters
- Contextual filters per report type
- Auto-validation
- Date pickers
- Dropdown selections

### Metadata Dashboard
- Total Attendances
- Total Employees
- Total Overtimes
- Total Leaves
- Total Departments

### Download Handlers
- Progress indicators
- Error handling
- Filename generation
- Multiple format support

---

## 🔐 Security & Authorization

**All endpoints require:**
- ✅ Authentication (JWT Bearer Token)
- ✅ Admin Role
- ✅ Audit Logging (all exports logged)

**Middleware Stack:**
```javascript
router.use(authenticateToken);
router.use(isAdmin);
```

---

## 📊 Excel Formatting

**All Excel reports include:**
- Professional headers with colors
- Auto-width columns
- Cell borders
- Status color coding:
  - 🟢 Green: ON_TIME, Approved, Inside Radius
  - 🟡 Yellow: LATE, Pending
  - 🔴 Red: ABSENT, Rejected, Outside Radius
- Title sections
- Filter information
- Generation timestamps

---

## 💡 Best Practices

### Performance
1. **Use date filters** - Limit data size
2. **Async processing** - For large datasets
3. **Pagination** - For preview (metadata endpoint)
4. **Caching** - For frequently accessed reports

### Data Integrity
1. **Audit logging** - All exports tracked
2. **Validation** - Input parameter validation
3. **Error handling** - Graceful error responses

### User Experience
1. **Loading indicators** - Show progress
2. **Error messages** - Clear error feedback
3. **File naming** - Descriptive filenames with timestamps
4. **Format options** - Multiple export formats

---

## 🚀 Future Enhancements

### Planned Features
- [ ] PDF export support
- [ ] Scheduled reports (email automation)
- [ ] Chart visualization in Excel
- [ ] Custom report builder
- [ ] Real-time preview before download
- [ ] Report templates
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### Premium Additions
- [ ] Map visualization for GPS data
- [ ] Heatmap for attendance patterns
- [ ] Predictive analytics
- [ ] Custom KPI tracking
- [ ] API for third-party integration

---

## 🎯 Competitive Advantages

### What Makes This System Unique

1. **8 Comprehensive Reports** - Most HRIS have 3-4 basic reports
2. **GPS Tracking** - Premium feature many competitors lack
3. **Full Audit Trail** - Enterprise-grade compliance
4. **Smart Violations** - AI-powered anomaly detection
5. **Payroll Integration** - Ready for external software
6. **Department Analytics** - Multi-dimensional reporting
7. **Professional Excel** - Publication-ready formatting
8. **Real-time Metadata** - Dashboard insights

---

## 📞 API Reference Quick Sheet

| Report | Endpoint | Required Params | Optional Params |
|--------|----------|-----------------|-----------------|
| Attendance | `/reports/advanced/attendance` | - | startDate, endDate, department, status, format |
| Monthly Recap | `/reports/advanced/monthly-recap` | month, year | groupBy |
| Overtime | `/reports/advanced/overtime` | - | startDate, endDate, status, department |
| Leave | `/reports/advanced/leave` | - | startDate, endDate, leaveType, status |
| Payroll Support | `/reports/advanced/payroll-support` | month, year | - |
| Location GPS | `/reports/advanced/location-gps` | - | startDate, endDate, validationStatus |
| Audit Log | `/reports/advanced/audit-log` | - | startDate, endDate, module, action |
| Compliance | `/reports/advanced/compliance` | - | startDate, endDate, department |
| Metadata | `/reports/advanced/metadata` | - | startDate, endDate |

---

## ✅ Testing Checklist

- [ ] Test all 8 report endpoints
- [ ] Verify filters working correctly
- [ ] Check Excel formatting
- [ ] Test CSV export
- [ ] Validate audit logging
- [ ] Test with large datasets
- [ ] Verify authorization (admin-only)
- [ ] Test error handling
- [ ] Check filename generation
- [ ] Verify metadata endpoint

---

## 📚 Related Documentation

- [Attendance Features](./ATTENDANCE_FEATURES.md)
- [Audit Log System](./AUDIT_LOG_SYSTEM.md)
- [GPS Geofencing](./GPS_GEOFENCING_FEATURE.md)
- [Leave Request System](./LEAVE_REQUEST_SYSTEM.md)
- [Overtime Management](./OVERTIME_SYSTEM.md)

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Author:** Salmon HRIS Development Team

---

## 🎓 Summary

Sistem reporting ini memberikan **comprehensive solution** untuk semua kebutuhan reporting HR Management:

✅ **Daily Operations** - Attendance Report  
✅ **Payroll Processing** - Monthly Recap & Payroll Support  
✅ **Compliance** - Audit Log & Compliance Report  
✅ **Premium Features** - GPS Tracking & Location Report  
✅ **Employee Management** - Leave & Overtime Reports  

**Key Differentiators:**
- 8 specialized reports vs competitor's 3-4 basic reports
- Enterprise-grade audit trail
- GPS tracking & geofencing
- Payroll software integration ready
- Smart violation detection
- Professional Excel formatting

This positions the HRIS as a **premium, enterprise-ready solution** in the market! 🚀
