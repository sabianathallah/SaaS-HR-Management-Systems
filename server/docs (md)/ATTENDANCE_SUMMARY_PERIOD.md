# Attendance Summary - Period Filter Documentation

## Overview
Fitur Attendance Summary memungkinkan pengguna (employee dan admin) untuk melihat ringkasan kehadiran berdasarkan berbagai periode: harian, mingguan, bulanan, atau custom range.

---

## 📊 Summary Information

Setiap summary akan menampilkan:
- **Total Present**: Total hadir (tepat waktu + terlambat + izin)
- **On Time**: Jumlah hadir tepat waktu
- **Late**: Jumlah terlambat
- **Absent**: Jumlah tidak hadir
- **Leave**: Jumlah cuti
- **Sick Leave**: Jumlah sakit
- **Permission**: Jumlah izin
- **Holiday**: Jumlah hari libur
- **Total Work Hours**: Total jam kerja
- **Attendance Rate**: Persentase kehadiran

---

## 🔹 Employee Endpoints

### **1. Get My Attendance Statistics**
**Endpoint**: `GET /attendances/statistics`

**Description**: Employee dapat melihat statistik kehadiran mereka sendiri dengan berbagai filter periode

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `period` | String | No | Tipe periode: `daily`, `weekly`, `monthly`, `custom` | `monthly` |
| `month` | Number | No | Bulan (1-12), untuk period `monthly` | `1` |
| `year` | Number | No | Tahun, untuk period `monthly` atau `weekly` | `2026` |
| `week` | Number | No | Minggu ke- (1-53), untuk period `weekly` | `2` |
| `startDate` | String | Yes* | Tanggal mulai (YYYY-MM-DD), untuk period `custom` | `2026-01-01` |
| `endDate` | String | Yes* | Tanggal akhir (YYYY-MM-DD), untuk period `custom` | `2026-01-31` |

*Required only for `custom` period

---

### **Example 1: Daily Summary**
```bash
GET /attendances/statistics?period=daily
```

**Response**:
```json
{
  "message": "My attendance statistics",
  "data": {
    "period": "Daily - 2026-01-03",
    "dateRange": {
      "start": "2026-01-03",
      "end": "2026-01-03"
    },
    "summary": {
      "totalRecords": 1,
      "totalPresent": 1,
      "onTime": 1,
      "late": 0,
      "absent": 0,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 8.5,
      "attendanceRate": 100,
      "totalWorkDays": 1
    },
    "details": [...]
  }
}
```

---

### **Example 2: Weekly Summary**
```bash
GET /attendances/statistics?period=weekly&year=2026&week=1
```

**Response**:
```json
{
  "message": "My attendance statistics",
  "data": {
    "period": "Week 1, 2026",
    "dateRange": {
      "start": "2025-12-29",
      "end": "2026-01-04"
    },
    "summary": {
      "totalRecords": 5,
      "totalPresent": 4,
      "onTime": 3,
      "late": 1,
      "absent": 1,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 34.5,
      "attendanceRate": 80,
      "totalWorkDays": 5
    },
    "details": [...]
  }
}
```

---

### **Example 3: Monthly Summary**
```bash
GET /attendances/statistics?period=monthly&month=1&year=2026
```

**Response**:
```json
{
  "message": "My attendance statistics",
  "data": {
    "period": "January 2026",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalRecords": 22,
      "totalPresent": 20,
      "onTime": 18,
      "late": 2,
      "absent": 2,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 168.5,
      "attendanceRate": 90.91,
      "totalWorkDays": 22
    },
    "details": [...]
  }
}
```

---

### **Example 4: Custom Range Summary**
```bash
GET /attendances/statistics?period=custom&startDate=2026-01-01&endDate=2026-01-15
```

**Response**:
```json
{
  "message": "My attendance statistics",
  "data": {
    "period": "Custom: 2026-01-01 to 2026-01-15",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-15"
    },
    "summary": {
      "totalRecords": 11,
      "totalPresent": 10,
      "onTime": 9,
      "late": 1,
      "absent": 1,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 84.5,
      "attendanceRate": 90.91,
      "totalWorkDays": 11
    },
    "details": [...]
  }
}
```

