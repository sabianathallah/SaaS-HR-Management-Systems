# Attendance Features Documentation

## Fitur-Fitur Attendance System

### 1. Hitung Durasi Kerja ⏱️
Sistem otomatis menghitung durasi kerja berdasarkan `clockIn` dan `clockOut`.

**Implementasi:**
- Durasi dihitung dalam satuan **jam** (hours)
- Dibulatkan hingga 2 desimal
- Muncul di response saat `clock-out` dan `get today attendance`

**Contoh Response:**
```json
{
  "message": "Clock-out successful",
  "data": {
    "id": 1,
    "UserId": 5,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:30:00.000Z",
    "clockOut": "2026-01-01T17:00:00.000Z",
    "status": "ON_TIME",
    "workDurationHours": 8.5
  }
}
```

---

### 2. Deteksi Late/On Time 🕐
Sistem mendeteksi apakah pekerja clock-in tepat waktu atau terlambat.

**Ketentuan:**
- Jam kerja mulai: **09:00 WIB**
- Clock-in sebelum atau tepat 09:00 → **ON_TIME**
- Clock-in setelah 09:00 → **LATE**

**Implementasi:**
- Deteksi dilakukan saat user melakukan `clock-out`
- Status final ditentukan berdasarkan waktu `clock-in`

---

### 3. Status Flow 🔄

#### Flow Diagram:
```
Clock-In (< 09:00)  →  ON_PROGRESS  →  Clock-Out  →  ON_TIME
Clock-In (> 09:00)  →  ON_PROGRESS  →  Clock-Out  →  LATE
No Clock-In         →  (Auto Set)   →  ABSENT
```

#### Detail Status:

| Status | Kapan Diset | Keterangan |
|--------|-------------|------------|
| `ON_PROGRESS` | Saat clock-in | User sedang bekerja |
| `ON_TIME` | Saat clock-out | User hadir tepat waktu (clock-in ≤ 09:00) |
| `LATE` | Saat clock-out | User hadir terlambat (clock-in > 09:00) |
| `ABSENT` | Auto set oleh sistem | User tidak hadir |
| `LEAVE` | Manual (future feature) | User mengambil cuti |
| `HOLIDAY` | Manual/Auto (future feature) | Hari libur nasional |

---

### 4. Auto Set Absent 🤖

Sistem otomatis menandai user yang tidak clock-in sebagai **ABSENT**.

#### Cara Kerja:
1. Sistem mengambil semua user yang terdaftar
2. Mengecek user mana yang **belum** clock-in hari ini
3. Membuat record attendance dengan status `ABSENT` untuk mereka

#### Endpoint (Admin Only):
```
POST /attendances/auto-set-absent
Authorization: Bearer <admin-token>
```

#### Response:
```json
{
  "message": "Auto set absent completed. 3 users marked as absent.",
  "data": {
    "absentCount": 3,
    "absentUserIds": [2, 4, 7]
  }
}
```

#### Setup Cron Job (Recommended):
Untuk otomatisasi, setup cron job yang memanggil endpoint ini setiap hari.

**Contoh menggunakan node-cron:**
```javascript
const cron = require('node-cron');

// Jalankan setiap hari jam 18:00 (6 PM)
cron.schedule('0 18 * * *', async () => {
  console.log('Running auto set absent...');
  // Call autoSetAbsent method or endpoint
});
```

**Instalasi node-cron:**
```bash
npm install node-cron
```

---

### 5. Query Attendance Hari Ini 📅

Endpoint khusus untuk mendapatkan attendance record hari ini saja.

#### Endpoint:
```
GET /attendances/today
Authorization: Bearer <token>
```

#### Response (Sudah Clock-Out):
```json
{
  "message": "Today's attendance record",
  "data": {
    "id": 1,
    "UserId": 5,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:45:00.000Z",
    "clockOut": "2026-01-01T17:30:00.000Z",
    "status": "ON_TIME",
    "workDurationHours": 8.75
  }
}
```

#### Response (Masih ON_PROGRESS):
```json
{
  "message": "Today's attendance record",
  "data": {
    "id": 1,
    "UserId": 5,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:45:00.000Z",
    "clockOut": "2026-01-01T08:45:00.000Z",
    "status": "ON_PROGRESS",
    "workDurationHours": null
  }
}
```

#### Response (Belum Clock-In):
```json
{
  "message": "No attendance record for today",
  "data": null
}
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/attendances/all-attendance` | ✅ | Admin | Get all attendance records |
| POST | `/attendances/auto-set-absent` | ✅ | Admin | Auto set absent for users |
| POST | `/attendances/clock-in` | ✅ | All | Clock in for today |
| POST | `/attendances/clock-out` | ✅ | All | Clock out and finalize status |
| GET | `/attendances/my-attendance` | ✅ | All | Get all my attendance history |
| GET | `/attendances/today` | ✅ | All | Get today's attendance only |

---

## Konfigurasi

### Work Hours Settings
Jam kerja dapat dikonfigurasi di `attendanceController.js`:

```javascript
// Di function isLateClockIn
workStartTime.setHours(9, 0, 0, 0); // Ubah 9 sesuai jam kerja kantor
```

### Cron Schedule
Untuk auto set absent, disarankan menjalankan:
- **18:00 (6 PM)** - Setelah jam kerja selesai
- **23:59 (11:59 PM)** - Sebelum hari berganti

---

## Testing Flow

### 1. Test Clock-In On Time:
```bash
# Clock-in sebelum jam 9
POST /attendances/clock-in
# Expected: status = "ON_PROGRESS"
```

### 2. Test Clock-In Late:
```bash
# Clock-in setelah jam 9
POST /attendances/clock-in
# Expected: status = "ON_PROGRESS"
```

### 3. Test Clock-Out:
```bash
POST /attendances/clock-out
# Expected: 
# - If clock-in < 09:00 → status = "ON_TIME"
# - If clock-in > 09:00 → status = "LATE"
# - workDurationHours calculated
```

### 4. Test Today Attendance:
```bash
GET /attendances/today
# Expected: Today's record with duration (if clocked out)
```

### 5. Test Auto Set Absent (Admin):
```bash
POST /attendances/auto-set-absent
# Expected: Users without clock-in marked as ABSENT
```

---

## Future Enhancements

1. **Leave Management** - Sistem pengajuan cuti
2. **Holiday Calendar** - Auto set holiday status
3. **Overtime Calculation** - Hitung lembur
4. **Grace Period** - Toleransi keterlambatan (misal 15 menit)
5. **Work Schedule** - Jadwal kerja fleksibel per user
6. **Email/Notification** - Reminder untuk clock-in/out
7. **Dashboard Statistics** - Analytics dan reports
