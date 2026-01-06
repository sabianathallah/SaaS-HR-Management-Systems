# 📊 Export & Report Endpoints

Dokumentasi lengkap untuk fitur export dan report attendance dalam sistem HR Management.

## 🔐 Authentication & Authorization

Semua endpoint di bawah ini memerlukan:
- **Authentication**: Bearer token (JWT)
- **Authorization**: Role ADMIN

**Base URL**: `/reports`

---

## 📑 Table of Contents

1. [Export to Excel](#1-export-attendance-to-excel)
2. [Export to CSV](#2-export-attendance-to-csv)
3. [Monthly Report](#3-generate-monthly-report)
4. [Report Preview](#4-get-report-preview)
5. [Employee Performance](#5-get-employee-performance-report)

---

## 1. Export Attendance to Excel

Export data attendance ke format Excel (.xlsx) dengan formatting dan summary.

### Endpoint
```
GET /reports/export/excel
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | Date (YYYY-MM-DD) | No | Tanggal mulai filter |
| `endDate` | Date (YYYY-MM-DD) | No | Tanggal akhir filter |
| `userId` | Integer | No | Filter berdasarkan user ID tertentu |
| `status` | String | No | Filter berdasarkan status (ON_TIME, LATE, ABSENT, dll) |

### Example Request

```bash
curl -X GET \
  'http://localhost:3000/reports/export/excel?startDate=2025-12-01&endDate=2025-12-31&status=ON_TIME' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --output attendance_report.xlsx
```

### Response

**Success (200)**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary file download (Excel)

**Error (404)**
```json
{
  "status": "error",
  "message": "No attendance data found for the specified criteria"
}
```

**Error (500)**
```json
{
  "status": "error",
  "message": "Failed to export attendance data to Excel",
  "error": "Error details..."
}
```

### Excel File Structure

File Excel yang dihasilkan berisi:
- **Headers**: Employee ID, Employee Name, Date, Check In, Check Out, Status, Work Hours, Overtime Hours, Shift, Location, Notes
- **Data Rows**: Semua attendance records sesuai filter
- **Summary Section** (di bawah):
  - Total Records
  - Total Work Hours
  - Total Overtime Hours

---

## 2. Export Attendance to CSV

Export data attendance ke format CSV untuk kompatibilitas dengan berbagai tools.

### Endpoint
```
GET /reports/export/csv
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | Date (YYYY-MM-DD) | No | Tanggal mulai filter |
| `endDate` | Date (YYYY-MM-DD) | No | Tanggal akhir filter |
| `userId` | Integer | No | Filter berdasarkan user ID tertentu |
| `status` | String | No | Filter berdasarkan status |

### Example Request

```bash
curl -X GET \
  'http://localhost:3000/reports/export/csv?startDate=2025-12-01&endDate=2025-12-31' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --output attendance_report.csv
```

### Response

**Success (200)**
- Content-Type: `text/csv`
- CSV file download

**Error (404)**
```json
{
  "status": "error",
  "message": "No attendance data found for the specified criteria"
}
```

### CSV Format

```csv
Employee ID,Employee Name,Date,Check In,Check Out,Status,Work Hours,Overtime Hours,Shift,Location (Check In),Location (Check Out),Notes
EMP001,John Doe,2025-12-01,08:00:00,17:00:00,ON_TIME,8.00,0.00,Morning Shift,Office A,Office A,-
...
```

---

## 3. Generate Monthly Report

Generate comprehensive monthly attendance report dalam format Excel dengan multiple sheets.

### Endpoint
```
GET /reports/monthly
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | Integer (1-12) | **Yes** | Bulan (1 = January, 12 = December) |
| `year` | Integer | **Yes** | Tahun (contoh: 2025) |

### Example Request

```bash
curl -X GET \
  'http://localhost:3000/reports/monthly?month=12&year=2025' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --output monthly_report_12_2025.xlsx
```

### Response

**Success (200)**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Excel file dengan 3 sheets

**Error (400)**
```json
{
  "status": "error",
  "message": "Month and year parameters are required"
}
```

```json
{
  "status": "error",
  "message": "Month must be between 1 and 12"
}
```

**Error (404)**
```json
{
  "status": "error",
  "message": "No attendance data found for 12/2025"
}
```

### Excel File Structure

#### Sheet 1: Monthly Summary
- Judul report dengan bulan dan tahun
- Overall statistics:
  - Total Attendance Records
  - Total Employees
  - Total Work Hours
  - Total Overtime Hours
- Status breakdown dengan persentase

#### Sheet 2: Employee Statistics
Tabel dengan kolom:
- Employee ID
- Employee Name
- Total Days
- Present
- Late
- Absent
- Work Hours
- Overtime Hours
- Attendance Rate (%)

#### Sheet 3: Detailed Attendance
Semua attendance records untuk bulan tersebut dengan detail lengkap.

---

## 4. Get Report Preview

Preview data report dalam format JSON sebelum di-export (untuk UI preview).

### Endpoint
```
GET /reports/preview
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | Date (YYYY-MM-DD) | No | Tanggal mulai filter |
| `endDate` | Date (YYYY-MM-DD) | No | Tanggal akhir filter |
| `userId` | Integer | No | Filter berdasarkan user ID |
| `status` | String | No | Filter berdasarkan status |
| `limit` | Integer | No | Limit jumlah records (default: 100) |

### Example Request

```bash
curl -X GET \
  'http://localhost:3000/reports/preview?startDate=2025-12-01&endDate=2025-12-31&limit=50' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

**Success (200)**
```json
{
  "status": "success",
  "message": "Report preview retrieved successfully",
  "data": {
    "summary": {
      "totalRecords": 250,
      "previewRecords": 50,
      "totalWorkHours": "2000.50",
      "totalOvertimeHours": "125.75",
      "statusBreakdown": {
        "ON_TIME": 180,
        "LATE": 45,
        "ABSENT": 15,
        "LEAVE": 10
      }
    },
    "attendances": [
      {
        "id": 1,
        "UserId": 5,
        "date": "2025-12-01",
        "checkInTime": "2025-12-01T08:00:00.000Z",
        "checkOutTime": "2025-12-01T17:00:00.000Z",
        "status": "ON_TIME",
        "workHours": "8.00",
        "overtimeHours": "0.00",
        "User": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com",
          "employeeId": "EMP001"
        },
        "WorkSchedule": {
          "id": 1,
          "name": "Morning Shift",
          "startTime": "08:00:00",
          "endTime": "17:00:00"
        }
      }
      // ... more records
    ],
    "filters": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-31",
      "userId": null,
      "status": null
    }
  }
}
```

---

## 5. Get Employee Performance Report

Mendapatkan laporan performa individual employee dengan statistik lengkap.

### Endpoint
```
GET /reports/employee-performance
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | Integer | **Yes** | ID user yang akan dilihat performancenya |
| `startDate` | Date (YYYY-MM-DD) | No | Tanggal mulai (default: awal bulan ini) |
| `endDate` | Date (YYYY-MM-DD) | No | Tanggal akhir (default: akhir bulan ini) |

### Example Request

```bash
curl -X GET \
  'http://localhost:3000/reports/employee-performance?userId=5&startDate=2025-12-01&endDate=2025-12-31' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Response

**Success (200)**
```json
{
  "status": "success",
  "message": "Employee performance report retrieved successfully",
  "data": {
    "employee": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP001",
      "role": "employee"
    },
    "period": {
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z"
    },
    "statistics": {
      "totalDays": 22,
      "onTime": 18,
      "late": 3,
      "absent": 1,
      "leave": 2,
      "totalWorkHours": "176.00",
      "totalOvertimeHours": "8.50",
      "averageWorkHours": "8.00",
      "attendanceRate": "95.45"
    },
    "attendances": [
      {
        "id": 1,
        "UserId": 5,
        "date": "2025-12-01",
        "checkInTime": "2025-12-01T08:00:00.000Z",
        "checkOutTime": "2025-12-01T17:00:00.000Z",
        "status": "ON_TIME",
        "workHours": "8.00",
        "overtimeHours": "0.00",
        "WorkSchedule": {
          "id": 1,
          "name": "Morning Shift",
          "startTime": "08:00:00",
          "endTime": "17:00:00"
        }
      }
      // ... more attendance records
    ]
  }
}
```

**Error (400)**
```json
{
  "status": "error",
  "message": "User ID is required"
}
```

**Error (404)**
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

## 📝 Audit Logging

Semua operasi export dan generate report akan tercatat di audit log dengan informasi:
- User ID yang melakukan export
- Action type: `EXPORT`
- Entity: `Attendance`
- Details: filters, record count, format
- IP Address
- Timestamp

---

## 🔍 Use Cases

### Use Case 1: Monthly Payroll Processing
Admin export monthly report untuk proses payroll:
```bash
curl -X GET \
  'http://localhost:3000/reports/monthly?month=12&year=2025' \
  -H 'Authorization: Bearer TOKEN' \
  --output payroll_data_dec_2025.xlsx
```

### Use Case 2: Individual Performance Review
HR review performa karyawan tertentu:
```bash
curl -X GET \
  'http://localhost:3000/reports/employee-performance?userId=5&startDate=2025-10-01&endDate=2025-12-31' \
  -H 'Authorization: Bearer TOKEN'
```

### Use Case 3: Quick Data Analysis
Export data tertentu ke CSV untuk analisis di Excel/Google Sheets:
```bash
curl -X GET \
  'http://localhost:3000/reports/export/csv?startDate=2025-12-01&endDate=2025-12-31&status=LATE' \
  -H 'Authorization: Bearer TOKEN' \
  --output late_attendance_dec.csv
```

### Use Case 4: Preview Before Export
Preview data sebelum export untuk memastikan filter sudah benar:
```bash
curl -X GET \
  'http://localhost:3000/reports/preview?startDate=2025-12-01&endDate=2025-12-31&limit=10' \
  -H 'Authorization: Bearer TOKEN'
```

---

## 🛠️ Technical Details

### Dependencies
- **exceljs**: ^4.4.0 - untuk generate Excel files
- **json2csv**: ^6.0.0-alpha.2 - untuk generate CSV files

### File Naming Convention
- Excel Export: `attendance_report_[timestamp].xlsx`
- CSV Export: `attendance_report_[timestamp].csv`
- Monthly Report: `monthly_report_[month]_[year].xlsx`

### Performance Considerations
- Large datasets mungkin memerlukan waktu processing lebih lama
- Recommended untuk menggunakan filter date range untuk membatasi data
- Preview endpoint sudah memiliki limit default (100 records) untuk performa

### Excel Styling
- Headers dengan background biru (`#4472C4`) dan bold text
- Borders pada semua cells
- Auto-width columns
- Summary sections dengan bold text
- Color-coded sheets (hijau untuk employee stats, kuning untuk detail)

---

## ⚠️ Error Handling

Semua endpoint menangani error dengan format konsisten:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": "Technical error details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (bukan admin)
- `404` - Not Found (no data found)
- `500` - Internal Server Error

---

## 📚 Related Documentation

- [Attendance Features](./ATTENDANCE_FEATURES.md)
- [Admin Endpoints](./ADMIN_ENDPOINTS.md)
- [Audit Log System](./AUDIT_LOG_SYSTEM.md)

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0
