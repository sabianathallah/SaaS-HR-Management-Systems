# 🏢 Panduan Cepat: Hybrid Work & Work Location Management

## 📋 Ringkasan Fitur

Sistem ini memungkinkan pegawai untuk:
1. **Hybrid Schedule** - Set jadwal tetap WFH/onsite per minggu
2. **Work Location Change Request** - Request perubahan lokasi kerja untuk hari tertentu

---

## 🚀 Quick Start untuk Pegawai

### 1️⃣ Set Hybrid Schedule (Jadwal Tetap)

**Scenario:** Kamu ingin kerja onsite Senin-Rabu, WFH Kamis-Jumat

```bash
PUT /hybrid-schedules
Authorization: Bearer {your_token}

{
  "schedules": [
    { "dayOfWeek": 1, "locationType": "ONSITE" },  // Senin
    { "dayOfWeek": 2, "locationType": "ONSITE" },  // Selasa
    { "dayOfWeek": 3, "locationType": "ONSITE" },  // Rabu
    { "dayOfWeek": 4, "locationType": "WFH" },     // Kamis
    { "dayOfWeek": 5, "locationType": "WFH" }      // Jumat
  ]
}
```

**Mapping Hari:**
- 0 = Minggu
- 1 = Senin
- 2 = Selasa
- 3 = Rabu
- 4 = Kamis
- 5 = Jumat
- 6 = Sabtu

**Tipe Lokasi:**
- `ONSITE` - Kerja di kantor (butuh GPS)
- `WFH` - Work from home (tidak butuh GPS)
- `REMOTE` - Remote dari mana saja (tidak butuh GPS)

---

### 2️⃣ Request WFH untuk Hari Tertentu

**Scenario:** Besok harusnya onsite, tapi kamu mau WFH karena ada tukang service

```bash
POST /work-location-changes
Authorization: Bearer {your_token}

{
  "requestDate": "2026-01-17",
  "requestedLocationType": "WFH",
  "reason": "Ada service AC di rumah, mohon izin untuk WFH pada hari ini"
}
```

**Notes:**
- Reason minimal 10 karakter
- Tanggal tidak boleh di masa lalu
- Status awal: `PENDING` (menunggu approval admin)

---

### 3️⃣ Lihat Status Request

```bash
GET /work-location-changes
Authorization: Bearer {your_token}
```

**Filter by status:**
```bash
GET /work-location-changes?status=PENDING
GET /work-location-changes?status=APPROVED
GET /work-location-changes?status=REJECTED
```

---

### 4️⃣ Cancel Request (kalau masih PENDING)

```bash
PATCH /work-location-changes/{id}/cancel
Authorization: Bearer {your_token}
```

---

### 5️⃣ Clock-In dengan Work Location

Saat clock-in, sistem otomatis cek:
1. Ada approved change request hari ini? → Pakai itu
2. Kalau tidak, ada hybrid schedule? → Pakai itu
3. Kalau tidak ada keduanya → Default ONSITE

**Contoh Clock-In ONSITE:**
```bash
POST /attendances/clock-in
Authorization: Bearer {your_token}

{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "photo": {file}
}
```
GPS **wajib** untuk onsite!

**Contoh Clock-In WFH:**
```bash
POST /attendances/clock-in
Authorization: Bearer {your_token}

{
  "photo": {file}
}
```
GPS **tidak perlu** untuk WFH/Remote!

---

## 👨‍💼 Quick Start untuk Admin

### 1️⃣ Lihat Semua Request yang Pending

```bash
GET /work-location-changes/admin/pending
Authorization: Bearer {admin_token}
```

---

### 2️⃣ Approve Request

```bash
PATCH /work-location-changes/admin/{id}/approve
Authorization: Bearer {admin_token}
```

---

### 3️⃣ Reject Request

```bash
PATCH /work-location-changes/admin/{id}/reject
Authorization: Bearer {admin_token}

{
  "rejectionReason": "Ada meeting penting yang harus dihadiri di kantor"
}
```

---

### 4️⃣ Set Hybrid Schedule untuk User Tertentu

```bash
PUT /hybrid-schedules/admin/user/{userId}
Authorization: Bearer {admin_token}

{
  "schedules": [
    { "dayOfWeek": 1, "locationType": "ONSITE" },
    { "dayOfWeek": 2, "locationType": "ONSITE" },
    { "dayOfWeek": 3, "locationType": "WFH" }
  ]
}
```

---

### 5️⃣ Lihat Statistik

**Work Location Change Requests:**
```bash
GET /work-location-changes/admin/statistics
Authorization: Bearer {admin_token}
```

**Hybrid Schedules:**
```bash
GET /hybrid-schedules/admin/statistics
Authorization: Bearer {admin_token}
```

---

## 💡 Use Cases Real-World

### Case 1: Full WFH Employee
**Sarah bekerja full remote**

Setup:
```json
{
  "schedules": [
    { "dayOfWeek": 1, "locationType": "WFH" },
    { "dayOfWeek": 2, "locationType": "WFH" },
    { "dayOfWeek": 3, "locationType": "WFH" },
    { "dayOfWeek": 4, "locationType": "WFH" },
    { "dayOfWeek": 5, "locationType": "WFH" }
  ]
}
```
✅ Sarah tidak perlu GPS saat clock-in setiap hari

---

### Case 2: Hybrid 3-2 (3 onsite, 2 WFH)
**John kerja onsite Senin-Rabu, WFH Kamis-Jumat**

