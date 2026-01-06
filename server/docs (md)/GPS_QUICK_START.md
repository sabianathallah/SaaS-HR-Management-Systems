# 🚀 GPS & GEO-FENCING - QUICK START GUIDE

## ⚡ Setup (Sudah Selesai)

✅ Migration: GPS columns added to `Attendances`  
✅ Model: `OfficeLocation` created  
✅ Helper: `geolocation.js` with Haversine formula  
✅ Controller: GPS validation in attendance  
✅ Routes: Admin office location management  
✅ Seeder: 5 demo office locations

---

## 🧪 TESTING ENDPOINTS

### 1️⃣ Login sebagai Admin

```bash
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "admin@mail.com",
  "password": "admin"
}
```

Save the `token` dari response!

---

### 2️⃣ Get All Office Locations (Admin)

```bash
GET http://localhost:3000/office-locations/admin
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "message": "Office locations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "HQ Jakarta - Sudirman",
      "latitude": "-6.20876300",
      "longitude": "106.81663500",
      "radius": 50,
      "is_active": true,
      "coordinatesFormatted": "6.208763°S, 106.816635°E",
      "mapsLink": "https://www.google.com/maps?q=-6.208763,106.816635"
    }
  ]
}
```

---

### 3️⃣ Create New Office Location (Admin)

```bash
POST http://localhost:3000/office-locations/admin
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Branch Yogyakarta",
  "address": "Jl. Malioboro No. 1, Yogyakarta",
  "latitude": -7.795580,
  "longitude": 110.369490,
  "radius": 50,
  "is_active": true
}
```

---

### 4️⃣ Clock-In dengan GPS (Employee)

**Login sebagai employee dulu:**
```bash
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "employee@mail.com",
  "password": "password"
}
```

**Clock-in dengan GPS:**
```bash
POST http://localhost:3000/attendances/clock-in
Authorization: Bearer YOUR_EMPLOYEE_TOKEN
Content-Type: multipart/form-data

Form data:
- photo: [upload file]
- latitude: -6.208763  # Koordinat dalam radius HQ Jakarta
- longitude: 106.816635
```

**Test Case 1: Dalam Radius (Valid)**
```
latitude: -6.208763
longitude: 106.816635
→ Distance: ~0m dari HQ Jakarta
→ Status: valid ✅
```

**Test Case 2: Diluar Radius (Outside)**
```
latitude: -6.200000
longitude: 106.820000
→ Distance: ~150m dari HQ Jakarta
→ Status: outside_radius ⚠️
```

**Test Case 3: WFH/Flexible Shift**
```
Jika user punya shift "Flexible":
latitude: (apa saja atau tidak kirim)
longitude: (apa saja atau tidak kirim)
→ Status: not_checked ℹ️
```

---

### 5️⃣ Get Office Location Stats (Admin)

```bash
GET http://localhost:3000/office-locations/admin/1/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "data": {
    "location": {...},
    "statistics": {
      "totalAttendances": 10,
      "validAttendances": 8,
      "outsideRadiusCount": 2,
      "validPercentage": "80.00"
    },
    "recentAttendances": [...]
  }
}
```

---

### 6️⃣ Toggle Office Location Status

```bash
PATCH http://localhost:3000/office-locations/admin/1/toggle
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 📍 GPS COORDINATES UNTUK TESTING

### Jakarta
```
HQ Sudirman:
  Lat: -6.208763
  Lng: 106.816635
  
Monas (nearby):
  Lat: -6.175110
  Lng: 106.827153
  
Diluar radius (~5km):
  Lat: -6.200000
  Lng: 106.850000
```

### Bandung
```
Asia Afrika:
  Lat: -6.921389
  Lng: 107.607222
```

### Surabaya
```
Pemuda:
  Lat: -7.257472
  Lng: 112.752090
