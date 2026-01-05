# Implementation Summary - Overtime (LEMBUR) Feature

## ✅ Fitur Yang Telah Diimplementasikan

Saya telah berhasil mengimplementasikan **Fitur Overtime (Lembur)** lengkap dengan approval workflow **HYBRID** sesuai permintaan Anda!

---

## 🎯 Fitur Utama

### **5️⃣ OVERTIME (LEMBUR)**

✅ **Logic Sederhana**:
- Jam kerja normal = **8 jam**
- Lebih dari itu → **OVERTIME**

✅ **Admin Bisa**:
- ✅ Lihat total lembur (per hari/minggu/bulan/custom)
- ✅ Approve lembur
- ✅ Reject lembur dengan alasan
- ✅ Lihat siapa saja employee yang lembur
- ✅ Set actual hours berbeda dari requested hours

✅ **Employee Bisa**:
- ✅ Ajukan overtime dengan alasan lengkap
- ✅ Lihat status request (pending/approved/rejected)
- ✅ Lihat history overtime yang sudah approved
- ✅ Cancel pending request
- ✅ Lihat total jam lembur per bulan

---

## 🔄 Workflow (HYBRID APPROACH)

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣ EMPLOYEE AJUKAN OVERTIME                         │
│    - Tanggal lembur                                 │
│    - Jam yang diminta (0.5 - 12 jam)               │
│    - Alasan lengkap (wajib, min 10 karakter)       │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 2️⃣ SISTEM VALIDASI JAM                              │
│    ✓ Min 0.5 jam, Max 12 jam                       │
│    ✓ Tidak boleh duplikat untuk tanggal yang sama  │
│    ✓ Alasan harus lengkap                          │
│    Status: PENDING                                  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 3️⃣ ADMIN APPROVE / REJECT                           │
│    Option A: APPROVE                                │
│    - Set actual hours (bisa beda dari requested)   │
│    - Status: APPROVED                              │
│                                                     │
│    Option B: REJECT                                │
│    - Berikan alasan reject (wajib)                 │
│    - Status: REJECTED                              │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 4️⃣ SISTEM FINALKAN OVERTIME                         │
│    - Save approval/rejection                       │
│    - Record approver & timestamp                   │
│    - Employee dapat notifikasi                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Files yang Dibuat

### **1. Database**
- ✅ **Migration**: `migrations/20260103100000-create-overtime.js`
  - Tabel `Overtimes` dengan semua field lengkap
  - Index untuk query optimization
  - Foreign keys ke Users & Attandances

### **2. Models**
- ✅ **Model**: `models/overtime.js`
  - Relasi ke User (employee & approver)
  - Relasi ke Attendance
  - Validasi lengkap
  - Status constants

- ✅ **Updated**: `models/user.js`
  - Tambah relasi hasMany Overtime

- ✅ **Updated**: `models/attendance.js`
  - Tambah relasi hasOne Overtime

### **3. Controllers**

#### **Employee Controller**
- ✅ **File**: `controllers/overtimeController.js`

**Methods**:
1. `requestOvertime()` - Ajukan overtime
2. `getMyOvertimeRequests()` - Lihat semua request
3. `getMyOvertimeHistory()` - Lihat history approved
4. `cancelOvertimeRequest()` - Cancel pending request

#### **Admin Controller**
- ✅ **File**: `controllers/overtimeAdminController.js`

**Methods**:
1. `getAllOvertimeRequests()` - Lihat semua request dengan filter
2. `approveOvertime()` - Approve request
3. `rejectOvertime()` - Reject request dengan alasan
4. `getOvertimeSummary()` - Summary dengan period filter
5. `getPendingCount()` - Jumlah pending (untuk notifikasi)

### **4. Routes**
- ✅ **Employee Routes**: `routes/overtime.js`
  ```
  POST   /overtimes/request
  GET    /overtimes/my-requests
  GET    /overtimes/my-history
  DELETE /overtimes/:id
  ```

