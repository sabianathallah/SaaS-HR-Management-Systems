# User Management Admin Endpoints

## Overview
Endpoint untuk admin mengelola data user, termasuk edit data, mengubah status aktif/non-aktif, dan mengatur tanggal join/leave karyawan.

## Authentication
Semua endpoint memerlukan:
- **Authentication**: Bearer Token (JWT)
- **Authorization**: Role Admin

## Endpoints

### 1. Get All Users
**Endpoint**: `GET /users/admin`

**Description**: Admin dapat melihat semua data user

**Response Success (200)**:
```json
{
  "message": "Success fetch all users",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Employee",
      "isActive": true,
      "joinDate": "2024-01-15T00:00:00.000Z",
      "leaveDate": null,
      "annualLeaveQuota": 12,
      "usedLeaveQuota": 3,
      "remainingLeaveQuota": 9,
      "createdAt": "2024-01-15T08:30:00.000Z",
      "updatedAt": "2024-01-15T08:30:00.000Z"
    }
  ]
}
```

---

### 2. Get User Detail
**Endpoint**: `GET /users/admin/:id`

**Description**: Admin dapat melihat detail data user berdasarkan ID

**Parameters**:
- `id` (path parameter): User ID

**Response Success (200)**:
```json
{
  "message": "Success fetch user detail",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Employee",
    "isActive": true,
    "joinDate": "2024-01-15T00:00:00.000Z",
    "leaveDate": null,
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 3,
    "remainingLeaveQuota": 9,
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

**Response Error (404)**:
```json
{
  "message": "User not found"
}
```

---

### 3. Edit User Data
**Endpoint**: `PUT /users/admin/:id`

**Description**: Admin dapat mengedit data user (nama, email, role, kuota cuti, status aktif, tanggal join/leave)

**Parameters**:
- `id` (path parameter): User ID

**Request Body** (semua field optional):
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "Admin",
  "annualLeaveQuota": 15,
  "isActive": true,
  "joinDate": "2024-01-15",
  "leaveDate": null
}
```

**Response Success (200)**:
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "role": "Admin",
    "isActive": true,
    "joinDate": "2024-01-15T00:00:00.000Z",
    "leaveDate": null,
    "annualLeaveQuota": 15,
    "usedLeaveQuota": 3,
    "remainingLeaveQuota": 12
  }
}
```

**Response Error (404)**:
```json
{
  "message": "User not found"
}
```

---

### 4. Toggle User Active/Inactive Status
**Endpoint**: `PATCH /users/admin/:id/status`

**Description**: Admin dapat mengubah status karyawan menjadi aktif atau non-aktif

**Parameters**:
- `id` (path parameter): User ID

**Request Body**:
```json
{
  "isActive": false
}
```

**Field Description**:
- `isActive` (boolean, required): true untuk aktif, false untuk non-aktif

**Response Success (200)** - Deactivate:
```json
{
  "message": "User deactivated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": false
  }
}
```

**Response Success (200)** - Activate:
```json
{
  "message": "User activated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true
  }
}
```

**Response Error (400)**:
```json
{
  "message": "isActive must be a boolean value"
}
```

**Response Error (404)**:
```json
{
  "message": "User not found"
}
```

---

### 5. Update Employment Dates (Join Date & Leave Date)
**Endpoint**: `PATCH /users/admin/:id/employment-dates`

**Description**: Admin dapat mengatur tanggal bergabung (join date) dan tanggal berhenti (leave date) karyawan. Ketika leave date diset, user otomatis menjadi non-aktif.

**Parameters**:
- `id` (path parameter): User ID

**Request Body** (minimal salah satu field harus ada):
```json
{
  "joinDate": "2024-01-15",
  "leaveDate": "2025-12-31"
}
```

**Field Description**:
- `joinDate` (date, optional): Tanggal karyawan mulai bekerja (format: YYYY-MM-DD)
- `leaveDate` (date, optional): Tanggal karyawan berhenti bekerja (format: YYYY-MM-DD)

**Business Rules**:
1. Leave date harus setelah join date
2. Jika leave date diset, user otomatis menjadi non-aktif (isActive = false)

**Response Success (200)**:
```json
{
  "message": "Employment dates updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "joinDate": "2024-01-15T00:00:00.000Z",
    "leaveDate": "2025-12-31T00:00:00.000Z",
    "isActive": false
  }
}
```

**Response Error (400)**:
```json
{
  "message": "Leave date must be after join date"
}
```

**Response Error (404)**:
```json
{
  "message": "User not found"
}
```

---

## Database Changes

### Migration
File: `20260103000000-add-employment-fields-to-users.js`

Menambahkan 3 kolom baru pada table Users:
1. `isActive` (BOOLEAN, default: true) - Status aktif karyawan
2. `joinDate` (DATE, nullable) - Tanggal bergabung
3. `leaveDate` (DATE, nullable) - Tanggal berhenti

### Model Updates
File: `models/user.js`

Menambahkan field baru dengan validasi:
- `isActive`: Default true
- `joinDate`: Nullable
- `leaveDate`: Nullable, dengan validasi harus setelah joinDate

---

## Example Usage

### Curl Examples

#### 1. Get All Users
```bash
curl -X GET http://localhost:3000/users/admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 2. Edit User Data
```bash
curl -X PUT http://localhost:3000/users/admin/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "annualLeaveQuota": 15
  }'
```

#### 3. Deactivate Employee
```bash
curl -X PATCH http://localhost:3000/users/admin/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

#### 4. Set Employee Leave Date
```bash
curl -X PATCH http://localhost:3000/users/admin/1/employment-dates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "joinDate": "2024-01-15",
    "leaveDate": "2025-12-31"
  }'
```

---

## Testing Steps

1. **Run Migration**:
```bash
npx sequelize-cli db:migrate
```

2. **Login as Admin** untuk mendapatkan token

3. **Test Endpoints**:
   - GET /users/admin - Lihat semua user
   - GET /users/admin/:id - Lihat detail user
   - PUT /users/admin/:id - Edit data user
   - PATCH /users/admin/:id/status - Toggle status aktif/non-aktif
   - PATCH /users/admin/:id/employment-dates - Set join/leave date

4. **Verify**:
   - Pastikan leave date harus setelah join date
   - Pastikan ketika leave date diset, isActive menjadi false
   - Pastikan hanya admin yang bisa akses endpoints ini

---

## Notes

1. **Register Endpoint Update**: Endpoint `/register` sekarang otomatis mengisi `joinDate` dengan tanggal sekarang jika tidak disediakan, dan `isActive` default true.

2. **Automatic Deactivation**: Ketika admin mengset leave date, system otomatis mengubah status user menjadi non-aktif.

3. **Leave Date Validation**: System memvalidasi bahwa leave date harus setelah join date untuk menjaga konsistensi data.

4. **Security**: Semua endpoint hanya bisa diakses oleh user dengan role Admin.
