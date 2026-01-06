# 📍 GPS & GEO-FENCING FEATURE

## 🎯 OVERVIEW

Sistem GPS dan Geo-Fencing untuk memastikan karyawan clock-in/out dari lokasi yang valid. Menggunakan **Haversine Formula** untuk menghitung jarak GPS dengan akurat.

## ✨ KEY FEATURES

### 1️⃣ **GPS Location Tracking**
- Capture koordinat GPS saat clock-in dan clock-out
- Simpan latitude & longitude di database
- Format: Decimal Degrees (DD)

### 2️⃣ **Geo-Fencing (Radius Validation)**
- Admin bisa set multiple lokasi kantor
- Setiap lokasi punya radius (default: 50m)
- **Rekomendasi radius:** 30-100 meter
  - 30m: Strict (untuk area kecil)
  - 50m: Balanced (recommended) ✅
  - 100m: Loose (untuk area besar/GPS tidak akurat)

### 3️⃣ **Smart Validation**
- **Flexible Shift (WFH):** Bebas clock-in dari mana saja
- **Office Shift:** Harus dalam radius lokasi kantor
- **Soft Validation:** Tidak reject langsung, tapi tandai untuk review admin

### 4️⃣ **Multi-Location Support**
- Admin bisa tambah banyak lokasi kantor (HQ, Branch, dll)
- Sistem otomatis pilih kantor terdekat
- Hitung jarak dari setiap lokasi

---

## 🏗️ DATABASE SCHEMA