- ✅ **Admin Routes**: `routes/overtime_isAdmin.js`
  ```
  GET    /overtimes/admin/requests
  GET    /overtimes/admin/pending-count
  GET    /overtimes/admin/summary
  PATCH  /overtimes/admin/:id/approve
  PATCH  /overtimes/admin/:id/reject
  ```

- ✅ **Updated**: `routes/index.js`
  - Register overtime routes

### **5. Documentation**
- ✅ **Docs**: `docs (md)/OVERTIME_FEATURE.md`
  - Dokumentasi lengkap dengan contoh
  - All endpoints explained
  - Use cases
  - Response examples

---

## 📊 Database Structure

### **Tabel: Overtimes**

```sql
CREATE TABLE Overtimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  UserId INTEGER NOT NULL,
  AttendanceId INTEGER,
  overtimeDate DATE NOT NULL,
  clockIn DATE,
  clockOut DATE,
  requestedHours DECIMAL(5,2) NOT NULL,
  actualHours DECIMAL(5,2),
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approvedBy INTEGER,
  approvedAt DATE,
  rejectionReason TEXT,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL,
  
  FOREIGN KEY (UserId) REFERENCES Users(id),
  FOREIGN KEY (AttendanceId) REFERENCES Attandances(id),
  FOREIGN KEY (approvedBy) REFERENCES Users(id)
);

CREATE INDEX idx_overtimes_userid ON Overtimes(UserId);
CREATE INDEX idx_overtimes_status ON Overtimes(status);
CREATE INDEX idx_overtimes_date ON Overtimes(overtimeDate);
```

---

## 🔹 Employee Endpoints - Quick Reference

### **1. Request Overtime**
```bash
POST /overtimes/request
Authorization: Bearer EMPLOYEE_TOKEN
Content-Type: application/json

{
  "overtimeDate": "2026-01-03",
  "requestedHours": 3,
  "reason": "Menyelesaikan project deadline untuk client XYZ yang harus selesai besok pagi",
  "attendanceId": 1
}
```

### **2. Lihat My Requests**
```bash
# Semua
GET /overtimes/my-requests

# Pending saja
GET /overtimes/my-requests?status=pending

# Approved saja
GET /overtimes/my-requests?status=approved
```

### **3. Lihat History (Approved)**
```bash
# Bulan ini
GET /overtimes/my-history

# Januari 2026
GET /overtimes/my-history?month=1&year=2026
```

### **4. Cancel Request**
```bash
DELETE /overtimes/1
```

---

## 🔹 Admin Endpoints - Quick Reference

### **1. Lihat All Requests**
```bash
# Semua
GET /overtimes/admin/requests

# Pending saja
GET /overtimes/admin/requests?status=pending

# User tertentu
GET /overtimes/admin/requests?userId=3

# Date range
GET /overtimes/admin/requests?startDate=2026-01-01&endDate=2026-01-31
```

### **2. Approve Overtime**
```bash
PATCH /overtimes/admin/1/approve
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "actualHours": 2.5
}
```

### **3. Reject Overtime**
```bash
PATCH /overtimes/admin/1/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "rejectionReason": "Tidak ada pekerjaan urgent yang memerlukan lembur pada tanggal tersebut"
}
```

### **4. Summary Overtime**
```bash
# Bulan ini - semua employee
GET /overtimes/admin/summary?period=monthly

# Januari 2026 - semua employee
GET /overtimes/admin/summary?period=monthly&month=1&year=2026

# Minggu ini - semua employee
GET /overtimes/admin/summary?period=weekly

# Custom range - semua employee
GET /overtimes/admin/summary?period=custom&startDate=2026-01-01&endDate=2026-01-15

# Bulan ini - user tertentu
GET /overtimes/admin/summary?userId=3&period=monthly
```

### **5. Pending Count**
```bash
GET /overtimes/admin/pending-count
```

---

## 📊 Response Examples

