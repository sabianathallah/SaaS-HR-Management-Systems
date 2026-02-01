# Work Location Management API Documentation

## Overview
Sistem manajemen lokasi kerja yang memungkinkan pegawai untuk:
1. Memiliki jadwal hybrid (kombinasi onsite/WFH/remote dalam seminggu)
2. Request perubahan lokasi kerja sementara untuk hari tertentu

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     WORK LOCATION SYSTEM                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
         ┌──────────▼──────────┐  ┌────▼─────────────────┐
         │  Hybrid Schedule    │  │ Location Change      │
         │  (Recurring)        │  │ Request (Temporary)  │
         └─────────────────────┘  └──────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Attendance System  │
                    │ - Clock In/Out     │
                    │ - GPS Validation   │
                    └────────────────────┘
```

## Priority System

Ketika menentukan lokasi kerja untuk hari tertentu:

1. **Approved Work Location Change Request** (Priority 1)
   - Temporary override untuk tanggal spesifik
   - Hanya berlaku untuk tanggal yang di-approve

2. **Hybrid Schedule** (Priority 2)
   - Recurring pattern berdasarkan hari dalam seminggu
   - Contoh: Senin-Rabu onsite, Kamis-Jumat WFH

3. **Default: ONSITE** (Priority 3)
   - Jika tidak ada schedule atau request

---

## 1. Work Location Change Request (Employee)

### Create Request
Request perubahan lokasi kerja untuk hari tertentu.

**Endpoint:** `POST /work-location-changes`

**Request Body:**
```json
{
  "requestDate": "2026-01-20",
  "requestedLocationType": "WFH",
  "reason": "Ada keperluan keluarga, mohon izin WFH untuk hari ini"
}
```

**Field Description:**
- `requestDate` (required): Tanggal yang direquest (format: YYYY-MM-DD)
- `requestedLocationType` (required): Tipe lokasi yang diminta
  - `ONSITE`: Kerja di kantor
  - `WFH`: Work from home
  - `REMOTE`: Remote (bisa dari mana saja)
- `reason` (required): Alasan request (min 10, max 500 karakter)

**Response (201):**
```json
{
  "message": "Work location change request created successfully",
  "data": {
    "id": 1,
    "UserId": 5,
    "requestDate": "2026-01-20",
    "originalLocationType": "ONSITE",
    "requestedLocationType": "WFH",
    "reason": "Ada keperluan keluarga, mohon izin WFH untuk hari ini",
    "status": "PENDING",
    "approvedBy": null,
    "approvalDate": null,
    "rejectionReason": null,
    "createdAt": "2026-01-16T13:30:00.000Z",
    "updatedAt": "2026-01-16T13:30:00.000Z",
    "employee": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Software Engineer",
      "department": "IT"
    }
  }
}
```

**Validation Rules:**
- Request date tidak boleh di masa lalu
- Tidak boleh ada request PENDING/APPROVED untuk tanggal yang sama
- Tidak boleh request ke lokasi yang sama dengan schedule saat ini

---

### Get Own Requests
Melihat semua request yang pernah dibuat.

**Endpoint:** `GET /work-location-changes`

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `startDate` (optional): Filter mulai dari tanggal (YYYY-MM-DD)
- `endDate` (optional): Filter sampai tanggal (YYYY-MM-DD)

**Example:**
```
GET /work-location-changes?status=PENDING
GET /work-location-changes?startDate=2026-01-01&endDate=2026-01-31
```

**Response (200):**
```json
{
  "message": "Work location change requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "requestDate": "2026-01-20",
      "originalLocationType": "ONSITE",
      "requestedLocationType": "WFH",
      "reason": "Ada keperluan keluarga",
      "status": "PENDING",
      "approvedBy": null,
      "approvalDate": null,
      "rejectionReason": null,
      "createdAt": "2026-01-16T13:30:00.000Z",
      "updatedAt": "2026-01-16T13:30:00.000Z",
      "approver": null
    }
  ]
}
```

---

### Cancel Request
Cancel request yang masih PENDING.

**Endpoint:** `PATCH /work-location-changes/:id/cancel`

**Response (200):**
```json
{
  "message": "Request cancelled successfully",
  "data": {
    "id": 1,
    "status": "CANCELLED",
    ...
  }
}
```

**Validation:**
- Hanya request dengan status PENDING yang bisa di-cancel

---

## 2. Work Location Change Request (Admin)

### Get All Requests
Admin melihat semua requests dari semua pegawai.

**Endpoint:** `GET /work-location-changes/admin`

**Query Parameters:**
- `status` (optional): Filter by status
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter dari tanggal
- `endDate` (optional): Filter sampai tanggal
- `page` (optional, default: 1): Halaman
- `limit` (optional, default: 10): Items per halaman

**Response (200):**
```json
{
  "message": "Work location change requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "requestDate": "2026-01-20",
      "originalLocationType": "ONSITE",
      "requestedLocationType": "WFH",
      "reason": "Ada keperluan keluarga",
      "status": "PENDING",
      "employee": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "position": "Software Engineer",
        "department": "IT"
      },
      "approver": null
    }
  ],
  "pagination": {
    "totalItems": 50,
    "totalPages": 5,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### Get Pending Requests
Admin melihat requests yang perlu di-review.

**Endpoint:** `GET /work-location-changes/admin/pending`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

---

### Approve Request
Admin approve request pegawai.

**Endpoint:** `PATCH /work-location-changes/admin/:id/approve`

**Response (200):**
```json
{
  "message": "Work location change request approved successfully",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "approvedBy": 1,
    "approvalDate": "2026-01-16T14:00:00.000Z",
    ...
  }
}
```

---

### Reject Request
Admin reject request dengan alasan.

**Endpoint:** `PATCH /work-location-changes/admin/:id/reject`

**Request Body:**
```json
{
  "rejectionReason": "Request tidak dapat disetujui karena ada meeting penting di kantor"
}
```

**Response (200):**
```json
{
  "message": "Work location change request rejected successfully",
  "data": {
    "id": 1,
    "status": "REJECTED",
    "approvedBy": 1,
    "approvalDate": "2026-01-16T14:00:00.000Z",
    "rejectionReason": "Request tidak dapat disetujui karena ada meeting penting di kantor",
    ...
  }
}
```

---

### Get Statistics
Admin melihat statistik work location change requests.

**Endpoint:** `GET /work-location-changes/admin/statistics`

**Query Parameters:**
- `startDate` (optional): Filter dari tanggal
- `endDate` (optional): Filter sampai tanggal

**Response (200):**
```json
{
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 100,
    "byStatus": {
      "pending": 10,
      "approved": 70,
      "rejected": 15,
      "cancelled": 5
    },
    "byLocationType": {
      "WFH": 60,
      "REMOTE": 30,
      "ONSITE": 10
    }
  }
}
```

---

## 3. Hybrid Schedule (Employee)

### Get Own Schedule
Melihat jadwal hybrid sendiri.

**Endpoint:** `GET /hybrid-schedules`

**Response (200):**
```json
{
  "message": "Hybrid schedule retrieved successfully",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "dayOfWeek": 1,
      "dayName": "Monday",
      "locationType": "ONSITE",
      "isActive": true,
      "createdAt": "2026-01-16T13:00:00.000Z",
      "updatedAt": "2026-01-16T13:00:00.000Z"
    },
    {
      "id": 2,
      "UserId": 5,
      "dayOfWeek": 2,
      "dayName": "Tuesday",
      "locationType": "ONSITE",
      "isActive": true
    },
    {
      "id": 3,
      "UserId": 5,
      "dayOfWeek": 3,
      "dayName": "Wednesday",
      "locationType": "ONSITE",
      "isActive": true
    },
    {
      "id": 4,
      "UserId": 5,
      "dayOfWeek": 4,
      "dayName": "Thursday",
      "locationType": "WFH",
      "isActive": true
    },
    {
      "id": 5,
      "UserId": 5,
      "dayOfWeek": 5,
      "dayName": "Friday",
      "locationType": "WFH",
      "isActive": true
    }
  ]
}
```

**Day of Week Mapping:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

---

### Create/Update Schedule
Membuat atau update jadwal hybrid.

**Endpoint:** `PUT /hybrid-schedules`

**Request Body:**
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

**Notes:**
- Tidak perlu define semua hari, hanya hari kerja saja
- Update akan replace semua schedule yang ada
- Hari yang tidak di-define akan menggunakan default ONSITE

**Response (200):**
```json
{
  "message": "Hybrid schedule updated successfully",
  "data": [
    {
      "id": 1,
      "UserId": 5,
      "dayOfWeek": 1,
      "dayName": "Monday",
      "locationType": "ONSITE",
      "isActive": true
    },
    ...
  ]
}
```

---

### Delete Schedule
Hapus jadwal hybrid (kembali ke default onsite semua).

**Endpoint:** `DELETE /hybrid-schedules`

**Response (200):**
```json
{
  "message": "Hybrid schedule deleted successfully. You will use the default onsite schedule."
}
```

---

## 4. Hybrid Schedule (Admin)

### Get All Schedules
Admin melihat semua hybrid schedules.

**Endpoint:** `GET /hybrid-schedules/admin`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `department` (optional): Filter by department
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "message": "Hybrid schedules retrieved successfully",
  "data": [
    {
      "user": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "position": "Software Engineer",
        "department": "IT"
      },
      "schedules": [
        {
          "id": 1,
          "dayOfWeek": 1,
          "dayName": "Monday",
          "locationType": "ONSITE",
          "isActive": true
        },
        {
          "id": 2,
          "dayOfWeek": 4,
          "dayName": "Thursday",
          "locationType": "WFH",
          "isActive": true
        }
      ]
    }
  ],
  "pagination": {
    "totalItems": 25,
    "currentPage": 1,
    "itemsPerPage": 10
  }
}
```

---

### Get Schedule by User ID
Admin melihat hybrid schedule user tertentu.

**Endpoint:** `GET /hybrid-schedules/admin/user/:userId`

**Response (200):**
```json
{
  "message": "Hybrid schedule retrieved successfully",
  "data": {
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Software Engineer",
      "department": "IT"
    },
    "schedules": [...]
  }
}
```

---

### Create/Update Schedule for User
Admin membuat atau update hybrid schedule untuk user tertentu.

**Endpoint:** `PUT /hybrid-schedules/admin/user/:userId`

**Request Body:**
```json
{
  "schedules": [
    { "dayOfWeek": 1, "locationType": "ONSITE" },
    { "dayOfWeek": 2, "locationType": "ONSITE" },
    { "dayOfWeek": 3, "locationType": "WFH" }
  ]
}
```

---

### Delete Schedule for User
Admin hapus hybrid schedule user tertentu.

**Endpoint:** `DELETE /hybrid-schedules/admin/user/:userId`

**Response (200):**
```json
{
  "message": "Hybrid schedule deleted successfully for John Doe. User will use the default onsite schedule."
}
```

---

### Get Statistics
Admin melihat statistik hybrid schedules.

**Endpoint:** `GET /hybrid-schedules/admin/statistics`

**Response (200):**
```json
{
  "message": "Statistics retrieved successfully",
  "data": {
    "totalUsersWithHybridSchedule": 25,
    "breakdownByDay": {
      "Monday": { "ONSITE": 20, "WFH": 5, "REMOTE": 0 },
      "Tuesday": { "ONSITE": 18, "WFH": 7, "REMOTE": 0 },
      "Wednesday": { "ONSITE": 15, "WFH": 8, "REMOTE": 2 },
      "Thursday": { "ONSITE": 12, "WFH": 10, "REMOTE": 3 },
      "Friday": { "ONSITE": 10, "WFH": 12, "REMOTE": 3 },
      "Saturday": { "ONSITE": 5, "WFH": 2, "REMOTE": 0 },
      "Sunday": { "ONSITE": 0, "WFH": 0, "REMOTE": 0 }
    }
  }
}
```

---

## 5. Integration with Attendance System

### Clock-In with Work Location

Saat clock-in, sistem akan otomatis:
1. Check approved work location change request untuk hari ini
2. Jika tidak ada, check hybrid schedule untuk hari ini
3. Jika tidak ada keduanya, gunakan default ONSITE

**GPS Validation:**
- GPS **REQUIRED** jika location type = ONSITE
- GPS **NOT REQUIRED** jika location type = WFH atau REMOTE

**Example Response:**
```json
{
  "message": "Clock-in successful",
  "data": {
    "id": 123,
    "UserId": 5,
    "date": "2026-01-16T13:00:00.000Z",
    "clockIn": "2026-01-16T13:00:00.000Z",
    "status": "ON_PROGRESS",
    "locationInfo": {
      "workLocationType": "WFH",
      "workLocationSource": "HYBRID_SCHEDULE",
      "message": "Working from home - location not required",
      "requiresGPS": false
    }
  }
}
```

**Location Info Fields:**
- `workLocationType`: ONSITE, WFH, atau REMOTE
- `workLocationSource`:
  - `TEMPORARY_CHANGE`: Dari approved work location change request
  - `HYBRID_SCHEDULE`: Dari hybrid schedule
  - `DEFAULT`: Default onsite
- `requiresGPS`: Boolean, apakah perlu validasi GPS

---

## Use Cases

### Use Case 1: Pegawai dengan Hybrid Schedule Tetap
```
John bekerja 3 hari onsite (Mon-Wed), 2 hari WFH (Thu-Fri)

