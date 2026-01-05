# Overtime (LEMBUR) Feature Documentation

## 📋 Overview
Fitur Overtime memungkinkan employee untuk mengajukan lembur dan admin untuk meng-approve atau reject request lembur. System menggunakan **HYBRID APPROACH** dengan approval workflow yang ideal.

---

## 🔄 Workflow (OPSI 3 — HYBRID) ⭐

```
1. Employee ajukan overtime
   ↓
2. Sistem validasi jam  
   ↓
3. Admin approve / reject
   ↓
4. Sistem finalkan overtime
```

---

## 📊 Logic Overtime

### **Jam Kerja Normal**
- Jam kerja normal = **8 jam**
- Lebih dari 8 jam → **OVERTIME**

### **Perhitungan**
- **requestedHours**: Jam lembur yang diajukan employee
- **actualHours**: Jam lembur yang di-approve admin (bisa berbeda dari requested)
- Minimum overtime: **0.5 jam**
- Maximum overtime: **12 jam** per hari

---

## 🔹 Employee Endpoints

### **1. Request Overtime**
**Endpoint**: `POST /overtimes/request`

**Description**: Employee mengajukan request overtime dengan memberikan alasan

**Request Body**:
```json
{
  "overtimeDate": "2026-01-03",
  "requestedHours": 3,
  "reason": "Menyelesaikan project deadline untuk client XYZ yang harus selesai besok pagi",
  "attendanceId": 1
}
```

**Field Description**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `overtimeDate` | String | Yes | Tanggal lembur (YYYY-MM-DD) |
| `requestedHours` | Number | Yes | Jam lembur yang diajukan (0.5 - 12) |
| `reason` | String | Yes | Alasan lembur (10-1000 karakter) |
| `attendanceId` | Number | No | ID attendance terkait (optional) |

**Response Success (201)**:
```json
{
  "message": "Overtime request submitted successfully",
  "data": {
    "id": 1,
    "overtimeDate": "2026-01-03T00:00:00.000Z",
    "requestedHours": 3,
    "reason": "Menyelesaikan project deadline untuk client XYZ...",
    "status": "pending",
    "createdAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Validation Rules**:
- ✅ Overtime date harus valid
- ✅ Requested hours: 0.5 - 12 jam
- ✅ Reason: 10-1000 karakter
- ✅ Tidak boleh duplikat request untuk tanggal yang sama
- ✅ Jika attendanceId disediakan, harus match dengan tanggal

---

### **2. Get My Overtime Requests**
**Endpoint**: `GET /overtimes/my-requests`

**Description**: Melihat semua overtime requests (pending/approved/rejected)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status: `pending`, `approved`, `rejected` |

**Examples**:
```bash
# Semua requests
GET /overtimes/my-requests

# Hanya pending
GET /overtimes/my-requests?status=pending

# Hanya approved
GET /overtimes/my-requests?status=approved

# Hanya rejected
GET /overtimes/my-requests?status=rejected
```

**Response Success (200)**:
```json
{
  "message": "My overtime requests",
  "total": 5,
  "data": [
    {
      "id": 1,
      "overtimeDate": "2026-01-03T00:00:00.000Z",
      "requestedHours": 3,
      "actualHours": 2.5,
      "reason": "Menyelesaikan project deadline...",
      "status": "approved",
      "approver": {
        "id": 2,
        "name": "Admin User"
      },
      "approvedAt": "2026-01-03T15:00:00.000Z",
      "rejectionReason": null,
      "attendance": {
        "id": 1,
        "date": "2026-01-03T00:00:00.000Z",
        "clockIn": "2026-01-03T09:00:00.000Z",
        "clockOut": "2026-01-03T19:30:00.000Z",
        "status": "ON_TIME"
      },
      "createdAt": "2026-01-03T10:30:00.000Z"
    }
  ]
}
```

---

### **3. Get My Overtime History**
**Endpoint**: `GET /overtimes/my-history`

**Description**: Melihat history overtime yang sudah approved (untuk perhitungan total jam lembur)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | Number | No | Bulan (1-12), default: bulan ini |
| `year` | Number | No | Tahun, default: tahun ini |

**Examples**:
```bash
# Bulan ini
GET /overtimes/my-history

# Januari 2026
GET /overtimes/my-history?month=1&year=2026