### **Employee Request Overtime**
```json
{
  "message": "Overtime request submitted successfully",
  "data": {
    "id": 1,
    "overtimeDate": "2026-01-03T00:00:00.000Z",
    "requestedHours": 3,
    "reason": "Menyelesaikan project deadline...",
    "status": "pending",
    "createdAt": "2026-01-03T10:30:00.000Z"
  }
}
```

### **Admin Approve Overtime**
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

### **Admin Summary - All Employees**
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
    }
  ]
}
```

---

## ✨ Key Features

### **1. Flexible Period Filter**
- Daily, Weekly, Monthly, Custom range
- Admin bisa lihat siapa saja yang lembur di periode tertentu

### **2. Approval Workflow**
- Employee ajukan → Admin review → Approve/Reject
- Admin bisa adjust actual hours
- Rejection harus dengan alasan

### **3. Comprehensive Tracking**
- Track total jam lembur per employee
- History lengkap dengan approver info
- Summary per periode

### **4. Smart Validation**
- Min 0.5 jam, Max 12 jam
- Tidak boleh duplikat request
- Alasan wajib dan lengkap

### **5. Multi-Status Support**
- **Pending**: Menunggu approval
- **Approved**: Sudah disetujui
- **Rejected**: Ditolak dengan alasan

---

## 🔐 Security Features

- ✅ Authentication required
- ✅ Authorization by role (Employee vs Admin)
- ✅ Employee hanya bisa lihat/request data sendiri
- ✅ Admin bisa lihat & manage semua requests
- ✅ Validation untuk prevent duplicate & invalid data
- ✅ Audit trail (approvedBy, approvedAt)

---

## 🧪 Testing Steps

### **1. Employee Flow**
```bash
# Login as employee
POST /login
{
  "email": "employee@example.com",
  "password": "password"
}

# Request overtime
POST /overtimes/request
{
  "overtimeDate": "2026-01-03",
  "requestedHours": 3,
  "reason": "Menyelesaikan project deadline untuk client XYZ"
}

# Check my requests
GET /overtimes/my-requests?status=pending
```

### **2. Admin Flow**
```bash
# Login as admin
POST /login
{
  "email": "admin@example.com",
  "password": "password"
}

# Check pending requests
GET /overtimes/admin/requests?status=pending

# Approve
PATCH /overtimes/admin/1/approve
{
  "actualHours": 2.5
}

# Check summary
GET /overtimes/admin/summary?period=monthly
```

---

## 📝 Business Rules

1. **Request Overtime**:
   - Minimum 0.5 jam, maksimum 12 jam per hari
   - Alasan minimal 10 karakter, maksimal 1000 karakter
   - Tidak boleh duplikat untuk tanggal yang sama
   - Optional: Bisa link ke attendance ID

2. **Approve Overtime**:
   - Hanya bisa approve request yang status pending
   - Admin bisa set actual hours berbeda dari requested
   - Jika tidak set actual hours, akan pakai requested hours
   - Record approver & timestamp

3. **Reject Overtime**:
   - Hanya bisa reject request yang status pending
   - Wajib berikan rejection reason (min 10 karakter)
   - Record approver & timestamp

4. **Cancel Request**:
   - Employee hanya bisa cancel request yang status pending
   - Tidak bisa cancel yang sudah approved/rejected

---

## 🎉 Implementation Complete!

Semua fitur Overtime telah berhasil diimplementasikan:
- ✅ Database migration & model
- ✅ Employee controllers & routes
- ✅ Admin controllers & routes
- ✅ Validation & error handling
- ✅ Period filter (daily/weekly/monthly/custom)
- ✅ Approval workflow lengkap
- ✅ Dokumentasi lengkap

Fitur sudah siap digunakan dan di-test! 🚀

**Migration Status**: ✅ EXECUTED (20260103100000-create-overtime.js)
**Server**: Ready to restart
**Documentation**: `docs (md)/OVERTIME_FEATURE.md`
