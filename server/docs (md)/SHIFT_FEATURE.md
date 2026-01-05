# SHIFT / WORK PATTERN FEATURE

## Overview
Fitur Shift/Work Pattern memungkinkan sistem untuk mengelola berbagai pola kerja karyawan dengan jam kerja yang berbeda-beda. Sistem ini digunakan untuk:
- Menghitung keterlambatan (late check-in) berdasarkan jadwal shift
- Menghitung overtime berdasarkan jam selesai shift
- Mendukung berbagai pola kerja: Shift Pagi, Shift Siang, Shift Malam, dan Flexible

## Database Schema

### Tabel: Shifts
```sql
CREATE TABLE Shifts (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  breakDuration INTEGER DEFAULT 60,
  lateTolerance INTEGER DEFAULT 15,
  overtimeThreshold INTEGER DEFAULT 15,
  isFlexible BOOLEAN DEFAULT false,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME,
  updatedAt DATETIME
)
```

### Fields Explanation
- **name**: Nama shift (contoh: "Shift Pagi", "Shift Siang", "Shift Malam", "Flexible")
- **startTime**: Jam mulai kerja (format: HH:mm:ss)
- **endTime**: Jam selesai kerja (format: HH:mm:ss)
- **breakDuration**: Durasi istirahat dalam menit (default: 60 menit)
- **lateTolerance**: Toleransi keterlambatan dalam menit sebelum dianggap late (default: 15 menit)
- **overtimeThreshold**: Minimum menit overtime untuk dihitung sebagai lembur (default: 15 menit)
- **isFlexible**: Flag untuk shift flexible (tidak ada pengecekan keterlambatan ketat)
- **description**: Deskripsi shift
- **isActive**: Status aktif/nonaktif shift

### Relasi Database
- **Users** memiliki field `ShiftId` (nullable) → Shift default untuk user
- **Attendances** memiliki field `ShiftId` (nullable) → Shift yang dipakai untuk attendance (bisa override shift user)

### Priority Logic
Ketika menentukan shift untuk attendance:
1. **Priority 1**: `Attendance.ShiftId` (jika ada override manual)
2. **Priority 2**: `User.ShiftId` (shift default user)
3. **Priority 3**: Default shift pertama yang aktif (fallback)

## Default Shifts (Seeder)

### 1. Shift Pagi
- **Jam Kerja**: 07:00 - 15:00
- **Istirahat**: 60 menit
- **Toleransi Terlambat**: 15 menit
- **Threshold Overtime**: 15 menit
- **Flexible**: No

### 2. Shift Siang
- **Jam Kerja**: 09:00 - 17:00
- **Istirahat**: 60 menit
- **Toleransi Terlambat**: 15 menit
- **Threshold Overtime**: 15 menit
- **Flexible**: No

### 3. Shift Malam
- **Jam Kerja**: 15:00 - 23:00
- **Istirahat**: 60 menit
- **Toleransi Terlambat**: 15 menit
- **Threshold Overtime**: 15 menit
- **Flexible**: No

### 4. Flexible
- **Jam Kerja**: 00:00 - 23:59
- **Istirahat**: 60 menit
- **Toleransi Terlambat**: 0 menit (tidak ada pengecekan)
- **Threshold Overtime**: 60 menit
- **Flexible**: Yes

## API Endpoints (Admin Only)

### 1. Get All Shifts
```
GET /api/shifts/admin/shifts
Authorization: Bearer <token>
Role: Admin

Response 200:
{
  "success": true,
  "message": "Successfully retrieved all shifts",
  "data": [
    {
      "id": 1,
      "name": "Shift Pagi",
      "startTime": "07:00:00",
      "endTime": "15:00:00",
      "breakDuration": 60,
      "lateTolerance": 15,
      "overtimeThreshold": 15,
      "isFlexible": false,
      "description": "Shift pagi - Jam kerja 07:00 sampai 15:00",
      "isActive": true,
      "users": [...]
    }
  ]
}
```

### 2. Get Shift by ID
```
GET /api/shifts/admin/shifts/:id
Authorization: Bearer <token>
Role: Admin

Response 200:
{
  "success": true,
  "message": "Successfully retrieved shift",
  "data": {...}
}
```

### 3. Create New Shift
```
POST /api/shifts/admin/shifts
Authorization: Bearer <token>
Role: Admin

Request Body:
{
  "name": "Shift Custom",
  "startTime": "08:00:00",
  "endTime": "16:00:00",
  "breakDuration": 60,
  "lateTolerance": 10,
  "overtimeThreshold": 20,
  "isFlexible": false,
  "description": "Custom shift",
  "isActive": true
}

Response 201:
{
  "success": true,
  "message": "Shift created successfully",
  "data": {...}
}
```

### 4. Update Shift
```
PUT /api/shifts/admin/shifts/:id
Authorization: Bearer <token>
Role: Admin

Request Body:
{
  "name": "Shift Pagi Updated",
  "lateTolerance": 20
}

Response 200:
{
  "success": true,
  "message": "Shift updated successfully",
  "data": {...}
}
```

### 5. Delete Shift
```
DELETE /api/shifts/admin/shifts/:id
Authorization: Bearer <token>
Role: Admin

Response 200:
{
  "success": true,
  "message": "Shift deleted successfully",
  "data": { "id": 1 }
}

Response 400 (if shift is being used):
{
  "success": false,
  "message": "Cannot delete shift. It is being used by X user(s) and Y attendance(s)"
}
```