```

---

## 🧮 CARA HITUNG JARAK MANUAL

Gunakan kalkulator online:
- https://www.movable-type.co.uk/scripts/latlong.html
- Masukkan 2 koordinat GPS
- Hasilnya harus match dengan backend response

---

## 🎯 EXPECTED FLOW

### Scenario 1: Office Worker - Valid Location
```
1. User buka app
2. Allow GPS permission
3. Ambil selfie
4. GPS detect: -6.208763, 106.816635
5. POST /attendances/clock-in
6. Backend cek: Distance ~0m dari HQ
7. Status: "valid" ✅
8. Attendance saved
```

### Scenario 2: Office Worker - Outside Radius
```
1-4. Same as above
5. POST /attendances/clock-in
6. Backend cek: Distance 150m dari HQ
7. Status: "outside_radius" ⚠️
8. Attendance saved (soft validation)
9. Admin review later
```

### Scenario 3: WFH Worker
```
1. User dengan shift "Flexible"
2. GPS optional (bisa tanpa GPS)
3. POST /attendances/clock-in
4. Status: "not_checked" ℹ️
5. Attendance saved without validation
```

---

## 🔧 TROUBLESHOOTING

### Error: "GPS location is required"
✅ Pastikan kirim `latitude` dan `longitude` di body  
✅ Pastikan user bukan shift flexible  
✅ Check body encoding (multipart/form-data)

### Error: "Invalid GPS coordinates"
✅ Latitude range: -90 to 90  
✅ Longitude range: -180 to 180  
✅ Format: decimal (e.g., -6.208763)

### Error: "No active office location"
✅ Run seeder: `npx sequelize-cli db:seed --seed 20260106000001-demo-office-locations.js`  
✅ Atau create manual via POST /office-locations/admin

### Status selalu "outside_radius"
✅ Check GPS accuracy di device  
✅ Test dengan koordinat exact dari office location  
✅ Increase radius untuk testing (e.g., 100m)

---

## 📱 FRONTEND IMPLEMENTATION

### Get GPS Location (JavaScript)

```javascript
// Request GPS permission
navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    console.log('GPS:', latitude, longitude);
    console.log('Accuracy:', accuracy, 'meters');
    
    // Call clock-in
    clockInWithGPS(latitude, longitude);
  },
  (error) => {
    if (error.code === 1) {
      alert('Please enable GPS permission');
    } else if (error.code === 2) {
      alert('GPS position unavailable');
    } else {
      alert('GPS timeout');
    }
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);
```

### Clock-In Function

```javascript
async function clockInWithGPS(latitude, longitude) {
  const formData = new FormData();
  
  // Add photo (dari camera/file input)
  const photo = document.getElementById('photo').files[0];
  formData.append('photo', photo);
  
  // Add GPS coordinates
  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  
  try {
    const response = await fetch('http://localhost:3000/attendances/clock-in', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Clock-in success!', result);
      
      // Check validation status
      const status = result.data.locationValidationStatus;
      
      if (status === 'valid') {
        alert('✅ Clock-in berhasil!');
      } else if (status === 'outside_radius') {
        alert('⚠️ Anda diluar radius kantor. Admin akan review.');
      } else if (status === 'not_checked') {
        alert('ℹ️ Clock-in berhasil (WFH mode)');
      }
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error');
  }
}
```

---

## 🎨 UI/UX RECOMMENDATIONS

### Before Clock-In
1. **Show GPS status:**
   - 🟢 GPS Ready (accuracy < 20m)
   - 🟡 GPS Fair (accuracy 20-50m)
   - 🔴 GPS Poor (accuracy > 50m)

2. **Show nearest office:**
   - "Terdekat: HQ Jakarta (25m)"
   - "✅ Dalam radius (50m)"

### After Clock-In
1. **Show validation result:**
   - ✅ Valid: "Clock-in berhasil!"
   - ⚠️ Outside: "Diluar radius. Admin akan review."
   - ℹ️ Not checked: "WFH mode"

2. **Show map (optional):**
   - Pin: User location
   - Circle: Office radius
   - Line: Distance

---

## 📊 ADMIN DASHBOARD IDEAS

### Monitor Page
- List attendance dengan `outside_radius` status
- Filter by office location
- Show distance dari office
- Approve/reject button

### Statistics
- Valid vs Outside percentage per location
- Heatmap attendance locations
- Office usage analytics

---

## 🔐 SECURITY NOTES

1. **GPS Spoofing Prevention:**
   - Cross-check dengan IP geolocation (optional)
   - Monitor suspicious patterns (selalu exact GPS)
   - Require WiFi/cell tower data (mobile only)

2. **Privacy:**
   - GPS only captured saat clock-in/out
   - Tidak real-time tracking
   - Data retention policy

---

## ✅ CHECKLIST SEBELUM PRODUCTION

- [ ] Test di real device (bukan emulator)
- [ ] Test di outdoor (GPS lebih akurat)
- [ ] Test di dalam gedung (GPS bisa error)
- [ ] Set radius realistis untuk setiap location
- [ ] Train admin cara review outside_radius
- [ ] Document GPS permission flow
- [ ] Add user guide untuk enable GPS
- [ ] Setup monitoring untuk GPS errors
- [ ] Test with VPN/proxy

---

## 🎯 NEXT STEPS

1. **Test dengan real GPS device**
2. **Adjust radius berdasarkan hasil testing**
3. **Implement admin review page**
4. **Add GPS error logging**
5. **Frontend integration**

---

**Happy Testing! 🚀**

Need help? Check main documentation:
- `GPS_GEOFENCING_FEATURE.md` - Full documentation
- `API_ENDPOINTS_COMPLETE.md` - All endpoints
