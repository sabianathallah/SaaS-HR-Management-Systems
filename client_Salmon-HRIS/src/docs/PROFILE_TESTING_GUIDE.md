# Profile API Testing Guide

## Manual Testing dengan Browser

### 1. Test Get Profile

1. Login ke aplikasi
2. Navigasi ke tab "Profile"
3. Verifikasi data profile ditampilkan dengan benar
4. Buka Browser Console (F12) untuk melihat response

**Expected Result:**
```
✅ Profile data displayed
✅ Name, email, role, position, department shown
✅ No errors in console
```

### 2. Test Update Profile

1. Buka tab "Profile"
2. Klik tombol "✏️ Edit Profile"
3. Form edit profile muncul
4. Ubah nama (contoh: "John Doe" → "John Smith")
5. Klik "Simpan Perubahan"

**Expected Result:**
```
✅ Toast success: "Profile berhasil diperbarui!"
✅ Nama berubah di display profile
✅ Form ditutup otomatis
✅ Data ter-refresh
```

**Test Invalid Input:**
1. Buka form edit profile
2. Hapus semua text di field nama (kosongkan)
3. Klik "Simpan Perubahan"

**Expected Result:**
```
❌ Toast error: "Nama tidak boleh kosong"
```

### 3. Test Change Password

1. Buka tab "Profile"
2. Klik tombol "🔒 Ubah Password"
3. Form change password muncul
4. Isi:
   - Password Lama: (password saat ini)
   - Password Baru: "newpass123"
   - Konfirmasi Password Baru: "newpass123"
5. Klik "Simpan Password"

**Expected Result:**
```
✅ Toast success: "Password berhasil diubah!"
✅ Form ditutup otomatis
✅ Form di-reset
```

**Test Validation - Empty Fields:**
1. Buka form change password
2. Kosongkan salah satu field
3. Klik "Simpan Password"

**Expected Result:**
```
❌ Toast error: "Semua field password harus diisi"
```

**Test Validation - Short Password:**
1. Buka form change password
2. Isi password baru dengan "123" (kurang dari 6 karakter)
3. Klik "Simpan Password"

**Expected Result:**
```
❌ Toast error: "Password baru minimal 6 karakter"
```

**Test Validation - Password Mismatch:**
1. Buka form change password
2. Isi:
   - Password Lama: "oldpass123"
   - Password Baru: "newpass123"
   - Konfirmasi: "different456"
3. Klik "Simpan Password"

**Expected Result:**
```
❌ Toast error: "Password baru tidak cocok!"
```

**Test Wrong Old Password:**
1. Buka form change password
2. Isi dengan old password yang salah
3. Klik "Simpan Password"

**Expected Result:**
```
❌ Toast error: "Old password is incorrect"
```

## Testing dengan Postman/Thunder Client

### 1. Get Profile

```http
GET http://localhost:3000/profile
Authorization: Bearer <your_token>
```

**Expected Response (200 OK):**
```json
{
  "message": "User profile",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "position": "Software Engineer",
    "department": "IT",
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 2
  }
}
```

### 2. Update Profile

```http
PUT http://localhost:3000/profile
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "John Smith"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com"
  }
}
```

**Test Empty Name (400 Bad Request):**
```json
{
  "name": ""
}
```

### 3. Change Password

```http
PUT http://localhost:3000/profile/change-password
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Test Missing Fields (400 Bad Request):**
```json
{
  "oldPassword": "password123"
  // newPassword missing
}
```

**Expected Response:**
```json
{
  "name": "BadRequest",
  "message": "Old password and new password are required"
}
```

**Test Short Password (400 Bad Request):**
```json
{
  "oldPassword": "password123",
  "newPassword": "123"
}
```

**Expected Response:**
```json
{
  "name": "BadRequest",
  "message": "New password must be at least 6 characters"
}
```

**Test Wrong Old Password (401 Unauthorized):**
```json
{
  "oldPassword": "wrongpassword",
  "newPassword": "newpassword123"
}
```

**Expected Response:**
```json
{
  "name": "Unauthorized",
  "message": "Old password is incorrect"
}
```

## Console Logs to Check

Saat testing di browser, buka Console (F12) dan perhatikan log:

### Successful Update Profile:
```
Submitting profile update: {name: "John Smith"}
Profile updated successfully!
```

### Successful Change Password:
```
Changing password...
Password changed successfully!
```

### Error Cases:
```
Error updating profile: AxiosError {...}
Error response: {message: "..."}
```

## Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Cause:** Token expired atau invalid
**Solution:** 
1. Logout dan login kembali
2. Check localStorage untuk access_token
3. Verify token di backend

### Issue 2: CORS Error
**Cause:** Backend belum setup CORS
**Solution:**
1. Check server app.js ada cors middleware
2. Restart backend server

### Issue 3: Network Error
**Cause:** Backend tidak running atau wrong URL
**Solution:**
1. Check backend running di port 3000
2. Verify VITE_BASE_URL di .env

### Issue 4: Toast Tidak Muncul
**Cause:** react-hot-toast belum di-setup
**Solution:**
1. Check <Toaster /> di App.jsx atau main component
2. Import { toast } from 'react-hot-toast'

## Test Data Examples

### Valid Test Data:
```javascript
// Update Profile
{
  name: "John Doe"
}
{
  name: "Jane Smith"
}
{
  name: "Muhammad Ali"
}

// Change Password
{
  oldPassword: "employee123",
  newPassword: "newpass123"
}
```

### Invalid Test Data:
```javascript
// Empty name
{
  name: ""
}
{
  name: "   "
}

// Short password
{
  oldPassword: "employee123",
  newPassword: "123"
}

// Wrong old password
{
  oldPassword: "wrongpass",
  newPassword: "newpass123"
}
```

## Screenshot Checklist

Capture screenshots untuk dokumentasi:

- [ ] Profile page sebelum edit
- [ ] Edit profile form open
- [ ] Success toast after update
- [ ] Profile page setelah edit (nama berubah)
- [ ] Change password form open
- [ ] Success toast after change password
- [ ] Error validation messages
- [ ] Console logs

## Performance Checks

- [ ] Profile loads dalam < 1 detik
- [ ] Update profile response < 500ms
- [ ] Change password response < 500ms
- [ ] No memory leaks
- [ ] Form resets properly
- [ ] No duplicate API calls

## Security Checks

- [ ] Token required untuk semua endpoint
- [ ] Password tidak tampil di console/network tab
- [ ] Old password verified sebelum change
- [ ] Input sanitization working
- [ ] XSS protection
- [ ] CSRF protection (if implemented)
