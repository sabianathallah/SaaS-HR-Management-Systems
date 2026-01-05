# Quick Start - Shift Feature

## Setup Database

```bash
# Run migrations
cd server
npx sequelize-cli db:migrate

# Run shift seeder
npx sequelize-cli db:seed --seed 20260105050944-demo-shifts.js
```

## Available Shifts

Setelah seeder dijalankan, tersedia 4 shift default:

| ID | Name | Time | Tolerance | Overtime Threshold | Flexible |
|----|------|------|-----------|-------------------|----------|
| 1 | Shift Pagi | 07:00 - 15:00 | 15 min | 15 min | No |
| 2 | Shift Siang | 09:00 - 17:00 | 15 min | 15 min | No |
| 3 | Shift Malam | 15:00 - 23:00 | 15 min | 15 min | No |
| 4 | Flexible | 00:00 - 23:59 | 0 min | 60 min | Yes |

## Quick Test

### 1. Login sebagai Admin
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mail.com",
    "password": "admin123"
  }'
```

### 2. Get All Shifts
```bash
curl -X GET http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Assign Shift to User
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/users/2/shift \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "shiftId": 1 }'
```

## How It Works

### Late Calculation
```
User dengan Shift Pagi (07:00 - 15:00, tolerance 15 min):
- Clock-in 07:10 → ON_TIME (dalam tolerance)
- Clock-in 07:20 → LATE (20 menit terlambat, melewati tolerance 15 menit)
```

### Overtime Calculation
```
User dengan Shift Siang (09:00 - 17:00, threshold 15 min):
- Clock-out 17:10 → No overtime (10 menit < threshold 15 menit)
- Clock-out 17:30 → Overtime 30 menit (30 menit > threshold 15 menit)
```

### Flexible Shift
```
User dengan Flexible shift:
- Clock-in kapan saja → Selalu ON_TIME
- No automatic late checking
- Higher overtime threshold (60 min)
```

## API Endpoints

All shift management endpoints require **Admin role**:

- `GET /api/shifts/admin/shifts` - Get all shifts
- `GET /api/shifts/admin/shifts/:id` - Get shift by ID
- `POST /api/shifts/admin/shifts` - Create new shift
- `PUT /api/shifts/admin/shifts/:id` - Update shift
- `DELETE /api/shifts/admin/shifts/:id` - Delete shift
- `PUT /api/shifts/admin/users/:userId/shift` - Assign shift to user
- `DELETE /api/shifts/admin/users/:userId/shift` - Remove shift from user

## Documentation

Lihat dokumentasi lengkap di:
- `docs (md)/SHIFT_FEATURE.md` - Dokumentasi lengkap fitur
- `docs (md)/TESTING_SHIFT_ENDPOINTS.md` - Testing guide
- `docs (md)/SHIFT_INTEGRATION_GUIDE.md` - Integration guide

## Files Created/Modified

### New Files
- `migrations/20260105050612-create-shift.js`
- `migrations/20260105050643-add-shift-to-users-and-attendances.js`
- `models/shift.js`
- `helpers/shift.js`
- `controllers/shiftAdminController.js`
- `routes/shift_isAdmin.js`
- `seeders/20260105050944-demo-shifts.js`

### Modified Files
- `models/user.js` - Added Shift relation
- `models/attendance.js` - Added Shift relation
- `routes/index.js` - Added shift routes
- `helpers/attendance.js` - Added shift support
