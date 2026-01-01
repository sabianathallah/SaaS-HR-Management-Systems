# Attendance Status Documentation

Berikut adalah daftar status yang digunakan dalam sistem attendance:

| Status      | Arti              | Deskripsi                                                    |
| ----------- | ----------------- | ------------------------------------------------------------ |
| ON_PROGRESS | Sedang bekerja    | Status ketika karyawan sudah clock-in dan sedang bekerja     |
| ON_TIME     | Hadir tepat waktu | Status final ketika karyawan hadir dan clock-in tepat waktu  |
| LATE        | Hadir terlambat   | Status final ketika karyawan hadir tetapi clock-in terlambat |
| ABSENT      | Tidak hadir       | Status ketika karyawan tidak hadir tanpa keterangan          |
| LEAVE       | Cuti              | Status ketika karyawan mengambil cuti                        |
| HOLIDAY     | Libur nasional    | Status untuk hari libur nasional                             |

## Flow Status

### Normal Flow (Tepat Waktu)
1. Karyawan clock-in → Status: `ON_PROGRESS`
2. Karyawan clock-out → Status berubah menjadi: `ON_TIME` (jika clock-in tepat waktu)

### Late Flow (Terlambat)
1. Karyawan clock-in terlambat → Status: `ON_PROGRESS`
2. Karyawan clock-out → Status berubah menjadi: `LATE` (jika clock-in terlambat)

### Other Statuses
- `ABSENT`: Diset otomatis oleh sistem jika tidak ada clock-in di hari kerja
- `LEAVE`: Diset manual oleh admin/sistem ketika ada pengajuan cuti yang disetujui
- `HOLIDAY`: Diset otomatis oleh sistem untuk hari libur nasional

## Penggunaan di Code

```javascript
const { Attandance } = require('../models');

// Menggunakan status constants
const attendance = await Attandance.create({
  UserId: userId,
  date: new Date(),
  clockIn: new Date(),
  status: Attandance.ATTENDANCE_STATUS.ON_PROGRESS
});

// Available status constants:
// - Attandance.ATTENDANCE_STATUS.ON_PROGRESS
// - Attandance.ATTENDANCE_STATUS.ON_TIME
// - Attandance.ATTENDANCE_STATUS.LATE
// - Attandance.ATTENDANCE_STATUS.ABSENT
// - Attandance.ATTENDANCE_STATUS.LEAVE
// - Attandance.ATTENDANCE_STATUS.HOLIDAY
```
