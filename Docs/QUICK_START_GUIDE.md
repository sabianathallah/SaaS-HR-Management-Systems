# 🚀 QUICK START GUIDE - Work Location & Hybrid Schedule

## Untuk Developer

### 1. Jalankan Migrations
```bash
cd server
npx sequelize-cli db:migrate
```

### 2. Start Backend
```bash
cd server
npm start
# Server running on http://localhost:3000
```

### 3. Start Frontend
```bash
cd client_Salmon-HRIS
npm run dev
# Frontend running on http://localhost:5173
```

---

## Untuk Employee (User Testing)

### ✅ Cara Set Hybrid Schedule

1. Login sebagai employee
2. Klik tab **📍 Work Location**
3. Di section **Hybrid Work Schedule**, klik **Edit Schedule**
4. Pilih lokasi untuk setiap hari:
   - Senin: ONSITE 🏢
   - Selasa: WFH 🏠
   - Rabu: ONSITE 🏢
   - Kamis: WFH 🏠
   - Jumat: REMOTE 🌍
5. Klik **Simpan**

**Result**: Schedule akan otomatis berlaku setiap minggu!

---

### ✅ Cara Request Perubahan Lokasi Sementara

1. Login sebagai employee
2. Klik tab **📍 Work Location**
3. Scroll ke section **Work Location Change Request**
4. Klik **Buat Request**
5. Isi form:
   - **Tanggal**: Pilih tanggal (harus besok atau lebih)
   - **Tipe Lokasi**: Pilih WFH/Remote/Onsite
   - **Alasan**: Jelaskan alasan (min 10 karakter)
6. Klik **Submit Request**

**Result**: Request masuk ke admin dengan status PENDING ⏳

---

### ✅ Cara Cancel Request

1. Cek **Riwayat Request**
2. Cari request dengan status **PENDING**
3. Klik button **Cancel**
4. Confirm

**Result**: Status berubah menjadi CANCELLED

---

## Untuk Admin (User Testing)

### ✅ Cara Approve Request

1. Login sebagai admin
2. Klik menu **🏢 Work Location Requests**
3. Tab **Pending Requests** akan terbuka
4. Lihat detail request dari employee
5. Klik button **Approve** (hijau)
6. Confirm

**Result**: Status berubah menjadi APPROVED ✅, employee dapat notifikasi

---

### ✅ Cara Reject Request

1. Login sebagai admin
2. Klik menu **🏢 Work Location Requests**
3. Tab **Pending Requests**
4. Klik button **Reject** (merah)
5. Isi **Alasan Penolakan** (min 10 karakter)
6. Klik **Tolak Request**

**Result**: Status berubah menjadi REJECTED ❌, employee dapat notifikasi

---

### ✅ Cara Lihat Statistik

1. Login sebagai admin
2. Klik menu **🏢 Work Location Requests**
3. Klik tab **Statistics**
4. Lihat breakdown:
   - Total Requests
   - By Status (Pending, Approved, Rejected, Cancelled)
   - By Location Type (ONSITE, WFH, REMOTE)

---

### ✅ Cara Kelola Hybrid Schedule Employee

1. Login sebagai admin
2. Klik menu **🔄 Hybrid Schedules**
3. Lihat grid schedule semua employee
4. Klik **Edit Schedule** pada employee tertentu
5. Set schedule per hari untuk employee tersebut
6. Klik **Simpan Schedule**

**Result**: Schedule employee terupdate

---

## Flow Attendance dengan Work Location

### Scenario 1: Employee punya Hybrid Schedule
```
Hari: Senin
Hybrid Schedule: ONSITE
Employee clock-in: GPS REQUIRED ✅
```

### Scenario 2: Employee punya Request yang Diapprove
```
Hari: Selasa
Hybrid Schedule: ONSITE
Approved Request: WFH (priority lebih tinggi!)
Employee clock-in: GPS OPTIONAL ✅
```

### Scenario 3: Employee tidak punya Schedule
```
Hari: Rabu
Hybrid Schedule: (tidak ada)
Default: ONSITE
Employee clock-in: GPS REQUIRED ✅
```

---

## Testing Checklist

### Backend Testing
```bash
# Test endpoints dengan curl/Postman

# 1. Get employee schedule
GET /hybrid-schedules
Authorization: Bearer <employee_token>

# 2. Create work location request
POST /work-location-changes
Authorization: Bearer <employee_token>
Body: {
  "requestDate": "2025-01-20",
  "requestedLocationType": "WFH",
  "reason": "Need to work from home for personal matter"
}

# 3. Admin get pending requests
GET /work-location-changes/admin/pending
Authorization: Bearer <admin_token>

# 4. Admin approve request
PATCH /work-location-changes/admin/:id/approve
Authorization: Bearer <admin_token>
```

