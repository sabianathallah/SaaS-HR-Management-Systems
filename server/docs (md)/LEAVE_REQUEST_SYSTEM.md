# Leave Request System Documentation

## 📋 Overview

Sistem Leave Request telah berhasil diimplementasikan dengan fitur lengkap untuk mengelola cuti, sakit, dan izin karyawan.

---

## 🗄️ **Database Schema**

### **1. Tabel Users (Updated)**
```sql
- annualLeaveQuota (INTEGER, default: 12) - Jatah cuti tahunan
- usedLeaveQuota (INTEGER, default: 0) - Cuti yang sudah digunakan
- remainingLeaveQuota (VIRTUAL) - Sisa cuti (calculated field)
```

### **2. Tabel LeaveRequests (NEW)**
```sql
- id (PK)
- UserId (FK → Users)
- leaveType (ENUM: 'ANNUAL_LEAVE', 'SICK_LEAVE', 'PERMISSION')
- startDate (DATEONLY)
- endDate (DATEONLY)
- totalDays (INTEGER)
- reason (TEXT)
- status (ENUM: 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
- approvedBy (FK → Users, nullable)
- approvalNote (TEXT, nullable)
- approvalDate (DATE, nullable)
- createdAt
- updatedAt
```

### **3. Tabel Attendances (Updated)**
```sql
- LeaveRequestId (FK → LeaveRequests, nullable)
- status (ENUM: Added 'SICK_LEAVE' and 'PERMISSION')
```

---

## 📊 **Leave Types**

| Type | Description | Potong Quota? | Use Case |
|------|-------------|---------------|----------|
| **ANNUAL_LEAVE** | Cuti tahunan | ✅ Ya | Liburan, keperluan pribadi |
| **SICK_LEAVE** | Sakit dengan surat | ✅ Ya | Sakit, rawat inap |
| **PERMISSION** | Izin singkat | ❌ Tidak | Telat, pulang cepat, urusan mendadak |

---

## 📊 **Request Status Flow**

```
PENDING → APPROVED → Create Attendance Records
        ↓
        REJECTED (No action)
        ↓
        CANCELLED (By employee, PENDING only)
```

---

## 🔌 **API Endpoints**

### **EMPLOYEE ENDPOINTS**

#### **1. Submit Leave/Permission Request**
```http
POST /leave-requests
Authorization: Bearer <employee-token>
Content-Type: application/json

Body:
{
  "leaveType": "ANNUAL_LEAVE",  // or "SICK_LEAVE", "PERMISSION"
  "startDate": "2026-01-10",
  "endDate": "2026-01-12",
  "reason": "Liburan keluarga ke Bali"
}

Response:
{
  "message": "Leave request submitted successfully. Waiting for admin approval.",
  "data": {
    "id": 1,
    "UserId": 5,
    "leaveType": "ANNUAL_LEAVE",
    "startDate": "2026-01-10",
    "endDate": "2026-01-12",
    "totalDays": 3,
    "reason": "Liburan keluarga ke Bali",
    "status": "PENDING",
    "createdAt": "2026-01-02T10:30:00.000Z",
    "updatedAt": "2026-01-02T10:30:00.000Z"
  }
}
```

#### **2. Get My Leave Requests**
```http
GET /leave-requests/my-requests?status=PENDING&leaveType=ANNUAL_LEAVE
Authorization: Bearer <employee-token>

Response:
{
  "message": "My leave requests",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "leaveType": "ANNUAL_LEAVE",
      "startDate": "2026-01-10",
      "endDate": "2026-01-12",
      "totalDays": 3,
      "reason": "Liburan keluarga ke Bali",
      "status": "PENDING",
      "approver": null,
      "createdAt": "2026-01-02T10:30:00.000Z"
    }
  ]
}
```

#### **3. Get My Leave Balance**
```http
GET /leave-requests/my-balance
Authorization: Bearer <employee-token>

Response:
{
  "message": "My leave balance",
  "data": {
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 5,
    "remainingLeaveQuota": 7,
    "pendingLeaveDays": 3,
    "availableAfterPending": 4
  }
}
```

#### **4. Cancel Leave Request**
```http
DELETE /leave-requests/:id
Authorization: Bearer <employee-token>

Response:
{
  "message": "Leave request cancelled successfully",
  "data": {
    "id": 1,
    "status": "CANCELLED",
    ...
  }
}
```

---

### **ADMIN ENDPOINTS**

#### **5. Get All Leave Requests**
```http
GET /leave-requests/admin/all?status=PENDING&userId=5
Authorization: Bearer <admin-token>

Response:
{
  "message": "All leave requests",
  "data": [
    {
      "id": 1,
      "employee": {
        "id": 5,
        "name": "John Doe",
        "email": "john@mail.com"
      },
      "leaveType": "ANNUAL_LEAVE",
      "startDate": "2026-01-10",
      "endDate": "2026-01-12",
      "totalDays": 3,
      "reason": "Liburan keluarga",
      "status": "PENDING"
    }
  ]
}
```

