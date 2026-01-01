# Admin Endpoints Documentation

Dokumentasi lengkap untuk endpoint-endpoint admin dalam sistem HR Management.

## Table of Contents
1. [Manual Attendance Management](#manual-attendance-management)
2. [Work Schedule Configuration](#work-schedule-configuration)
3. [Holiday Management](#holiday-management)

---

## Manual Attendance Management

### 1. Create Manual Attendance (Admin)

Admin dapat membuat record absensi secara manual untuk karyawan yang tidak dapat melakukan absensi sendiri.

**Endpoint:** `POST /attendance/admin/manual-attendance`

**Authorization:** Admin only (requires admin role)

**Request Body:**
```json
{
  "userId": 1,
  "date": "2026-01-01",
  "clockIn": "2026-01-01T09:00:00",
  "clockOut": "2026-01-01T17:00:00",
  "status": "ON_TIME"
}
```

**Parameters:**
- `userId` (integer, required): ID user yang akan dibuatkan attendance
- `date` (date, required): Tanggal attendance
- `clockIn` (datetime, required): Waktu clock-in
- `clockOut` (datetime, required): Waktu clock-out
- `status` (string, required): Status attendance (ON_TIME, LATE, ABSENT, LEAVE, HOLIDAY)

**Success Response (201):**
```json
{
  "message": "Manual attendance created successfully",
  "data": {
    "id": 10,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T09:00:00.000Z",
    "clockOut": "2026-01-01T17:00:00.000Z",
    "status": "ON_TIME",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields atau attendance sudah ada untuk user pada tanggal tersebut
- `404 Not Found`: User tidak ditemukan

---

### 2. Update Manual Attendance (Admin)

Admin dapat mengedit record attendance yang sudah dibuat sebelumnya.

**Endpoint:** `PUT /attendance/admin/manual-attendance/:id`

**Authorization:** Admin only (requires admin role)

**URL Parameters:**
- `id` (integer): ID attendance yang akan diupdate

**Request Body:** (semua field optional, hanya kirim yang ingin diupdate)
```json
{
  "date": "2026-01-02",
  "clockIn": "2026-01-02T09:30:00",
  "clockOut": "2026-01-02T17:30:00",
  "status": "LATE"
}
```

**Success Response (200):**
```json
{
  "message": "Attendance record updated successfully",
  "data": {
    "id": 10,
    "UserId": 1,
    "date": "2026-01-02T00:00:00.000Z",
    "clockIn": "2026-01-02T09:30:00.000Z",
    "clockOut": "2026-01-02T17:30:00.000Z",
    "status": "LATE",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-02T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Attendance record tidak ditemukan
- `400 Bad Request`: Invalid status value

---

## Work Schedule Configuration

### 3. Update Work Schedule (Admin)

Admin dapat mengubah jam operasional kerja yang akan mempengaruhi:
- Waktu mulai kerja (untuk menentukan LATE/ON_TIME)
- Waktu selesai kerja
- Waktu auto absent (waktu cron job dijalankan)

**Endpoint:** `PUT /attendance/admin/work-schedule`

**Authorization:** Admin only (requires admin role)

**Request Body:** (semua field optional)
```json
{
  "workStartTime": "08:00",
  "workEndTime": "16:00",
  "autoAbsentTime": "17:00"
}
```

**Parameters:**
- `workStartTime` (string, optional): Jam mulai kerja (format HH:MM)
- `workEndTime` (string, optional): Jam selesai kerja (format HH:MM)
- `autoAbsentTime` (string, optional): Jam auto absent (format HH:MM)

**Success Response (200):**
```json
{
  "message": "Work schedule updated successfully. Cron job will use new times.",
  "data": {
    "id": 1,
    "workStartTime": "08:00",
    "workEndTime": "16:00",
    "autoAbsentTime": "17:00",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid time format (harus HH:MM)

**Notes:**
- Perubahan `autoAbsentTime` akan mempengaruhi waktu cron job berjalan
- Untuk mengaktifkan perubahan cron job, server perlu di-restart
- `workStartTime` digunakan untuk menentukan apakah karyawan LATE atau ON_TIME saat clock-out

---

### 4. Get Current Work Schedule (Admin)

Mendapatkan konfigurasi work schedule yang sedang aktif.

**Endpoint:** `GET /attendance/admin/work-schedule`

**Authorization:** Admin only (requires admin role)

**Success Response (200):**
```json
{
  "message": "Current work schedule",
  "data": {
    "id": 1,
    "workStartTime": "09:00",
    "workEndTime": "17:00",
    "autoAbsentTime": "18:00",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Holiday Management

### 5. Add Holiday (Admin)

Admin dapat menambahkan tanggal holiday. Pada tanggal holiday, cron job tidak akan menjalankan auto absent, dan user yang tidak clock-in akan di-mark sebagai HOLIDAY.

**Endpoint:** `POST /attendance/admin/holiday`

**Authorization:** Admin only (requires admin role)

**Request Body:**
```json
{
  "date": "2026-12-25",
  "description": "Christmas Day"
}
```

**Parameters:**
- `date` (date, required): Tanggal holiday (format YYYY-MM-DD)
- `description` (string, required): Deskripsi holiday

**Success Response (201):**
```json
{
  "message": "Holiday added successfully",
  "data": {
    "id": 1,
    "date": "2026-12-25",
    "description": "Christmas Day",
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields atau holiday sudah ada untuk tanggal tersebut

---

### 6. Delete Holiday (Admin)

Admin dapat menghapus holiday yang sudah dibuat.

**Endpoint:** `DELETE /attendance/admin/holiday/:id`

**Authorization:** Admin only (requires admin role)

**URL Parameters:**
- `id` (integer): ID holiday yang akan dihapus

**Success Response (200):**
```json
{
  "message": "Holiday deleted successfully",
  "data": {
    "id": 1,
    "date": "2026-12-25",
    "description": "Christmas Day",
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Holiday tidak ditemukan

---

### 7. Get All Holidays (Admin)

Mendapatkan daftar semua holiday yang terdaftar.

**Endpoint:** `GET /attendance/admin/holidays`

**Authorization:** Admin only (requires admin role)

**Success Response (200):**
```json
{
  "message": "All holidays",
  "data": [
    {
      "id": 1,
      "date": "2026-12-25",
      "description": "Christmas Day",
      "isActive": true,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "date": "2026-01-01",
      "description": "New Year's Day",
      "isActive": true,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## Attendance Status Values

Valid status values untuk attendance:
- `ON_PROGRESS`: Sedang bekerja (sudah clock-in, belum clock-out)
- `ON_TIME`: Hadir tepat waktu
- `LATE`: Terlambat
- `ABSENT`: Tidak hadir
- `LEAVE`: Cuti/Izin
- `HOLIDAY`: Hari libur

---

## Notes

1. **Authentication**: Semua endpoint memerlukan authentication token (JWT) di header
2. **Authorization**: Semua endpoint hanya bisa diakses oleh user dengan role `admin`
3. **Cron Job**: Perubahan pada `autoAbsentTime` memerlukan restart server untuk mengaktifkan schedule baru
4. **Holiday Detection**: Cron job otomatis mengecek holiday sebelum menjalankan auto absent
5. **Work Schedule**: Hanya ada 1 work schedule aktif dalam sistem (isActive: true)