### Frontend Testing
1. [ ] Employee dapat set hybrid schedule
2. [ ] Employee dapat create request
3. [ ] Employee dapat cancel request
4. [ ] Employee dapat lihat history
5. [ ] Admin dapat approve request
6. [ ] Admin dapat reject request dengan alasan
7. [ ] Admin dapat lihat statistics
8. [ ] Admin dapat edit employee schedule
9. [ ] Tab navigation bekerja dengan baik
10. [ ] No console errors

---

## Common Test Cases

### Test Case 1: Request untuk Tanggal di Masa Lalu
**Steps:**
1. Employee pilih tanggal kemarin
2. Submit form

**Expected**: Error "Tidak dapat membuat request untuk tanggal yang sudah lewat!"

---

### Test Case 2: Duplicate Request
**Steps:**
1. Employee create request untuk tanggal X
2. Employee create request lagi untuk tanggal X yang sama

**Expected**: Error dari backend

---

### Test Case 3: Reject Tanpa Alasan
**Steps:**
1. Admin klik Reject
2. Kosongkan field alasan
3. Klik Tolak Request

**Expected**: Error "Alasan penolakan harus diisi!"

---

### Test Case 4: GPS Validation untuk WFH
**Steps:**
1. Employee set schedule Senin = WFH
2. Senin pagi, employee clock-in tanpa GPS

**Expected**: Clock-in berhasil (GPS optional untuk WFH)

---

## Troubleshooting

### Problem: "Unauthorized" error
**Solution**: 
- Cek token di localStorage
- Login ulang
- Verify token belum expired

### Problem: Request tidak muncul
**Solution**:
- Refresh page
- Cek filter settings
- Verify API response di Network tab

### Problem: Schedule tidak save
**Solution**:
- Cek console untuk errors
- Verify format data (dayOfWeek: 0-6)
- Check backend logs

### Problem: GPS validation masih required untuk WFH
**Solution**:
- Verify `helpers/workLocation.js` imported correctly
- Check `attendanceController.js` integration
- Clear browser cache

---

## API Response Examples

### GET /hybrid-schedules
```json
{
  "message": "Schedule fetched successfully",
  "data": [
    {
      "id": "uuid",
      "UserId": "uuid",
      "dayOfWeek": 1,
      "locationType": "ONSITE",
      "dayName": "Senin"
    },
    {
      "id": "uuid",
      "UserId": "uuid",
      "dayOfWeek": 2,
      "locationType": "WFH",
      "dayName": "Selasa"
    }
  ]
}
```

### POST /work-location-changes
```json
{
  "message": "Work location change request created successfully",
  "data": {
    "id": "uuid",
    "UserId": "uuid",
    "requestDate": "2025-01-20",
    "originalLocationType": "ONSITE",
    "requestedLocationType": "WFH",
    "reason": "Personal matter",
    "status": "PENDING"
  }
}
```

### GET /work-location-changes/admin/statistics
```json
{
  "message": "Statistics fetched successfully",
  "data": {
    "total": 15,
    "byStatus": {
      "pending": 3,
      "approved": 10,
      "rejected": 2,
      "cancelled": 0
    },
    "byLocationType": {
      "WFH": 8,
      "REMOTE": 5,
      "ONSITE": 2
    }
  }
}
```

---

## Environment Variables

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```env
VITE_BASE_URL=http://localhost:3000
```

---

## Database Verification

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('WorkLocationChangeRequests', 'HybridSchedules');

-- Check sample data
SELECT * FROM "WorkLocationChangeRequests" LIMIT 5;
SELECT * FROM "HybridSchedules" LIMIT 5;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('WorkLocationChangeRequests', 'HybridSchedules');
```

---

## Performance Tips

1. **Enable Pagination**: Always use `page` and `limit` params
2. **Use Filters**: Filter by status, date to reduce data load
3. **Cache Statistics**: Statistics can be cached for 5 minutes
4. **Lazy Load**: Components load only when tab is active

---

## Security Checklist

- [x] All endpoints require authentication
- [x] Admin endpoints check role
- [x] Input validation on both client & server
- [x] SQL injection prevented (Sequelize)
- [x] XSS prevented (React)
- [x] CSRF protection enabled
- [x] Rate limiting recommended (future)

---

## Next Steps After Testing

1. ✅ Verify all features work
2. ✅ Fix any bugs found
3. ✅ Add more test cases if needed
4. ✅ Update documentation with findings
5. ✅ Deploy to staging environment
6. ✅ Get user feedback
7. ✅ Deploy to production

---

**🎯 Happy Testing! 🚀**

For questions or issues, refer to:
- `FINAL_COMPLETE_SUMMARY.md` - Full documentation
- `FRONTEND_IMPLEMENTATION.md` - Frontend details
- `server/docs (md)/WORK_LOCATION_QUICKSTART.md` - API guide