#### **6. Approve Leave Request**
```http
PUT /leave-requests/admin/:id/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

Body:
{
  "approvalNote": "Approved. Enjoy your vacation!"
}

Response:
{
  "message": "Leave request approved successfully. Attendance records created.",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "approvedBy": 1,
    "approvalNote": "Approved. Enjoy your vacation!",
    "approvalDate": "2026-01-02T11:00:00.000Z"
  }
}
```

**What Happens on Approval:**
1. Status diupdate ke APPROVED
2. **Jika ANNUAL_LEAVE atau SICK_LEAVE:** Quota dikurangi (usedLeaveQuota += totalDays)
3. **Attendance records dibuat** untuk setiap hari (startDate sampai endDate)
4. Attendance status sesuai leave type (LEAVE, SICK_LEAVE, atau PERMISSION)

#### **7. Reject Leave Request**
```http
PUT /leave-requests/admin/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

Body:
{
  "approvalNote": "Tidak bisa approve karena periode sibuk"
}

Response:
{
  "message": "Leave request rejected successfully",
  "data": {
    "id": 1,
    "status": "REJECTED",
    "approvedBy": 1,
    "approvalNote": "Tidak bisa approve karena periode sibuk",
    "approvalDate": "2026-01-02T11:00:00.000Z"
  }
}
```

#### **8. Adjust Employee Leave Quota (Manual)**
```http
PUT /leave-requests/admin/adjust-quota/:userId
Authorization: Bearer <admin-token>
Content-Type: application/json

Body:
{
  "annualLeaveQuota": 15,  // Optional: update total quota
  "usedLeaveQuota": 2,     // Optional: update used quota
  "reason": "Bonus cuti karena performance bagus"
}

Response:
{
  "message": "Leave quota adjusted successfully",
  "reason": "Bonus cuti karena performance bagus",
  "oldQuota": {
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 5,
    "remainingLeaveQuota": 7
  },
  "newQuota": {
    "annualLeaveQuota": 15,
    "usedLeaveQuota": 2,
    "remainingLeaveQuota": 13
  }
}
```

#### **9. Get Employee Leave Balance**
```http
GET /leave-requests/admin/balance/:userId
Authorization: Bearer <admin-token>

Response:
{
  "message": "Employee leave balance",
  "user": {
    "id": 5,
    "name": "John Doe",
    "email": "john@mail.com"
  },
  "balance": {
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 5,
    "remainingLeaveQuota": 7
  },
  "statistics": [
    {
      "status": "APPROVED",
      "leaveType": "ANNUAL_LEAVE",
      "totalDays": "5"
    }
  ]
}
```

---

## 🎯 **Use Cases & Examples**

### **Case 1: Employee Cuti 3 Hari**
```bash
# 1. Employee submit request
curl -X POST http://localhost:3000/leave-requests \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "ANNUAL_LEAVE",
    "startDate": "2026-01-10",
    "endDate": "2026-01-12",
    "reason": "Liburan keluarga"
  }'

# 2. Admin approve
curl -X PUT http://localhost:3000/leave-requests/admin/1/approve \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNote": "Approved"
  }'

# Result:
# - usedLeaveQuota bertambah 3 hari
# - 3 attendance records dibuat (Jan 10, 11, 12) dengan status LEAVE
```

### **Case 2: Employee Telat dengan Izin (Permission)**
```bash
# 1. Employee submit permission
curl -X POST http://localhost:3000/leave-requests \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "PERMISSION",
    "startDate": "2026-01-05",
    "endDate": "2026-01-05",
    "reason": "Macet parah, ban bocor di jalan"
  }'

# 2. Admin approve
curl -X PUT http://localhost:3000/leave-requests/admin/2/approve \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNote": "OK, hati-hati di jalan"
  }'

# Result:
# - usedLeaveQuota TIDAK bertambah (karena PERMISSION)
# - 1 attendance record dengan status PERMISSION (bukan LATE)
```

### **Case 3: Employee Sakit dengan Surat Dokter**
```bash
curl -X POST http://localhost:3000/leave-requests \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "SICK_LEAVE",
    "startDate": "2026-01-08",
    "endDate": "2026-01-09",
    "reason": "Demam dan flu, ada surat dokter"
  }'

# Admin approve → usedLeaveQuota +2, attendance status SICK_LEAVE
```

### **Case 4: Employee Cancel Request (Masih PENDING)**
```bash
curl -X DELETE http://localhost:3000/leave-requests/1 \
  -H "Authorization: Bearer <employee-token>"

# Result: Status jadi CANCELLED, quota tidak terpengaruh
```

---