---

## 🔹 Admin Endpoints

### **2. Get Attendance Summary (All or Specific User)**
**Endpoint**: `GET /attendances/admin/summary`

**Description**: Admin dapat melihat ringkasan kehadiran untuk semua karyawan atau karyawan tertentu

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `userId` | Number | No | ID user tertentu (jika kosong, tampilkan semua) | `1` |
| `period` | String | No | Tipe periode: `daily`, `weekly`, `monthly`, `custom` | `monthly` |
| `month` | Number | No | Bulan (1-12) | `1` |
| `year` | Number | No | Tahun | `2026` |
| `week` | Number | No | Minggu ke- (1-53) | `2` |
| `startDate` | String | Yes* | Tanggal mulai (YYYY-MM-DD) | `2026-01-01` |
| `endDate` | String | Yes* | Tanggal akhir (YYYY-MM-DD) | `2026-01-31` |

*Required only for `custom` period

---

### **Example 1: Summary for Specific User (Monthly)**
```bash
GET /attendances/admin/summary?userId=1&period=monthly&month=1&year=2026
Authorization: Bearer ADMIN_TOKEN
```

**Response**:
```json
{
  "message": "Attendance summary for user",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "data": {
    "period": "January 2026",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalRecords": 22,
      "totalPresent": 20,
      "onTime": 18,
      "late": 2,
      "absent": 2,
      "leave": 0,
      "sickLeave": 0,
      "permission": 0,
      "holiday": 0,
      "totalWorkHours": 168.5,
      "attendanceRate": 90.91,
      "totalWorkDays": 22
    },
    "details": [...]
  }
}
```

---

### **Example 2: Summary for All Employees (Weekly)**
```bash
GET /attendances/admin/summary?period=weekly&year=2026&week=1
Authorization: Bearer ADMIN_TOKEN
```

**Response**:
```json
{
  "message": "Attendance summary for all employees",
  "period": "Week 1, 2026",
  "dateRange": {
    "start": "2025-12-29",
    "end": "2026-01-04"
  },
  "overall": {
    "totalEmployees": 10,
    "totalPresent": 45,
    "totalOnTime": 40,
    "totalLate": 5,
    "totalAbsent": 5,
    "totalLeave": 0,
    "totalSickLeave": 0,
    "totalPermission": 0,
    "totalHoliday": 0,
    "totalWorkHours": 382.5,
    "averageAttendanceRate": 90.0
  },
  "employees": [
    {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "summary": {
        "totalRecords": 5,
        "totalPresent": 4,
        "onTime": 3,
        "late": 1,
        "absent": 1,
        "leave": 0,
        "sickLeave": 0,
        "permission": 0,
        "holiday": 0,
        "totalWorkHours": 34.5,
        "attendanceRate": 80.0,
        "totalWorkDays": 5
      }
    },
    // ... more employees
  ]
}
```

---

### **Example 3: Summary for All Employees (Custom Range)**
```bash
GET /attendances/admin/summary?period=custom&startDate=2026-01-01&endDate=2026-01-15
Authorization: Bearer ADMIN_TOKEN
```

**Response**: Similar to weekly, but with custom date range

---

## 📋 Period Types Summary

| Period Type | Required Params | Optional Params | Description |
|-------------|----------------|-----------------|-------------|
| `daily` | - | - | Hari ini |
| `weekly` | - | `year`, `week` | Minggu tertentu (default: minggu ini) |
| `monthly` | - | `month`, `year` | Bulan tertentu (default: bulan ini) |
| `custom` | `startDate`, `endDate` | - | Range tanggal custom |

---

## 🎯 Use Cases

### **1. Employee - Cek Kehadiran Bulan Ini**
```bash
GET /attendances/statistics?period=monthly
```

### **2. Employee - Cek Kehadiran Minggu Ini**
```bash
GET /attendances/statistics?period=weekly
```