### 6. Assign Shift to User
```
PUT /api/shifts/admin/users/:userId/shift
Authorization: Bearer <token>
Role: Admin

Request Body:
{
  "shiftId": 1
}

Response 200:
{
  "success": true,
  "message": "Shift assigned to user successfully",
  "data": {
    "id": 5,
    "name": "John Doe",
    "ShiftId": 1,
    "shift": {
      "id": 1,
      "name": "Shift Pagi",
      ...
    }
  }
}
```

### 7. Remove Shift from User
```
DELETE /api/shifts/admin/users/:userId/shift
Authorization: Bearer <token>
Role: Admin

Response 200:
{
  "success": true,
  "message": "Shift removed from user successfully",
  "data": {...}
}
```

## Helper Functions

### File: `helpers/shift.js`

#### 1. getApplicableShift(attendance, user)
Mendapatkan shift yang tepat berdasarkan priority logic.

#### 2. isLateClockInWithShift(clockInTime, shift)
Mengecek apakah clock-in terlambat berdasarkan shift.

**Returns:**
```javascript
{
  isLate: true/false,
  lateMinutes: 25,
  expectedStartTime: Date,
  actualStartTime: Date,
  tolerance: 15
}
```

#### 3. calculateOvertimeWithShift(clockInTime, clockOutTime, shift)
Menghitung overtime berdasarkan shift.

**Returns:**
```javascript
{
  hasOvertime: true/false,
  overtimeMinutes: 45,
  overtimeHours: 0.75,
  expectedEndTime: Date,
  actualEndTime: Date,
  threshold: 15
}
```

#### 4. calculateWorkDurationWithBreak(clockInTime, clockOutTime, shift)
Menghitung durasi kerja dengan memperhitungkan break time.

**Returns:**
```javascript
{
  totalMinutes: 480,
  totalHours: 8.0,
  breakMinutes: 60,
  workMinutes: 420,
  workHours: 7.0
}
```

#### 5. determineStatusWithShift(clockInTime, shift)
Menentukan status (ON_TIME atau LATE) berdasarkan shift.

#### 6. formatShiftTime(shift)
Format shift time untuk display: "08:00 - 17:00"

## How It Works

### Scenario 1: User dengan Shift Pagi
```javascript
User: 
  - ShiftId: 1 (Shift Pagi: 07:00 - 15:00)
  - lateTolerance: 15 menit

Clock-in: 07:20
Expected: 07:00
Tolerance: sampai 07:15

Result: LATE (20 menit terlambat, melewati tolerance)
```

### Scenario 2: User dengan Shift Siang
```javascript
User:
  - ShiftId: 2 (Shift Siang: 09:00 - 17:00)
  - overtimeThreshold: 15 menit

Clock-in: 09:00
Clock-out: 17:30
Expected End: 17:00
Overtime: 30 menit

Result: hasOvertime = true (30 menit > 15 menit threshold)
```

### Scenario 3: User dengan Flexible Shift
```javascript
User:
  - ShiftId: 4 (Flexible: 00:00 - 23:59)
  - isFlexible: true

Clock-in: 10:30
Result: ON_TIME (flexible tidak ada pengecekan late)

Clock-out: 19:00
Result: hasOvertime = false (flexible tidak auto-overtime)
```

### Scenario 4: Shift Override di Attendance
```javascript
User:
  - ShiftId: 2 (Shift Siang: 09:00 - 17:00)

Attendance:
  - ShiftId: 3 (Shift Malam: 15:00 - 23:00) // Override!

Clock-in: 15:10
Expected: 15:00 (dari Shift Malam, bukan Shift Siang)
Result: ON_TIME (dalam tolerance)
```

## Integration dengan Attendance

### Updated `helpers/attendance.js`
Function `isLateClockIn` dan `determineFinalStatus` sekarang support parameter:
- `userId`: untuk auto-detect shift user
- `shift`: untuk override shift yang sudah diketahui

```javascript
// Usage example
const isLate = await isLateClockIn(clockInTime, userId);
const status = await determineFinalStatus(clockInTime, userId);
```

## Migration Files
1. **20260105050612-create-shift.js** - Buat tabel Shifts
2. **20260105050643-add-shift-to-users-and-attendances.js** - Tambah ShiftId ke Users dan Attendances

## Seeder Files
1. **20260105050944-demo-shifts.js** - Data shift default (Pagi, Siang, Malam, Flexible)

## Usage Example

### Admin: Create Custom Shift
```bash
curl -X POST http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shift Weekend",
    "startTime": "10:00:00",
    "endTime": "18:00:00",
    "breakDuration": 60,
    "lateTolerance": 30,
    "overtimeThreshold": 20,
    "isFlexible": false,
    "description": "Shift khusus weekend"
  }'
```

### Admin: Assign Shift to User
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/users/5/shift \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftId": 1
  }'
```

## Notes
- Shift flexible tidak memiliki pengecekan keterlambatan ketat
- Sistem support night shift (shift yang melewati tengah malam)
- Break duration otomatis dikurangkan dari total work hours
- Overtime hanya dihitung jika melebihi threshold yang ditentukan
- Setiap attendance bisa memiliki shift yang berbeda (override)
- User tanpa shift akan menggunakan default shift pertama yang aktif
