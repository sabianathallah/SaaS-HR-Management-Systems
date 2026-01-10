# 🎯 Clock In/Out Flow - Complete Guide

## ✅ Flow yang Benar (Sekarang)

### **Clock In Flow:**

```
1. User klik "📸 Clock In"
   ↓
2. initClockIn() dipanggil
   - Set clockAction = 'in'
   - Set showCamera = true
   - Reset photo & GPS
   ↓
3. CameraCapture component muncul
   - User ambil foto selfie
   - User klik "Gunakan Foto Ini"
   ↓
4. handlePhotoCapture(photo) dipanggil
   - Set capturedPhoto = photo file
   - Close camera
   ↓
5. Modal Konfirmasi muncul (otomatis karena clockAction && capturedPhoto)
   - Preview foto
   - GPSLocation component auto-detect lokasi
   ↓
6. handleGPSCapture(location) dipanggil
   - Set gpsLocation = { latitude, longitude, accuracy }
   - Tombol "Konfirmasi" aktif
   ↓
7. User klik "Konfirmasi Clock In"
   - handleClockIn() dipanggil
   - Kirim FormData (photo + GPS) ke backend
   - POST /attendances/clock-in
   ↓
8. Success!
   - Toast notification
   - Update todayAttendance
   - Reset states
   - Refresh dashboard
```

### **Clock Out Flow:**

```
Sama persis seperti Clock In, tapi:
- clockAction = 'out'
- Endpoint: POST /attendances/clock-out
- Button: "Konfirmasi Clock Out"
```

---

## 🔍 Debugging Tools (Console Logs)

Check browser console untuk melihat flow:

```javascript
🎬 Initiating Clock In flow        // Step 1: Button clicked
📸 Photo captured: File {...}       // Step 3: Photo captured
📍 GPS captured: { lat, lng... }    // Step 5: GPS detected
🚀 Sending clock-in data: {...}     // Step 7: Sending to backend
✅ Clock-in berhasil!                // Step 8: Success

// Or error:
❌ Error clock-in: {...}             // If failed
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Camera tidak muncul**
**Symptom:** Klik button, tidak ada modal camera

**Check:**
```javascript
// Browser console
console.log(showCamera)  // Should be true
```

**Solution:**
- Pastikan browser support `getUserMedia`
- Allow camera permission
- Coba browser lain (Chrome recommended)

---

### **Issue 2: GPS tidak terdeteksi**
**Symptom:** Modal konfirmasi muncul tapi GPS loading terus

**Check:**
```javascript
// Browser console
console.log(gpsLocation)  // Should be { latitude, longitude, accuracy }
```

**Solution:**
- Allow location permission
- Pastikan GPS device aktif
- Coba refresh page
- Indoor: tunggu lebih lama (30-60 detik)

---

### **Issue 3: Tombol "Konfirmasi" disabled**
**Symptom:** Tombol tidak bisa diklik

**Reason:**
```javascript
disabled={loading || !gpsLocation}
```

**Solution:**
- Tunggu GPS terdeteksi dulu
- Jika GPS stuck, coba refresh page

---

### **Issue 4: Backend error saat submit**
**Symptom:** Toast error muncul

**Common Errors:**

#### **A. "Cannot read property 'latitude' of undefined"**
**Cause:** GPS belum terdeteksi
**Solution:** Tunggu hingga GPS muncul

#### **B. "Photo is required"**
**Cause:** Photo tidak terkirim
**Check console:**
```javascript
console.log(capturedPhoto)  // Should be File object
```

#### **C. "Multipart form-data error"**
**Cause:** Backend tidak support multipart
**Solution:** 
- Check backend multer middleware
- Verify Content-Type header

#### **D. "CORS error"**
**Solution:** Add CORS di backend

---

## 🧪 Manual Testing Steps

### **Test 1: Complete Flow (Happy Path)**

1. ✅ Login sebagai employee
2. ✅ Klik "📸 Clock In"
3. ✅ Allow camera permission
4. ✅ Ambil foto selfie
5. ✅ Klik "Gunakan Foto Ini"
6. ✅ Allow location permission
7. ✅ Tunggu GPS terdeteksi (lihat lat/lng muncul)
8. ✅ Klik "Konfirmasi Clock In"
9. ✅ Toast success muncul
10. ✅ Dashboard update (jam clock-in muncul)

### **Test 2: Cancel Flow**

1. ✅ Klik "📸 Clock In"
2. ✅ Camera muncul
3. ✅ Klik "Batal" di camera
4. ✅ Modal tertutup
5. ✅ States reset
6. ✅ No API call

### **Test 3: Clock Out After Clock In**

1. ✅ Sudah clock-in sebelumnya
2. ✅ Tombol "Clock In" disabled
3. ✅ Tombol "Clock Out" enabled
4. ✅ Klik "📸 Clock Out"
5. ✅ Repeat flow seperti clock-in
6. ✅ Success → Durasi kerja muncul

---

## 📊 State Management

### **States yang Terlibat:**

```javascript
// Clock Action Type
clockAction: 'in' | 'out' | null