## ⚠️ **Business Rules & Validations**

### **Submit Request:**
- ✅ startDate harus ≤ endDate
- ✅ Boleh submit untuk tanggal yang sudah lewat (retrospective)
- ✅ Tidak boleh overlapping dengan request PENDING/APPROVED lainnya
- ✅ Untuk ANNUAL_LEAVE & SICK_LEAVE: cek quota cukup
- ✅ Reason minimal 10 karakter, maksimal 500

### **Approve Request:**
- ✅ Hanya PENDING yang bisa diapprove
- ✅ Cek lagi quota saat approve (antisipasi perubahan)
- ✅ Auto create attendance records untuk semua tanggal
- ✅ Skip jika attendance sudah ada (prevent duplicate)

### **Cancel Request:**
- ✅ Hanya employee yang submit yang bisa cancel
- ✅ Hanya PENDING yang bisa dicancel
- ✅ APPROVED/REJECTED tidak bisa dicancel

---

## 📊 **Updated Attendance Statistics**

Sekarang statistics include PERMISSION dan SICK_LEAVE:

```json
{
  "summary": {
    "totalPresent": 18,  // ON_TIME + LATE + PERMISSION
    "onTime": 15,
    "late": 2,
    "permission": 1,     // NEW
    "absent": 2,
    "leave": 3,
    "sickLeave": 2,      // NEW
    "holiday": 4,
    "attendanceRate": 90.0  // (totalPresent / effectiveWorkDays) * 100
  }
}
```

**Attendance Rate Calculation:**
- **totalPresent** = ON_TIME + LATE + PERMISSION
- **effectiveWorkDays** = totalPresent + ABSENT (exclude LEAVE, SICK_LEAVE, HOLIDAY)
- **attendanceRate** = (totalPresent / effectiveWorkDays) × 100%

---

## 🔧 **Admin Tools**

### **Reset Quota di Awal Tahun**
```bash
# Set semua employee usedLeaveQuota = 0
UPDATE Users SET usedLeaveQuota = 0;

# Atau via API untuk specific user:
curl -X PUT http://localhost:3000/leave-requests/admin/adjust-quota/5 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "usedLeaveQuota": 0,
    "reason": "Reset quota tahun baru 2026"
  }'
```

### **Bonus Cuti untuk Employee Tertentu**
```bash
curl -X PUT http://localhost:3000/leave-requests/admin/adjust-quota/5 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "annualLeaveQuota": 15,
    "reason": "Bonus 3 hari cuti karena best employee"
  }'
```

---

## 📝 **Notes**

1. **Permission vs Late:**
   - **LATE**: Telat tanpa izin (dihitung negatif)
   - **PERMISSION**: Telat dengan izin (tidak dihitung negatif, count as present)

2. **Quota Management:**
   - **ANNUAL_LEAVE** dan **SICK_LEAVE** potong quota
   - **PERMISSION** TIDAK potong quota

3. **Retrospective Leave:**
   - Employee bisa submit leave untuk tanggal yang sudah lewat
   - Berguna untuk: lupa submit, sakit mendadak, dll

4. **Overlapping Prevention:**
   - System auto cek overlap saat submit
   - Prevent double request untuk tanggal yang sama

5. **Attendance Auto Creation:**
   - Ketika admin approve, attendance records auto created
   - Skip jika attendance sudah ada (prevent duplicate)

---

## ✅ **Testing Checklist**

- [ ] Employee submit ANNUAL_LEAVE request
- [ ] Admin approve → quota berkurang & attendance created
- [ ] Employee submit PERMISSION request
- [ ] Admin approve → quota TIDAK berkurang
- [ ] Employee submit overlapping request → error
- [ ] Employee submit dengan quota tidak cukup → error
- [ ] Employee cancel PENDING request → success
- [ ] Employee cancel APPROVED request → error
- [ ] Admin adjust quota manually
- [ ] Check statistics include permission & sick leave

---

## 🎉 **Summary**

Sistem Leave Request telah berhasil diimplementasikan dengan fitur:
✅ 3 tipe leave (ANNUAL_LEAVE, SICK_LEAVE, PERMISSION)
✅ Approval workflow (PENDING → APPROVED/REJECTED)
✅ Quota management (auto deduct untuk ANNUAL_LEAVE & SICK_LEAVE)
✅ Auto create attendance records
✅ Overlapping prevention
✅ Retrospective leave support
✅ Admin tools untuk adjust quota
✅ Updated statistics

**Database Changes:**
- Users: +2 columns (annualLeaveQuota, usedLeaveQuota)
- LeaveRequests: NEW table
- Attendances: +1 column (LeaveRequestId), +2 status (SICK_LEAVE, PERMISSION)

**New Endpoints:**
- 4 Employee endpoints
- 5 Admin endpoints

Semua sudah siap digunakan! 🚀