### **3. Employee - Cek Kehadiran Hari Ini**
```bash
GET /attendances/statistics?period=daily
```

### **4. Employee - Cek Kehadiran Custom (1-15 Januari)**
```bash
GET /attendances/statistics?period=custom&startDate=2026-01-01&endDate=2026-01-15
```

### **5. Admin - Lihat Summary Semua Karyawan Bulan Ini**
```bash
GET /attendances/admin/summary?period=monthly&month=1&year=2026
```

### **6. Admin - Lihat Summary Karyawan Tertentu Minggu Ini**
```bash
GET /attendances/admin/summary?userId=1&period=weekly
```

### **7. Admin - Lihat Summary Semua Karyawan Custom Range**
```bash
GET /attendances/admin/summary?period=custom&startDate=2026-01-01&endDate=2026-01-31
```

---

## ⚠️ Error Responses

### **Invalid Period**
```json
{
  "message": "Invalid period. Must be one of: daily, weekly, monthly, custom"
}
```

### **Missing Custom Date**
```json
{
  "message": "For custom period, both startDate and endDate are required (format: YYYY-MM-DD)"
}
```

### **Invalid Month**
```json
{
  "message": "Invalid month. Must be between 1 and 12"
}
```

### **Invalid Week**
```json
{
  "message": "Invalid week. Must be between 1 and 53"
}
```

### **Invalid Year**
```json
{
  "message": "Invalid year. Must be between 2000 and 2100"
}
```

### **User Not Found (Admin)**
```json
{
  "message": "User not found"
}
```

---

## 📊 Statistics Calculation

### **Attendance Rate Formula**
```
Attendance Rate = (Total Present / Effective Work Days) × 100%

Where:
- Total Present = On Time + Late + Permission
- Effective Work Days = Total Present + Absent
- Excludes: Holiday, Leave, Sick Leave
```

### **Total Work Days**
```
Total Work Days = Total Present + Absent + Leave + Sick Leave
(Excludes holidays)
```

---

## 🧪 Testing Examples

### **Postman Collection**

#### **Test 1: Employee Monthly Summary**
```
GET http://localhost:3000/attendances/statistics?period=monthly&month=1&year=2026
Authorization: Bearer EMPLOYEE_TOKEN
```

#### **Test 2: Employee Weekly Summary**
```
GET http://localhost:3000/attendances/statistics?period=weekly&year=2026&week=1
Authorization: Bearer EMPLOYEE_TOKEN
```

#### **Test 3: Admin All Employees Custom Range**
```
GET http://localhost:3000/attendances/admin/summary?period=custom&startDate=2026-01-01&endDate=2026-01-15
Authorization: Bearer ADMIN_TOKEN
```

#### **Test 4: Admin Specific Employee Monthly**
```
GET http://localhost:3000/attendances/admin/summary?userId=1&period=monthly&month=1&year=2026
Authorization: Bearer ADMIN_TOKEN
```

---

## 📝 Notes

1. **Default Period**: Jika parameter `period` tidak disediakan, default adalah `monthly`
2. **Default Month/Year**: Jika tidak disediakan, menggunakan bulan dan tahun saat ini
3. **Week Calculation**: Minggu dimulai dari Senin sampai Minggu (ISO 8601)
4. **Custom Range**: Bisa digunakan untuk periode apapun (tidak terbatas bulanan/mingguan)
5. **Admin Access**: Endpoint admin memerlukan role Admin
6. **Employee Access**: Employee hanya bisa melihat data mereka sendiri

---

## ✅ Features Implemented

- ✅ Filter periode: Daily, Weekly, Monthly, Custom
- ✅ Summary statistik lengkap (hadir, terlambat, absent, dll)
- ✅ Perhitungan attendance rate otomatis
- ✅ Total jam kerja per periode
- ✅ Detail attendance per hari
- ✅ Admin bisa lihat semua karyawan atau per karyawan
- ✅ Employee bisa lihat data mereka sendiri

---

Semua endpoint sudah siap digunakan! 🎉