# Desember 2025
GET /overtimes/my-history?month=12&year=2025
```

**Response Success (200)**:
```json
{
  "message": "My overtime history",
  "period": {
    "month": 1,
    "year": 2026
  },
  "summary": {
    "totalOvertimes": 8,
    "totalHours": 24.5
  },
  "data": [
    {
      "id": 1,
      "overtimeDate": "2026-01-03T00:00:00.000Z",
      "requestedHours": 3,
      "actualHours": 2.5,
      "hours": 2.5,
      "reason": "Menyelesaikan project deadline...",
      "approver": {
        "id": 2,
        "name": "Admin User"
      },
      "approvedAt": "2026-01-03T15:00:00.000Z"
    }
  ]
}
```

---

### **4. Cancel Overtime Request**
**Endpoint**: `DELETE /overtimes/:id`

**Description**: Cancel overtime request (hanya yang status pending)

**Response Success (200)**:
```json
{
  "message": "Overtime request cancelled successfully"
}
```

**Error (400)** - Cannot cancel if not pending:
```json
{
  "message": "Can only cancel pending overtime requests"
}
```

---

## 🔹 Admin Endpoints

### **1. Get All Overtime Requests**
**Endpoint**: `GET /overtimes/admin/requests`

**Description**: Admin melihat semua overtime requests dengan filter

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter: `pending`, `approved`, `rejected` |
| `userId` | Number | No | Filter by specific user |
| `startDate` | String | No | Filter from date (YYYY-MM-DD) |
| `endDate` | String | No | Filter to date (YYYY-MM-DD) |

**Examples**:
```bash
# Semua requests
GET /overtimes/admin/requests

# Hanya pending
GET /overtimes/admin/requests?status=pending

# User tertentu
GET /overtimes/admin/requests?userId=1

# Date range
GET /overtimes/admin/requests?startDate=2026-01-01&endDate=2026-01-31

