# 📸 ATTENDANCE PHOTO SELFIE FEATURE

## 📋 OVERVIEW

Fitur foto selfie untuk attendance memungkinkan:
- **User/Employee**: WAJIB upload foto selfie saat clock-in dan clock-out
- **Admin**: OPSIONAL upload foto saat create/edit attendance manual

## 🎯 FEATURES

### ✅ Automatic Image Compression
- Max upload size: 10MB
- Compressed to: ~200-300KB
- Dimensions: max 800x800px (maintain aspect ratio)
- Quality: 80% JPEG
- Format: Converted to JPEG

### ✅ Validations
- File type: JPG, JPEG, PNG only
- Required for user clock-in/clock-out
- Optional for admin manual create/edit

### ✅ Storage
- Local storage: `server/uploads/attendance-photos/`
- Naming: `{userId}_{timestamp}_{type}.jpg`
- Accessible via: `http://localhost:3000/uploads/attendance-photos/{filename}`

### ✅ Photo Management
- Automatic cleanup when photos are replaced
- Photos deleted when attendance is updated with new photos

---

## 📡 API ENDPOINTS

### 1️⃣ EMPLOYEE ENDPOINTS (Photo REQUIRED)

#### **POST /attendances/clock-in**
Clock in dengan foto selfie (WAJIB)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
photo: [File] (required) - Foto selfie
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/attendances/clock-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/selfie.jpg"
```

**Example using JavaScript (Fetch):**
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

fetch('http://localhost:3000/attendances/clock-in', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

**Success Response (201):**
```json
{
  "message": "Clock-in successful",
  "data": {
    "id": 123,
    "UserId": 1,
    "date": "2026-01-06T12:00:00.000Z",
    "clockIn": "2026-01-06T08:30:00.000Z",
    "clockOut": "2026-01-06T08:30:00.000Z",
    "status": "ON_PROGRESS",
    "photoCheckIn": "/uploads/attendance-photos/1_1736163000000_checkin.jpg",
    "photoCheckOut": null
  },
  "photoInfo": {
    "uploaded": true,
    "path": "/uploads/attendance-photos/1_1736163000000_checkin.jpg",
    "size": "245 KB"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Photo is required for attendance",
  "error": "PHOTO_REQUIRED"
}
```

---

#### **POST /attendances/clock-out**
Clock out dengan foto selfie (WAJIB)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
photo: [File] (required) - Foto selfie
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/attendances/clock-out \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/selfie.jpg"
```

**Success Response (200):**
```json
{
  "message": "Clock-out successful",
  "data": {
    "id": 123,
    "UserId": 1,
    "date": "2026-01-06T12:00:00.000Z",
    "clockIn": "2026-01-06T08:30:00.000Z",
    "clockOut": "2026-01-06T17:30:00.000Z",
    "status": "ON_TIME",
    "photoCheckIn": "/uploads/attendance-photos/1_1736163000000_checkin.jpg",
    "photoCheckOut": "/uploads/attendance-photos/1_1736195400000_checkout.jpg",
    "workDurationHours": 9
  },
  "photoInfo": {
    "uploaded": true,
    "path": "/uploads/attendance-photos/1_1736195400000_checkout.jpg",
    "size": "238 KB"
  }
}
```

---

### 2️⃣ ADMIN ENDPOINTS (Photo OPTIONAL)

#### **POST /attendances/admin/manual-attendance**
Admin create attendance manual (foto OPSIONAL)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
userId: 5 (required)
date: 2026-01-06 (required)
clockIn: 2026-01-06T08:00:00.000Z (required)
clockOut: 2026-01-06T17:00:00.000Z (required)
status: ON_TIME (required)
photoCheckIn: [File] (optional) - Foto check-in
photoCheckOut: [File] (optional) - Foto check-out
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/attendances/admin/manual-attendance \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "userId=5" \
  -F "date=2026-01-06" \
  -F "clockIn=2026-01-06T08:00:00.000Z" \
  -F "clockOut=2026-01-06T17:00:00.000Z" \
  -F "status=ON_TIME" \
  -F "photoCheckIn=@/path/to/checkin.jpg" \
  -F "photoCheckOut=@/path/to/checkout.jpg"
```

**Success Response (201):**
```json
{
  "message": "Manual attendance created successfully",
  "data": {
    "id": 124,
    "UserId": 5,
    "date": "2026-01-06T00:00:00.000Z",
    "clockIn": "2026-01-06T08:00:00.000Z",
    "clockOut": "2026-01-06T17:00:00.000Z",
    "status": "ON_TIME",
    "photoCheckIn": "/uploads/attendance-photos/5_1736163123456_checkin.jpg",
    "photoCheckOut": "/uploads/attendance-photos/5_1736163123789_checkout.jpg"
  }
}
```

**Note:** Jika foto tidak di-upload, field `photoCheckIn` dan `photoCheckOut` akan `null`.

---

#### **PUT /attendances/admin/manual-attendance/:id**
Admin update attendance (foto OPSIONAL)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
date: 2026-01-06 (optional)
clockIn: 2026-01-06T08:00:00.000Z (optional)
clockOut: 2026-01-06T17:00:00.000Z (optional)
status: ON_TIME (optional)
photoCheckIn: [File] (optional) - Foto check-in baru
photoCheckOut: [File] (optional) - Foto check-out baru
```

**Example using curl:**
```bash
curl -X PUT http://localhost:3000/attendances/admin/manual-attendance/124 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "status=LATE" \
  -F "photoCheckIn=@/path/to/new_checkin.jpg"
```

**Success Response (200):**
```json
{
  "message": "Manual attendance updated successfully",
  "data": {
    "id": 124,
    "UserId": 5,
    "date": "2026-01-06T00:00:00.000Z",
    "clockIn": "2026-01-06T08:00:00.000Z",
    "clockOut": "2026-01-06T17:00:00.000Z",
    "status": "LATE",
    "photoCheckIn": "/uploads/attendance-photos/5_1736163999999_checkin.jpg",
    "photoCheckOut": "/uploads/attendance-photos/5_1736163123789_checkout.jpg"
  }
}
```

**Note:** 
- Jika upload foto baru, foto lama akan otomatis dihapus
- Field yang tidak diisi tidak akan di-update

---

### 3️⃣ VIEW PHOTOS

#### **GET /uploads/attendance-photos/{filename}**
View/download foto attendance

**Example:**
```
http://localhost:3000/uploads/attendance-photos/1_1736163000000_checkin.jpg
```

Bisa langsung diakses di browser atau di-embed di HTML:
```html
<img src="http://localhost:3000/uploads/attendance-photos/1_1736163000000_checkin.jpg" 
     alt="Check-in Photo" 
     style="max-width: 300px;" />
```

---

## 🔧 TECHNICAL DETAILS

### File Structure
```
server/
├── middlewares/
│   └── uploadPhoto.js          # Multer + Sharp middleware
├── helpers/
│   └── photoHelper.js          # Photo management functions
├── uploads/
│   └── attendance-photos/      # Storage folder
│       ├── .gitkeep
│       └── *.jpg               # Compressed photos
├── controllers/
│   ├── attendanceController.js # Updated with photo handling
│   └── attendances_isAdminController.js
└── routes/
    ├── attendance.js           # Employee routes with photo
    └── attendance_isAdmin.js   # Admin routes with optional photo
```

### Middleware Components

**`uploadPhotoCheckIn`** - For user clock-in
- Validates photo is provided
- Compresses image
- Saves to disk
- Attaches `req.photoInfo` to request

**`uploadPhotoCheckOut`** - For user clock-out
- Same as check-in

**`uploadPhotoOptional`** - For admin
- Accepts both `photoCheckIn` and `photoCheckOut` fields
- Optional validation (no error if missing)
- Processes multiple photos

### Helper Functions

**`photoHelper.js`:**
- `deletePhoto(path)` - Delete single photo
- `deletePhotos(paths)` - Delete multiple photos
- `cleanupOldPhotos(oldData, newData)` - Auto cleanup on update
- `deleteAttendancePhotos(attendance)` - Delete all attendance photos
- `getPhotoInfo(path)` - Get photo metadata
- `photoExists(path)` - Check if photo exists

---

## 🧪 TESTING

### Test with Postman

#### 1. Clock-In Test
```
POST http://localhost:3000/attendances/clock-in
Headers:
  Authorization: Bearer {your_token}
Body (form-data):
  photo: [Select a JPG/PNG file]
```

#### 2. Clock-Out Test
```
POST http://localhost:3000/attendances/clock-out
Headers:
  Authorization: Bearer {your_token}
Body (form-data):
  photo: [Select a JPG/PNG file]
```

#### 3. Admin Create Test
```
POST http://localhost:3000/attendances/admin/manual-attendance
Headers:
  Authorization: Bearer {admin_token}
Body (form-data):
  userId: 1
  date: 2026-01-06
  clockIn: 2026-01-06T08:00:00.000Z
  clockOut: 2026-01-06T17:00:00.000Z
  status: ON_TIME
  photoCheckIn: [File - optional]
  photoCheckOut: [File - optional]
```

#### 4. View Photo Test
- Copy photo path from response (e.g., `/uploads/attendance-photos/1_1736163000000_checkin.jpg`)
- Paste in browser: `http://localhost:3000/uploads/attendance-photos/1_1736163000000_checkin.jpg`

---

## 📊 DATABASE SCHEMA

**Table: Attendances**

| Column | Type | Description |
|--------|------|-------------|
| photoCheckIn | VARCHAR(255) | Path to check-in photo (nullable) |
| photoCheckOut | VARCHAR(255) | Path to check-out photo (nullable) |

Example values:
```
photoCheckIn: "/uploads/attendance-photos/1_1736163000000_checkin.jpg"
photoCheckOut: "/uploads/attendance-photos/1_1736195400000_checkout.jpg"
```

---

## ⚠️ VALIDATION & ERROR HANDLING

### Validation Rules

1. **File Type**: Only JPG, JPEG, PNG
   - Error: `Invalid file type. Only JPG, JPEG, and PNG are allowed.`

2. **File Size**: Max 10MB before compression
   - Error: `File too large` (Multer error)

3. **Photo Required (User)**: Must provide photo
   - Error: `Photo is required for attendance`

4. **Photo Optional (Admin)**: No error if missing

### Error Responses

**Invalid File Type:**
```json
{
  "message": "Invalid file type. Only JPG, JPEG, and PNG are allowed."
}
```

**File Too Large:**
```json
{
  "message": "File too large"
}
```

**Photo Required:**
```json
{
  "message": "Photo is required for clock-in",
  "error": "PHOTO_REQUIRED"
}
```

---

## 🚀 PERFORMANCE

### Image Compression Stats

**Before Compression:**
- Typical smartphone photo: 2-4MB
- Dimensions: 3000x4000px
- Format: Various (JPG, PNG, HEIC via conversion)

**After Compression:**
- Compressed size: ~200-300KB
- Dimensions: max 800x800px
- Format: JPEG (80% quality)
- **Storage saved: ~93%**

### Performance Impact

- Upload time: <2 seconds (local network)
- Compression time: <500ms per photo
- Storage per user per day: ~400-600KB (2 photos)
- 1000 users/day: ~500MB storage

---

## 🔐 SECURITY

### Implemented Security Measures

1. **File Type Validation**
   - Only image files accepted
   - MIME type checking

2. **File Size Limit**
   - Max 10MB upload
   - Prevents DoS attacks

3. **Filename Sanitization**
   - Auto-generated filenames
   - No user-supplied filenames used

4. **Authentication Required**
   - All endpoints require valid JWT token

5. **Authorization**
   - Users can only upload for own attendance
   - Admin can upload for any user

### Future Enhancements (Optional)

- [ ] Add watermark with timestamp
- [ ] Face detection validation
- [ ] Virus scanning for uploads
- [ ] CDN integration for faster delivery
- [ ] S3/Cloud storage migration

---

## 📝 MIGRATION GUIDE

### If Upgrading Existing System

1. **Run Migration:**
```bash
npx sequelize-cli db:migrate
```

2. **Create Upload Folder:**
```bash
mkdir -p server/uploads/attendance-photos
```

3. **Existing Attendance Records:**
- Old records will have `photoCheckIn: null` and `photoCheckOut: null`
- This is normal and expected
- New clock-ins will require photos

---

## 🐛 TROUBLESHOOTING

### Issue: "Photo is required" even when uploaded

**Solution:**
- Check `Content-Type: multipart/form-data` header
- Ensure field name is exactly `photo` (case-sensitive)
- In Postman: Use "form-data" not "binary"

### Issue: Photos not accessible

**Solution:**
- Check if folder exists: `server/uploads/attendance-photos/`
- Check file permissions
- Verify `app.use('/uploads', express.static(...))` is in app.js

### Issue: File size still too large

**Solution:**
- Compression is automatic
- Check if sharp is installed: `npm list sharp`
- Original upload limit is 10MB, compressed is ~200KB

### Issue: Can't upload from mobile

**Solution:**
- Mobile browsers may send photos in different formats
- Sharp handles conversion automatically
- Ensure mobile accepts file input: `<input type="file" accept="image/*" capture="camera">`

---

## 💡 USAGE TIPS

### Frontend Integration

**React/Vue Example:**
```javascript
const handleCheckIn = async (photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  
  try {
    const response = await fetch('/attendances/clock-in', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Photo uploaded:', data.photoInfo.path);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

**HTML Example:**
```html
<form id="checkin-form">
  <input type="file" id="photo" accept="image/*" capture="camera" required>
  <button type="submit">Clock In</button>
</form>

<script>
document.getElementById('checkin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('photo', document.getElementById('photo').files[0]);
  
  const response = await fetch('/attendances/clock-in', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  });
  
  const result = await response.json();
  alert(result.message);
});
</script>
```

---

## 📞 SUPPORT

Jika ada pertanyaan atau issue:
1. Check dokumentasi ini terlebih dahulu
2. Cek error logs di terminal
3. Verify migration sudah dijalankan
4. Test dengan Postman sebelum integrate ke frontend

---

**Created:** January 6, 2026  
**Last Updated:** January 6, 2026  
**Version:** 1.0.0