Setup:
```json
{
  "schedules": [
    { "dayOfWeek": 1, "locationType": "ONSITE" },
    { "dayOfWeek": 2, "locationType": "ONSITE" },
    { "dayOfWeek": 3, "locationType": "ONSITE" },
    { "dayOfWeek": 4, "locationType": "WFH" },
    { "dayOfWeek": 5, "locationType": "WFH" }
  ]
}
```
✅ Senin-Rabu: GPS required
✅ Kamis-Jumat: GPS not required

---

### Case 3: Request Temporary WFH
**Mike biasanya onsite setiap hari, tapi Rabu ini mau WFH**

1. Mike buat request:
```json
{
  "requestDate": "2026-01-22",
  "requestedLocationType": "WFH",
  "reason": "Ada keperluan pribadi yang mendesak"
}
```

2. Admin approve request

3. **Rabu (22 Jan):** Mike clock-in tanpa GPS ✅
4. **Hari lain:** Mike clock-in dengan GPS seperti biasa ✅

---

### Case 4: Kombinasi Hybrid + Temporary Change
**Lisa punya hybrid schedule, tapi butuh override**

Hybrid schedule Lisa:
- Senin-Rabu: ONSITE
- Kamis-Jumat: WFH

Lisa request WFH untuk Selasa:
```json
{
  "requestDate": "2026-01-21",
  "requestedLocationType": "WFH",
  "reason": "Sakit ringan, lebih baik WFH"
}
```

Setelah di-approve:
- **Senin:** ONSITE (from hybrid schedule)
- **Selasa:** WFH (from approved request) 🎯
- **Rabu:** ONSITE (from hybrid schedule)
- **Kamis:** WFH (from hybrid schedule)
- **Jumat:** WFH (from hybrid schedule)

---

## ⚠️ Important Notes

### Priority System
```
1. Approved Work Location Change Request (highest)
   ↓
2. Hybrid Schedule
   ↓
3. Default ONSITE (lowest)
```

### GPS Validation
- ✅ **Required:** `ONSITE` work
- ❌ **Not Required:** `WFH` atau `REMOTE` work
- ❌ **Not Required:** Flexible shift (regardless of location type)

### Request Rules
- ❌ Cannot request for past dates
- ❌ Cannot have duplicate pending/approved requests for same date
- ❌ Cannot request same location type as current schedule
- ✅ Can cancel PENDING requests
- ❌ Cannot cancel APPROVED/REJECTED/CANCELLED requests

### Hybrid Schedule
- ✅ Can define schedule for any day (0-6)
- ✅ Don't need to define all days (undefined = default ONSITE)
- ✅ Update will replace all existing schedules
- ✅ Can delete to reset to default

---

## 🔍 Check Your Location Settings

### Untuk Pegawai:
```bash
# Lihat hybrid schedule kamu
GET /hybrid-schedules

# Lihat request yang aktif
GET /work-location-changes?status=APPROVED
```

### Response akan ada info work location:
```json
{
  "locationInfo": {
    "workLocationType": "WFH",
    "workLocationSource": "HYBRID_SCHEDULE",
    "message": "Working from home - location not required",
    "requiresGPS": false
  }
}
```

**Work Location Source:**
- `TEMPORARY_CHANGE` - Dari approved work location change request
- `HYBRID_SCHEDULE` - Dari hybrid schedule
- `DEFAULT` - Default onsite (tidak ada schedule)

---

## 📊 Dashboard Integration

### Untuk Frontend Developer:

**Display Work Location Badge:**
```javascript
// Get work location for today
const workLocation = await getWorkLocationInfo(userId, new Date());

// Show badge
if (workLocation.source === 'TEMPORARY_CHANGE') {
  return <Badge color="orange">WFH (Temporary)</Badge>
} else if (workLocation.source === 'HYBRID_SCHEDULE') {
  return <Badge color="blue">WFH (Schedule)</Badge>
} else {
  return <Badge color="green">Onsite</Badge>
}
```

**Reminder sebelum Clock-In:**
```javascript
if (workLocation.requiresGPS) {
  alert('Reminder: GPS location required for onsite attendance');
} else {
  alert('You can clock-in without GPS today (WFH/Remote)');
}
```

---

## ✅ Checklist Implementasi

### Backend (Done ✅)
- [x] Model: WorkLocationChangeRequest
- [x] Model: HybridSchedule
- [x] Controller: Employee endpoints
- [x] Controller: Admin endpoints
- [x] Routes: Employee & Admin
- [x] Helper: Work location determination
- [x] Integration: Attendance clock-in
- [x] Migration: Database tables
- [x] Tests: Unit & integration tests
- [x] Documentation: API docs

### Frontend (To Do 📝)
- [ ] UI: Hybrid schedule management
- [ ] UI: Work location change request form
- [ ] UI: Admin approval page
- [ ] UI: Dashboard badge/indicator
- [ ] UI: Statistics charts
- [ ] Integration: Attendance with location check
- [ ] Notification: Request status updates

---

## 🐛 Troubleshooting

### "GPS location is required for onsite attendance"
✅ Check if you have approved WFH request for today
✅ Check if your hybrid schedule shows WFH for today
✅ Make sure you enable GPS on your device

### "You already have a pending or approved request for this date"
✅ Check existing requests: `GET /work-location-changes`
✅ Cancel pending request if needed
✅ Wait for admin to process current request

### "Request date cannot be in the past"
✅ Make sure requestDate is today or future date
✅ Use format: YYYY-MM-DD

### "Only pending requests can be cancelled"
✅ You can only cancel requests with status PENDING
✅ Contact admin if need to cancel approved request

---

## 📞 Support

Untuk pertanyaan lebih lanjut:
- Email: hr@company.com
- Slack: #hr-support
- Phone: ext. 1234

---

**Last Updated:** January 16, 2026
**Version:** 1.0.0