# Kombinasi
GET /overtimes/admin/requests?status=pending&startDate=2026-01-01&endDate=2026-01-31
```

**Response Success (200)**:
```json
{
  "message": "All overtime requests",
  "summary": {
    "total": 25,
    "pending": 5,
    "approved": 18,
    "rejected": 2
  },
  "data": [
    {
      "id": 1,
      "employee": {
        "id": 3,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "overtimeDate": "2026-01-03T00:00:00.000Z",
      "requestedHours": 3,
      "actualHours": null,
      "reason": "Menyelesaikan project deadline...",
      "status": "pending",
      "approver": null,
      "approvedAt": null,
      "rejectionReason": null,
      "attendance": {
        "id": 1,
        "date": "2026-01-03T00:00:00.000Z",
        "clockIn": "2026-01-03T09:00:00.000Z",
        "clockOut": "2026-01-03T18:00:00.000Z",
        "status": "ON_TIME"
      },
      "createdAt": "2026-01-03T10:30:00.000Z"
    }
  ]
}
```

---

### **2. Approve Overtime**
**Endpoint**: `PATCH /overtimes/admin/:id/approve`

**Description**: Admin approve overtime request

**Request Body** (optional):
```json
{
  "actualHours": 2.5
}
```

**Field Description**:
- `actualHours` (optional): Jam lembur yang di-approve (bisa berbeda dari requested)
- Jika tidak disediakan, akan menggunakan `requestedHours`

**Response Success (200)**:
```json
{
  "message": "Overtime approved successfully",
  "data": {
    "id": 1,
    "employee": {
      "id": 3,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "overtimeDate": "2026-01-03T00:00:00.000Z",
    "requestedHours": 3,
    "actualHours": 2.5,
    "status": "approved",
    "approvedAt": "2026-01-03T15:00:00.000Z"
  }
}
```

**Error (400)** - Cannot approve if not pending:
```json
{
  "message": "Cannot approve overtime with status: approved"
}
```

---

### **3. Reject Overtime**
**Endpoint**: `PATCH /overtimes/admin/:id/reject`

**Description**: Admin reject overtime request dengan alasan

**Request Body**:
```json
{
  "rejectionReason": "Tidak ada pekerjaan urgent yang memerlukan lembur pada tanggal tersebut"
}
```

**Field Description**:
- `rejectionReason` (required): Alasan reject (minimum 10 karakter)

**Response Success (200)**:
```json
{
  "message": "Overtime rejected successfully",
  "data": {
    "id": 1,
    "employee": {
      "id": 3,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "overtimeDate": "2026-01-03T00:00:00.000Z",
    "requestedHours": 3,
    "status": "rejected",
    "rejectionReason": "Tidak ada pekerjaan urgent yang memerlukan lembur pada tanggal tersebut",
    "approvedAt": "2026-01-03T15:00:00.000Z"
  }
}
```

---

### **4. Get Overtime Summary**
**Endpoint**: `GET /overtimes/admin/summary`

**Description**: Admin melihat summary overtime dengan filter periode

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | String | No | `daily`, `weekly`, `monthly`, `custom` (default: monthly) |
| `userId` | Number | No | Filter user tertentu |
| `month` | Number | No | Bulan (1-12) |
| `year` | Number | No | Tahun |
| `week` | Number | No | Minggu (1-53) |
| `startDate` | String | Yes* | Tanggal mulai (YYYY-MM-DD) |
| `endDate` | String | Yes* | Tanggal akhir (YYYY-MM-DD) |

*Required hanya untuk period=custom

**Examples**:
```bash
# Summary bulan ini (semua employee)
GET /overtimes/admin/summary?period=monthly

# Summary Januari 2026 (semua employee)
GET /overtimes/admin/summary?period=monthly&month=1&year=2026

# Summary minggu ini (semua employee)
GET /overtimes/admin/summary?period=weekly

# Summary custom range
GET /overtimes/admin/summary?period=custom&startDate=2026-01-01&endDate=2026-01-15

# Summary user tertentu
GET /overtimes/admin/summary?userId=3&period=monthly&month=1&year=2026
```

**Response Success (200) - Semua Employee**:
```json
{
  "message": "Overtime summary for all employees",
  "period": "January 2026",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "overall": {
    "totalEmployees": 20,
    "employeesWithOvertime": 12,
    "totalOvertimes": 45,
    "totalHours": 138.5,
    "averageHoursPerEmployee": 11.54
  },
  "employees": [
    {
      "user": {
        "id": 3,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalOvertimes": 8,
      "totalHours": 24.5
    },
    {
      "user": {
        "id": 5,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "totalOvertimes": 6,
      "totalHours": 18.0
    }
  ]
}
```

**Response Success (200) - Specific User**:
```json
{
  "message": "Overtime summary for user",
  "period": "January 2026",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "user": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "summary": {
    "totalOvertimes": 8,
    "totalHours": 24.5
  },
  "details": [
    {
      "id": 1,
      "overtimeDate": "2026-01-03T00:00:00.000Z",
      "requestedHours": 3,
      "actualHours": 2.5,
      "hours": 2.5,
      "reason": "Menyelesaikan project deadline...",
      "approver": {
        "id": 2,
        "name": "Admin User"
      },
      "approvedAt": "2026-01-03T15:00:00.000Z"
    }
  ]
}
```

---

### **5. Get Pending Count**
**Endpoint**: `GET /overtimes/admin/pending-count`

**Description**: Get jumlah overtime yang pending (untuk notifikasi)

**Response Success (200)**:
```json
{
  "message": "Pending overtime requests count",
  "count": 5
}
```

---

## 📊 Database Schema

### **Table: Overtimes**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INTEGER | No | Primary key |
| `UserId` | INTEGER | No | Foreign key ke Users |
| `AttendanceId` | INTEGER | Yes | Foreign key ke Attandances (optional) |
| `overtimeDate` | DATE | No | Tanggal lembur |
| `clockIn` | DATE | Yes | Waktu mulai lembur |
| `clockOut` | DATE | Yes | Waktu selesai lembur |
| `requestedHours` | DECIMAL(5,2) | No | Jam yang diajukan (0.5-12) |
| `actualHours` | DECIMAL(5,2) | Yes | Jam yang di-approve |
| `reason` | TEXT | No | Alasan lembur |
| `status` | ENUM | No | `pending`, `approved`, `rejected` |
| `approvedBy` | INTEGER | Yes | Foreign key ke Users (admin) |
| `approvedAt` | DATE | Yes | Waktu approve/reject |
| `rejectionReason` | TEXT | Yes | Alasan reject |

---

## 🎯 Use Cases

### **Use Case 1: Employee Request Overtime**
```
1. Employee bekerja sampai jam 20:00 (normal: 18:00)
2. Employee request overtime 2 jam
3. Employee berikan alasan: "Menyelesaikan laporan bulanan"
4. System create request dengan status: pending
```

### **Use Case 2: Admin Approve Overtime**
```
1. Admin lihat pending requests
2. Admin review request dan attendance
3. Admin approve dengan actualHours: 1.5 jam (berbeda dari request 2 jam)
4. Status berubah: approved
5. Employee dapat notifikasi
```

### **Use Case 3: Admin Reject Overtime**
```
1. Admin lihat pending requests
2. Admin review dan tidak setuju
3. Admin reject dengan alasan: "Pekerjaan tidak urgent"
4. Status berubah: rejected
5. Employee dapat notifikasi dengan alasan reject
```

### **Use Case 4: Admin Lihat Summary Lembur Bulan Ini**
```
1. Admin akses summary endpoint
2. Filter: month=1, year=2026
3. System tampilkan:
   - Total employees dengan lembur
   - Total jam lembur semua employee
   - Breakdown per employee (sorted by total hours)
```

---

## ✅ Features Implemented

- ✅ Employee request overtime dengan alasan
- ✅ Validasi jam lembur (min 0.5, max 12)
- ✅ Admin approve/reject dengan reason
- ✅ Admin bisa set actualHours berbeda dari requestedHours
- ✅ Summary overtime per periode (daily/weekly/monthly/custom)
- ✅ Employee bisa lihat history lembur mereka
- ✅ Employee bisa cancel pending request
- ✅ Admin bisa filter by status, user, date range
- ✅ Pending count untuk notifikasi
- ✅ Relasi dengan Attendance (optional)

---

## 🔐 Security & Authorization

- **Employee Endpoints**: Memerlukan authentication, hanya bisa request & lihat data sendiri
- **Admin Endpoints**: Memerlukan authentication + role Admin
- Validation untuk mencegah duplikat request
- Approval hanya bisa dilakukan untuk status pending

---

Fitur Overtime sudah lengkap dan siap digunakan! 🎉