1. Setup hybrid schedule:
   PUT /hybrid-schedules
   {
     "schedules": [
       { "dayOfWeek": 1, "locationType": "ONSITE" },
       { "dayOfWeek": 2, "locationType": "ONSITE" },
       { "dayOfWeek": 3, "locationType": "ONSITE" },
       { "dayOfWeek": 4, "locationType": "WFH" },
       { "dayOfWeek": 5, "locationType": "WFH" }
     ]
   }

2. Clock-in Senin-Rabu: GPS required
3. Clock-in Kamis-Jumat: GPS not required
```

### Use Case 2: Request WFH untuk Hari Tertentu
```
Sarah biasanya onsite setiap hari, tapi ada keperluan Rabu ini

1. Create request:
   POST /work-location-changes
   {
     "requestDate": "2026-01-22",
     "requestedLocationType": "WFH",
     "reason": "Ada tukang service AC di rumah"
   }

2. Admin approve request

3. Clock-in tanggal 22 Jan: GPS not required (temporary override)
4. Clock-in tanggal lain: GPS required (back to default)
```

### Use Case 3: Kombinasi Hybrid Schedule + Temporary Change
```
Mike punya hybrid schedule: Mon-Wed onsite, Thu-Fri WFH
Tapi Senin ini dia request WFH

