# Testing Admin Endpoints

## Setup
Pastikan server sudah running dan Anda memiliki access token admin.

### Get Admin Token
```bash
# Login sebagai admin
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save token yang didapat, lalu gunakan untuk testing endpoint berikut:

---

## 1. Manual Attendance Management

### Create Manual Attendance
```bash
curl -X POST http://localhost:3000/attendance/admin/manual-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": 2,
    "date": "2026-01-01",
    "clockIn": "2026-01-01T09:00:00",
    "clockOut": "2026-01-01T17:00:00",
    "status": "ON_TIME"
  }'
```

### Update Manual Attendance
```bash
curl -X PUT http://localhost:3000/attendance/admin/manual-attendance/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "LATE",
    "clockIn": "2026-01-01T09:30:00"
  }'
```

---

## 2. Work Schedule Configuration

### Get Current Work Schedule
```bash
curl -X GET http://localhost:3000/attendance/admin/work-schedule \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Work Schedule
```bash
curl -X PUT http://localhost:3000/attendance/admin/work-schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "workStartTime": "08:00",
    "workEndTime": "16:00",
    "autoAbsentTime": "17:00"
  }'
```

**Note:** Setelah mengubah `autoAbsentTime`, restart server untuk mengaktifkan schedule baru.

---

## 3. Holiday Management

### Get All Holidays
```bash
curl -X GET http://localhost:3000/attendance/admin/holidays \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Add Holiday
```bash
curl -X POST http://localhost:3000/attendance/admin/holiday \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "date": "2026-12-25",
    "description": "Christmas Day"
  }'
```

### Add Another Holiday
```bash
curl -X POST http://localhost:3000/attendance/admin/holiday \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "date": "2026-01-01",
    "description": "New Year Day"
  }'
```

### Delete Holiday
```bash
# Replace :id with actual holiday ID
curl -X DELETE http://localhost:3000/attendance/admin/holiday/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 4. Test Complete Flow

### Step 1: Set a holiday for tomorrow
```bash
curl -X POST http://localhost:3000/attendance/admin/holiday \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "date": "2026-01-02",
    "description": "Test Holiday"
  }'
```

### Step 2: Create manual attendance for an employee who couldn't clock in
```bash
curl -X POST http://localhost:3000/attendance/admin/manual-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": 3,
    "date": "2026-01-01",
    "clockIn": "2026-01-01T09:00:00",
    "clockOut": "2026-01-01T17:00:00",
    "status": "ON_TIME"
  }'
```

### Step 3: Update work hours to start earlier
```bash
curl -X PUT http://localhost:3000/attendance/admin/work-schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "workStartTime": "08:00",
    "autoAbsentTime": "17:00"
  }'
```

### Step 4: Verify changes
```bash
# Check work schedule
curl -X GET http://localhost:3000/attendance/admin/work-schedule \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check holidays
curl -X GET http://localhost:3000/attendance/admin/holidays \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check all attendance
curl -X GET http://localhost:3000/attendance/all-attendance \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Expected Behaviors

1. **Manual Attendance**: 
   - Admin dapat membuat attendance untuk user yang tidak bisa clock-in
   - Admin dapat mengedit attendance yang sudah dibuat
   
2. **Work Schedule**:
   - Mengubah jam operasional akan mempengaruhi penentuan LATE/ON_TIME
   - Mengubah autoAbsentTime akan mengatur ulang cron job (perlu restart)
   
3. **Holiday Management**:
   - Pada hari holiday, cron job tidak akan set status ABSENT
   - User yang tidak clock-in akan di-mark sebagai HOLIDAY
   - Holiday bisa ditambah dan dihapus sesuai kebutuhan

---

## Troubleshooting

### Error 401 Unauthorized
- Pastikan token valid dan belum expired
- Pastikan menggunakan format: `Bearer YOUR_TOKEN`

### Error 403 Forbidden
- Pastikan user yang login memiliki role `admin`

### Error 400 Bad Request
- Check format data yang dikirim
- Pastikan semua required fields terisi
- Untuk time format, gunakan HH:MM (e.g., "09:00")
- Untuk date format, gunakan YYYY-MM-DD (e.g., "2026-01-01")

### Cron Job tidak berubah setelah update schedule
- Restart server untuk mengaktifkan schedule baru
- Check console log untuk melihat schedule yang aktif