// Camera
showCamera: boolean
capturedPhoto: File | null

// GPS
gpsLocation: {
  latitude: number,
  longitude: number,
  accuracy: number
} | null

// Loading
loading: boolean

// Attendance Data
todayAttendance: {
  clockIn: Date,
  clockOut: Date | null,
  status: string,
  workDurationHours: number
} | null
```

### **State Flow:**

```
Initial State:
{
  clockAction: null,
  showCamera: false,
  capturedPhoto: null,
  gpsLocation: null
}

After Click "Clock In":
{
  clockAction: 'in',
  showCamera: true,
  capturedPhoto: null,
  gpsLocation: null
}

After Photo Capture:
{
  clockAction: 'in',
  showCamera: false,
  capturedPhoto: File {...},
  gpsLocation: null
}

After GPS Detected:
{
  clockAction: 'in',
  showCamera: false,
  capturedPhoto: File {...},
  gpsLocation: { lat, lng, accuracy }
}

After Submit Success:
{
  clockAction: null,
  showCamera: false,
  capturedPhoto: null,
  gpsLocation: null
}
```

---

## 🔧 Backend Requirements

Backend HARUS support:

```javascript
// Endpoint
POST /attendances/clock-in
POST /attendances/clock-out

// Request Format
Content-Type: multipart/form-data

// Form Fields
- photo: File (image/jpeg, image/png)
- latitude: Number (-90 to 90)
- longitude: Number (-180 to 180)

// Headers
Authorization: Bearer <jwt_token>
```

### **Expected Response:**

```json
{
  "message": "Clock-in successful",
  "data": {
    "id": 1,
    "UserId": 5,
    "date": "2026-01-10",
    "clockIn": "2026-01-10T08:30:00.000Z",
    "clockOut": null,
    "status": "ON_TIME",
    "photoUrl": "/uploads/attendance-123.jpg",
    "latitude": -6.200000,
    "longitude": 106.816666
  }
}
```

---

## 🎨 UI/UX Flow

### **Visual Flow:**

```
[Dashboard]
    ↓
Click "📸 Clock In"
    ↓
[Camera Modal]
    ↓
Ambil Foto
    ↓
[Konfirmasi Modal]
├── Foto Preview
├── GPS Info
└── [Konfirmasi Button]
    ↓
Loading...
    ↓
Success Toast
    ↓
[Dashboard Updated]
```

---

## 🚀 Next Steps

Jika masih ada error:

1. **Check Browser Console** - Lihat console.log
2. **Check Network Tab** - Lihat request/response
3. **Check Backend Logs** - Lihat error di server
4. **Share Screenshot** - Screenshot error untuk debugging

---

## 📝 Quick Debug Checklist

- [ ] Camera permission allowed?
- [ ] Location permission allowed?
- [ ] Backend running on port 3000?
- [ ] Frontend running on port 5175?
- [ ] CORS configured?
- [ ] JWT token valid?
- [ ] Multer middleware configured?
- [ ] Browser console shows logs?
- [ ] Network tab shows requests?

---

Semua sudah diperbaiki! Test sekarang dan beritahu saya jika masih ada error 🚀
