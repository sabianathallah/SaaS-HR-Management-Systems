# Profile Features Implementation

## Overview
Implementasi fitur profile lengkap yang terintegrasi dengan backend API `/profile`.

## Features Implemented

### 1. Get Profile (GET /profile)
- Mengambil data profile user yang sedang login
- Menampilkan informasi: nama, email, role, jabatan, divisi
- Auto-fetch saat tab profile dibuka

### 2. Update Profile (PUT /profile)
- Mengupdate nama user
- Validasi client-side untuk nama tidak boleh kosong
- Refresh data setelah update berhasil

### 3. Change Password (PUT /profile/change-password)
- Form untuk mengubah password
- Validasi:
  - Semua field harus diisi
  - Password baru minimal 6 karakter
  - Konfirmasi password harus sama dengan password baru
- Error handling untuk password lama yang salah

## API Endpoints Used

```javascript
// Get Profile
GET /profile
Headers: Authorization: Bearer <token>

Response:
{
  "message": "User profile",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "position": "Software Engineer",
    "department": "IT"
  }
}

// Update Profile
PUT /profile
Headers: Authorization: Bearer <token>
Body: {
  "name": "New Name"
}

Response:
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "New Name",
    "email": "john@example.com"
  }
}

// Change Password
PUT /profile/change-password
Headers: Authorization: Bearer <token>
Body: {
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Component Structure

### State Management

```javascript
// Profile Data
const [profile, setProfile] = useState({
  name: '',
  email: '',
  role: '',
  department: '',
  position: ''
})

// Edit Profile Form
const [showEditProfileForm, setShowEditProfileForm] = useState(false)
const [profileForm, setProfileForm] = useState({
  name: ''
})

// Change Password Form
const [showPasswordForm, setShowPasswordForm] = useState(false)
const [passwordForm, setPasswordForm] = useState({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
```

### Functions

1. **fetchProfile()**
   - Fetch user profile data from API
   - Update profile state
   - Initialize profileForm with current name

2. **handleUpdateProfile(e)**
   - Validate nama tidak kosong
   - Send PUT request to /profile
   - Update profile state
   - Show success/error message

3. **handleChangePassword(e)**
   - Validate all fields
   - Validate password length (min 6)
   - Validate password confirmation
   - Send PUT request to /profile/change-password
   - Show success/error message

## UI Components

### Profile Display
- Card dengan gradient background
- Menampilkan semua info profile
- Read-only display

### Edit Profile Form
- Toggle button untuk show/hide
- Input field untuk nama
- Submit & Cancel buttons
- Loading state

### Change Password Form
- Toggle button untuk show/hide
- 3 input fields (old, new, confirm password)
- Submit & Cancel buttons
- Loading state
- Password validation

## Validation Rules

### Client-Side
1. **Update Profile:**
   - Nama tidak boleh kosong
   - Nama di-trim untuk remove whitespace

2. **Change Password:**
   - Semua field harus diisi
   - Password baru minimal 6 karakter
   - Password baru dan konfirmasi harus sama

### Server-Side
1. **Update Profile:**
   - User must exist
   - Name validation (if any)

2. **Change Password:**
   - Old password & new password required
   - New password minimal 6 karakter
   - Old password harus match dengan password di database

## Error Handling

### Common Errors
1. **401 Unauthorized** - Token invalid atau expired
2. **400 Bad Request** - Validasi gagal
3. **404 Not Found** - User tidak ditemukan
4. **500 Internal Server Error** - Server error

### Error Messages
```javascript
// Client-side validation
"Nama tidak boleh kosong"
"Semua field password harus diisi"
"Password baru minimal 6 karakter"
"Password baru tidak cocok!"

// Server-side errors (dari backend)
"Old password is incorrect"
"New password must be at least 6 characters"
"User not found"
```

## Toast Notifications

### Success Messages
- ✅ "Profile berhasil diperbarui!"
- ✅ "Password berhasil diubah!"

### Error Messages
- ❌ Specific validation errors
- ❌ Server error messages from response

## Security Features

1. **Authentication Required**
   - Semua endpoint memerlukan Bearer token
   - Token stored di localStorage

2. **Password Security**
   - Old password verification
   - Password hashing di backend
   - Password minimum length requirement

3. **Input Validation**
   - Client-side & server-side validation
   - Input sanitization (trim)

## Usage Example

```javascript
// Di EmployeePage.jsx
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

// Dalam component
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

// Trigger fetch saat tab active
useEffect(() => {
  if (activeTab === 'profile') {
    fetchProfile()
  }
}, [activeTab])

// Render profile section
{activeTab === 'profile' && renderProfile()}
```

## Testing Checklist

- [ ] Get profile data on tab switch
- [ ] Update profile name successfully
- [ ] Validate empty name
- [ ] Change password successfully
- [ ] Validate old password is correct
- [ ] Validate new password length
- [ ] Validate password confirmation match
- [ ] Handle network errors
- [ ] Handle unauthorized errors
- [ ] Toast notifications display correctly
- [ ] Form resets after successful submission
- [ ] Loading states work properly

## Future Enhancements

1. Upload profile photo
2. Edit more fields (phone, address, etc.)
3. Email verification before change
4. Password strength indicator
5. Two-factor authentication
6. Activity log
7. Profile completion percentage

## Files Modified

```
client_Salmon-HRIS/src/views/EmployeePage.jsx
  - Added profileForm state
  - Added showEditProfileForm state
  - Updated fetchProfile() to populate profileForm
  - Added handleUpdateProfile() function
  - Updated handleChangePassword() endpoint
  - Enhanced renderProfile() with edit form
```

## Dependencies

```json
{
  "axios": "^1.x.x",
  "react-hot-toast": "^2.x.x",
  "react": "^18.x.x"
}
```

## Environment Variables

```env
VITE_BASE_URL=http://localhost:3000
```