### Tabel: `office_locations`
```sql
id                INT PRIMARY KEY
name              VARCHAR(255)        -- Nama lokasi (e.g., "HQ Jakarta")
address           TEXT                -- Alamat lengkap
latitude          DECIMAL(10,8)       -- -90 to 90
longitude         DECIMAL(11,8)       -- -180 to 180
radius            INT                 -- Dalam meter (default: 50)
is_active         BOOLEAN             -- Status aktif
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### Update Tabel: `attendances`
```sql
-- Kolom baru untuk GPS tracking
clock_in_latitude          DECIMAL(10,8)
clock_in_longitude         DECIMAL(11,8)
clock_out_latitude         DECIMAL(10,8)
clock_out_longitude        DECIMAL(11,8)
office_location_id         INT                -- FK ke office_locations
location_validation_status ENUM               -- 'valid', 'outside_radius', 'gps_error', 'not_checked'
distance_from_office       DECIMAL(10,2)      -- Jarak dalam meter
```

---

## 🔐 VALIDATION STATUS

| Status | Deskripsi | Action |
|--------|-----------|---------|
| `valid` | Dalam radius kantor | ✅ Approved |
| `outside_radius` | Diluar radius | ⚠️ Tandai untuk review admin |
| `gps_error` | GPS error/invalid | ❌ Error GPS |
| `not_checked` | WFH/Flexible shift | ℹ️ Tidak perlu validasi |

---

## 🚀 API ENDPOINTS

### 🔹 **EMPLOYEE - Clock In/Out dengan GPS**

#### **POST /attendances/clock-in**
```json
{
  "latitude": -6.200000,
  "longitude": 106.816666,
  "photo": "file upload"
}
```

**Response (Office Shift - Valid):**
```json
{
  "message": "Clock-in successful",
  "data": {
    "id": 123,
    "userId": 5,
    "clockIn": "2026-01-06T08:00:00Z",
    "status": "ON_PROGRESS",
    "clockInLatitude": -6.200000,
    "clockInLongitude": 106.816666,
    "officeLocationId": 1,
    "locationValidationStatus": "valid",
    "distanceFromOffice": 25.5,
    "locationInfo": {
      "validationStatus": "valid",
      "message": "Anda berada dalam radius 50m dari HQ Jakarta",
      "distance": "26m",
      "officeName": "HQ Jakarta"
    }
  },
  "photoInfo": {
    "uploaded": true,
    "path": "uploads/attendance/...",
    "size": "245 KB"
  }
}
```

**Response (Office Shift - Outside Radius):**
```json
{
  "message": "Clock-in successful",
  "data": {
    "locationValidationStatus": "outside_radius",
    "distanceFromOffice": 150.5,
    "locationInfo": {
      "validationStatus": "outside_radius",
      "message": "Anda berada 151m dari HQ Jakarta (radius maksimal: 50m)",
      "distance": "151m",
      "officeName": "HQ Jakarta"
    }
  }
}
```

**Response (WFH/Flexible Shift):**
```json
{
  "data": {
    "locationValidationStatus": "not_checked",
    "locationInfo": {
      "message": "WFH/Flexible shift - location not required"
    }
  }
}
```

**Error (No GPS):**
```json
{
  "message": "GPS location is required for office attendance",
  "error": "GPS_REQUIRED",
  "hint": "Please enable location access on your device"
}
```

---

### 🔹 **ADMIN - Manage Office Locations**

#### **GET /office-locations/admin**
Get semua lokasi kantor

Query params:
- `is_active=true/false` - Filter by status
- `search=keyword` - Search by name/address

**Response:**
```json
{
  "message": "Office locations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "HQ Jakarta",
      "address": "Jl. Sudirman No. 123",
      "latitude": -6.200000,
      "longitude": 106.816666,
      "radius": 50,
      "is_active": true,
      "coordinatesFormatted": "6.200000°S, 106.816666°E",
      "mapsLink": "https://www.google.com/maps?q=-6.200000,106.816666"
    }
  ],
  "count": 1
}
```

#### **POST /office-locations/admin**
Buat lokasi kantor baru

**Request:**
```json
{
  "name": "HQ Jakarta",
  "address": "Jl. Sudirman No. 123",
  "latitude": -6.200000,
  "longitude": 106.816666,
  "radius": 50,
  "is_active": true
}
```

**Validation:**
- `name`: Required, 3-100 karakter
- `latitude`: Required, -90 to 90
- `longitude`: Required, -180 to 180
- `radius`: Optional, 10-1000 meter (default: 50)
- `address`: Optional

#### **GET /office-locations/admin/:id**
Get detail satu lokasi + recent attendances

#### **PUT /office-locations/admin/:id**
Update lokasi kantor

**Request:** (semua field optional)
```json
{
  "name": "HQ Jakarta - Pusat",
  "radius": 100
}
```

#### **DELETE /office-locations/admin/:id**
Hapus lokasi kantor

**Note:** Tidak bisa dihapus jika ada attendance records. Use toggle instead.

#### **PATCH /office-locations/admin/:id/toggle**
Toggle active/inactive status

#### **GET /office-locations/admin/:id/stats**
Get statistik usage lokasi

**Response:**
```json
{
  "data": {
    "location": { ... },
    "statistics": {
      "totalAttendances": 1250,
      "validAttendances": 1180,
      "outsideRadiusCount": 70,
      "validPercentage": "94.40"
    },
    "recentAttendances": [...]
  }
}
```

---

## 🧮 HAVERSINE FORMULA

Rumus untuk menghitung jarak antara 2 titik GPS di permukaan bumi:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius bumi dalam meter
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // meter
}
```

**Akurasi:** ±0.5% untuk jarak pendek (<100km)

---

## 🎯 FLOW DIAGRAM

### Clock-In Flow dengan GPS