1. Hybrid schedule sudah ada
2. Create request untuk Senin:
   POST /work-location-changes
   {
     "requestDate": "2026-01-20",
     "requestedLocationType": "WFH",
     "reason": "Sakit ringan, lebih baik WFH"
   }

3. Admin approve

4. Clock-in Senin: WFH (from temporary change)
5. Clock-in Selasa: ONSITE (from hybrid schedule)
6. Clock-in Rabu: ONSITE (from hybrid schedule)
7. Clock-in Kamis: WFH (from hybrid schedule)
```

---

## Error Codes

### Work Location Change Request
- `PHOTO_REQUIRED`: Foto wajib untuk clock-in
- `GPS_REQUIRED`: GPS wajib untuk onsite attendance
- `REQUEST_DATE_PAST`: Request date di masa lalu
- `DUPLICATE_REQUEST`: Sudah ada request untuk tanggal yang sama
- `SAME_LOCATION`: Request lokasi sama dengan schedule saat ini
- `NOT_PENDING`: Hanya pending request yang bisa dicancel
- `NOT_FOUND`: Request tidak ditemukan

### Hybrid Schedule
- `INVALID_DAY`: Day of week harus 0-6
- `INVALID_LOCATION_TYPE`: Location type harus ONSITE/WFH/REMOTE
- `USER_NOT_FOUND`: User tidak ditemukan

---

## Notes

1. **Priority System**: Work location change request > Hybrid schedule > Default onsite
2. **GPS Validation**: Hanya required untuk ONSITE work
3. **Flexible Shift**: Tetap tidak require GPS meskipun ada location type
4. **Admin Control**: Admin bisa set hybrid schedule untuk semua user
5. **Employee Self-Service**: Employee bisa set hybrid schedule sendiri (optional, bisa dimatikan)