```
USER
  ↓
[Buka App]
  ↓
[Ambil Selfie]
  ↓
[Allow GPS Access]
  ↓
navigator.geolocation.getCurrentPosition()
  ↓
latitude, longitude
  ↓
POST /attendances/clock-in
{
  photo: file,
  latitude: -6.2,
  longitude: 106.8
}
  ↓
BACKEND
  ↓
[Check: Sudah clock-in hari ini?] ──YES─→ ERROR 400
  ↓ NO
[Check: Photo valid?] ──NO─→ ERROR 400
  ↓ YES
[Check: User Shift?]
  ├─ Flexible → Skip GPS validation
  ↓
  └─ Office → GPS Required
      ↓
      [GPS ada?] ──NO─→ ERROR 400
      ↓ YES
      [Get Active Office Locations]
      ↓
      [Find Nearest Office]
      ↓
      [Calculate Distance - Haversine]
      ↓
      [Distance <= Radius?]
      ├─ YES → status: valid
      └─ NO  → status: outside_radius (SOFT, tetap simpan)
  ↓
[Save Attendance Record]
  - GPS coordinates
  - Office location ID
  - Distance
  - Validation status
  ↓
SUCCESS 201
```

---

## 🔧 HELPER FUNCTIONS

File: `helpers/geolocation.js`

### Available Functions:

1. **`calculateDistance(lat1, lon1, lat2, lon2)`**
   - Return: jarak dalam meter

2. **`isValidGPSCoordinates(latitude, longitude)`**
   - Validasi range GPS
   - Return: boolean

3. **`findNearestOffice(userLat, userLon, officeLocations)`**
   - Cari kantor terdekat dari array
   - Return: `{ location, distance }`

4. **`validateLocationRadius(userLat, userLon, officeLocation)`**
   - Validasi dalam radius
   - Return: `{ isValid, distance, status, message }`

5. **`validateAttendanceLocation(userLat, userLon, officeLocations)`**
   - Full validation untuk attendance
   - Support multiple locations
   - Return: complete validation result

6. **`formatGPSCoordinates(lat, lon)`**
   - Format display GPS
   - Return: "6.200000°S, 106.816666°E"

7. **`generateMapsLink(lat, lon)`**
   - Generate Google Maps link
   - Return: "https://www.google.com/maps?q=..."

---

## 🌍 FRONTEND IMPLEMENTATION

### Get GPS Location (JavaScript)

```javascript
// Browser/Web
navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy; // dalam meter
    
    console.log('GPS:', latitude, longitude);
    console.log('Accuracy:', accuracy, 'meters');
    
    // Send to backend
    clockIn(latitude, longitude);
  },
  (error) => {
    console.error('GPS Error:', error.message);
    // Handle error
  },
  {
    enableHighAccuracy: true,  // Lebih akurat tapi lebih lambat
    timeout: 10000,            // 10 detik timeout
    maximumAge: 0              // Jangan pakai cache
  }
);
```

### Clock-In Request

```javascript
async function clockIn(latitude, longitude) {
  const formData = new FormData();
  formData.append('photo', photoFile);
  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  
  const response = await fetch('/attendances/clock-in', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const result = await response.json();
  
  if (result.data.locationValidationStatus === 'outside_radius') {
    alert('⚠️ Anda diluar radius kantor. Admin akan review.');
  }
}
```

---

## 🚨 ERROR HANDLING

### GPS Errors

| Error | Cause | Solution |
|-------|-------|----------|
| PERMISSION_DENIED | User tidak izinkan GPS | Minta izin ulang |
| POSITION_UNAVAILABLE | GPS tidak tersedia | Cek device settings |
| TIMEOUT | GPS terlalu lama | Increase timeout |

### Backend Errors

```json
{
  "message": "GPS location is required for office attendance",
  "error": "GPS_REQUIRED"
}
```

```json
{
  "message": "Invalid GPS coordinates",
  "error": "INVALID_GPS"
}
```

```json
{
  "message": "No active office location configured",
  "error": "NO_OFFICE_LOCATION"
}
```

---

## 📊 ADMIN MONITORING

### Review Outside Radius Attendance

```sql
-- Query untuk cek attendance diluar radius
SELECT 
  a.id,
  u.name as employee_name,
  a.date,
  a.clock_in,
  ol.name as office_name,
  a.distance_from_office,
  ol.radius,
  (a.distance_from_office - ol.radius) as exceeded_by
FROM attendances a
JOIN users u ON a.user_id = u.id
JOIN office_locations ol ON a.office_location_id = ol.id
WHERE a.location_validation_status = 'outside_radius'
ORDER BY a.date DESC;
```

### Statistik per Lokasi

Gunakan endpoint: `GET /office-locations/admin/:id/stats`

---

## 🎯 BEST PRACTICES

### Untuk Admin:
1. **Set radius realistis:** 50m recommended
2. **Test lokasi sebelum deploy:** Coba clock-in dari berbagai titik
3. **Review outside_radius regularly:** Mungkin GPS error atau karyawan curang
4. **Multiple locations untuk cabang:** Beda kota = beda office location

### Untuk Developer:
1. **Always validate GPS di backend:** Jangan trust client
2. **Use soft validation:** Jangan reject langsung, biar admin review
3. **Log everything:** Untuk audit & troubleshooting
4. **Handle GPS errors gracefully:** User experience

### Untuk User (Frontend):
1. **Enable high accuracy GPS**
2. **Wait for GPS fix sebelum clock-in**
3. **Check accuracy:** Jika >50m, tunggu lebih stabil
4. **Outdoors lebih akurat:** GPS lemah di dalam gedung

---

## 🔐 SECURITY & PRIVACY

### Backend Validation
✅ Selalu validasi GPS coordinates  
✅ Check range latitude/longitude  
✅ Prevent GPS spoofing (cross-check dengan IP location - optional)  
✅ Log semua GPS data untuk audit  

### Privacy
✅ GPS hanya disimpan saat clock-in/out  
✅ Tidak tracking real-time  
✅ Data hanya accessible by admin & HR  
✅ GDPR compliant (bisa di-export/delete)  

---

## 🧪 TESTING

### Test Cases

1. **Clock-in dalam radius** → status: valid ✅
2. **Clock-in diluar radius** → status: outside_radius ⚠️
3. **Clock-in tanpa GPS (office shift)** → Error ❌
4. **Clock-in WFH (flexible shift)** → status: not_checked ℹ️
5. **Invalid GPS coordinates** → Error ❌
6. **Multiple office locations** → Pilih terdekat ✅

### Testing dengan Postman

```bash
POST /attendances/clock-in
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (form-data):
  photo: [file]
  latitude: -6.200000
  longitude: 106.816666
```

---

## 📱 MOBILE CONSIDERATIONS

### React Native
```javascript
import Geolocation from '@react-native-community/geolocation';

Geolocation.getCurrentPosition(
  (position) => {
    // Same as browser
  },
  (error) => console.error(error),
  { enableHighAccuracy: true }
);
```

### Permissions
- Android: `ACCESS_FINE_LOCATION`
- iOS: `NSLocationWhenInUseUsageDescription`

---

## 🎓 REKOMENDASI RADIUS

| Tipe Lokasi | Radius | Keterangan |
|-------------|--------|------------|
| Small Office | 30m | Akurasi tinggi |
| **Medium Office** | **50m** | ✅ **RECOMMENDED** |
| Large Campus | 100m | Area luas |
| Parking Lot | 150m | Parkir jauh |
| Max Allowed | 1000m | 1km |

**Note:** GPS accuracy biasanya ±5-20 meter. Jadi radius <30m terlalu strict.

---

## 🚀 ROADMAP FUTURE

- [ ] IP Geolocation sebagai fallback GPS
- [ ] Machine Learning untuk detect GPS spoofing
- [ ] Heatmap attendance per lokasi
- [ ] Export GPS data ke KML/GeoJSON
- [ ] Integration dengan company building access system

---

## 📞 SUPPORT

Jika ada issue dengan GPS:
1. Check browser/app permissions
2. Test di outdoor (lebih akurat)
3. Check endpoint `/office-locations/admin` - pastikan ada active location
4. Review logs untuk validation errors

---

**Created:** January 6, 2026  
**Version:** 1.0  
**Author:** HR System Development Team
