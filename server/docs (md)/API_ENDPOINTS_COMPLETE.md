# 📚 Complete API Endpoints Documentation
**SaaS HR Management System - Attendance Module**  
**Last Updated:** January 1, 2026

---

## 🔑 Authentication

All endpoints require authentication via JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Base URL
```
http://localhost:3000
```

---

## 📋 Table of Contents

1. [Public Endpoints](#public-endpoints)
2. [User Endpoints (Employee)](#user-endpoints-employee)
3. [Admin Endpoints](#admin-endpoints)

---

## 🌐 Public Endpoints

### 1. Login
**POST** `/login`

**Description:** Login untuk mendapatkan JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "employee"
  }
}
```

**Status Codes:**
- `200 OK` - Login successful
- `400 Bad Request` - Email/password required
- `401 Unauthorized` - Invalid credentials

---

### 2. Register (Admin Only)
**POST** `/register`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Description:** Admin mendaftarkan user baru

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "employee"
}
```

**Response Success (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "employee"
  }
}
```

**Status Codes:**
- `201 Created` - User created successfully
- `400 Bad Request` - Validation error
- `403 Forbidden` - Not admin

---

## 👤 User Endpoints (Employee)

**Base Path:** `/attendances`

### 1. Clock In
**POST** `/attendances/clock-in`

**Description:** Employee melakukan clock-in (absen masuk)

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:** None

**Response Success (201):**
```json
{
  "message": "Clock-in successful",
  "data": {
    "id": 1,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:30:00.000Z",
    "clockOut": "2026-01-01T08:30:00.000Z",
    "status": "ON_PROGRESS",
    "createdAt": "2026-01-01T08:30:00.000Z",
    "updatedAt": "2026-01-01T08:30:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Clock-in successful
- `400 Bad Request` - Already clocked in today
- `401 Unauthorized` - Not authenticated

---

### 2. Clock Out
**POST** `/attendances/clock-out`

**Description:** Employee melakukan clock-out (absen pulang)

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:** None

**Response Success (200):**
```json
{
  "message": "Clock-out successful",
  "data": {
    "id": 1,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:30:00.000Z",
    "clockOut": "2026-01-01T17:15:00.000Z",
    "status": "ON_TIME",
    "workDurationHours": 8.75,
    "createdAt": "2026-01-01T08:30:00.000Z",
    "updatedAt": "2026-01-01T17:15:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Clock-out successful
- `400 Bad Request` - No clock-in record found
- `401 Unauthorized` - Not authenticated

---

### 3. Get My Attendance
**GET** `/attendances/my-attendance`

**Description:** Mendapatkan semua attendance records milik employee

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Response Success (200):**
```json
{
  "message": "My attendance records",
  "data": [
    {
      "id": 1,
      "UserId": 1,
      "date": "2026-01-01T00:00:00.000Z",
      "clockIn": "2026-01-01T08:30:00.000Z",
      "clockOut": "2026-01-01T17:15:00.000Z",
      "status": "ON_TIME",
      "createdAt": "2026-01-01T08:30:00.000Z",
      "updatedAt": "2026-01-01T17:15:00.000Z"
    },
    {
      "id": 2,
      "UserId": 1,
      "date": "2025-12-31T00:00:00.000Z",
      "clockIn": "2025-12-31T09:05:00.000Z",
      "clockOut": "2025-12-31T17:00:00.000Z",
      "status": "LATE",
      "createdAt": "2025-12-31T09:05:00.000Z",
      "updatedAt": "2025-12-31T17:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated

---

### 4. Get Today's Attendance
**GET** `/attendances/today-attendance`

**Description:** Mendapatkan attendance record hari ini milik employee

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Response Success (200):**
```json
{
  "message": "Today's attendance record",
  "data": {
    "id": 1,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:30:00.000Z",
    "clockOut": "2026-01-01T17:15:00.000Z",
    "status": "ON_TIME",
    "workDurationHours": 8.75,
    "createdAt": "2026-01-01T08:30:00.000Z",
    "updatedAt": "2026-01-01T17:15:00.000Z"
  }
}
```

**Response No Record (200):**
```json
{
  "message": "No attendance record for today",
  "data": null
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated

---

## 👨‍💼 Admin Endpoints

**Base Path:** `/attendances/admin`

**Required:** Admin role

### 1. Get All Attendance
**GET** `/attendances/admin/all-attendance`

**Description:** Admin melihat semua attendance records dari semua user

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response Success (200):**
```json
{
  "message": "All attendance records",
  "data": [
    {
      "id": 1,
      "UserId": 1,
      "date": "2026-01-01T00:00:00.000Z",
      "clockIn": "2026-01-01T08:30:00.000Z",
      "clockOut": "2026-01-01T17:15:00.000Z",
      "status": "ON_TIME",
      "User": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": 2,
      "UserId": 2,
      "date": "2026-01-01T00:00:00.000Z",
      "clockIn": "2026-01-01T09:15:00.000Z",
      "clockOut": "2026-01-01T17:00:00.000Z",
      "status": "LATE",
      "User": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### 2. Get Today's Attendance (All Users)
**GET** `/attendances/admin/today-attendance`

**Description:** Admin melihat attendance hari ini dari semua user atau specific user

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters (Optional):**
- `userId` - Filter by specific user ID

**Example Requests:**
```
GET /attendances/admin/today-attendance
GET /attendances/admin/today-attendance?userId=1
```

**Response Success (200):**
```json
{
  "message": "Today's attendance records",
  "data": [
    {
      "id": 1,
      "UserId": 1,
      "date": "2026-01-01T00:00:00.000Z",
      "clockIn": "2026-01-01T08:30:00.000Z",
      "clockOut": "2026-01-01T17:15:00.000Z",
      "status": "ON_TIME",
      "User": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### 3. Auto Set Absent (Manual Trigger)
**POST** `/attendances/admin/auto-set-absent`

**Description:** Admin manually trigger auto set absent untuk users yang belum clock-in

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:** None

**Response Success (200) - Normal Day:**
```json
{
  "message": "Auto set absent completed. 3 users marked as absent.",
  "data": {
    "isHoliday": false,
    "absentCount": 3,
    "absentUserIds": [2, 3, 5]
  }
}
```

**Response Success (200) - Holiday:**
```json
{
  "message": "Today is a holiday: New Year's Day. 3 users marked as HOLIDAY.",
  "data": {
    "isHoliday": true,
    "holidayDescription": "New Year's Day",
    "markedCount": 3,
    "markedUserIds": [2, 3, 5]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### 4. Create Manual Attendance
**POST** `/attendances/admin/manual-attendance`

**Description:** Admin membuat attendance record secara manual untuk employee

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "userId": 1,
  "date": "2026-01-01",
  "clockIn": "2026-01-01T08:00:00.000Z",
  "clockOut": "2026-01-01T17:00:00.000Z",
  "status": "ON_TIME"
}
```

**Valid Status Values:**
- `ON_TIME`
- `LATE`
- `ABSENT`
- `HOLIDAY`
- `ON_PROGRESS`

**Response Success (201):**
```json
{
  "message": "Manual attendance created successfully",
  "data": {
    "id": 5,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:00:00.000Z",
    "clockOut": "2026-01-01T17:00:00.000Z",
    "status": "ON_TIME",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Attendance created
- `400 Bad Request` - Validation error / Already exists
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin
- `404 Not Found` - User not found

---

### 5. Update Manual Attendance
**PUT** `/attendances/admin/manual-attendance/:id`

**Description:** Admin mengupdate attendance record yang sudah ada

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id` - Attendance record ID

**Request Body (All fields optional):**
```json
{
  "date": "2026-01-01",
  "clockIn": "2026-01-01T08:00:00.000Z",
  "clockOut": "2026-01-01T17:00:00.000Z",
  "status": "ON_TIME"
}
```

**Example Request:**
```
PUT /attendances/admin/manual-attendance/5
```

**Response Success (200):**
```json
{
  "message": "Attendance record updated successfully",
  "data": {
    "id": 5,
    "UserId": 1,
    "date": "2026-01-01T00:00:00.000Z",
    "clockIn": "2026-01-01T08:00:00.000Z",
    "clockOut": "2026-01-01T17:00:00.000Z",
    "status": "ON_TIME",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Attendance updated
- `400 Bad Request` - Invalid status
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin
- `404 Not Found` - Attendance not found

---

### 6. Get Work Schedule
**GET** `/attendances/admin/work-schedule`

**Description:** Admin melihat konfigurasi jadwal kerja saat ini

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response Success (200):**
```json
{
  "message": "Current work schedule",
  "data": {
    "id": 1,
    "workStartTime": "09:00",
    "workEndTime": "17:00",
    "autoAbsentTime": "18:00",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin
- `404 Not Found` - No active work schedule

---

### 7. Update Work Schedule
**PUT** `/attendances/admin/work-schedule`

**Description:** Admin mengupdate konfigurasi jadwal kerja (operational hours & auto-absent time)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body (All fields optional):**
```json
{
  "workStartTime": "09:00",
  "workEndTime": "17:00",
  "autoAbsentTime": "18:00"
}
```

**Time Format:** `HH:MM` (24-hour format)

**Response Success (200):**
```json
{
  "message": "Work schedule updated successfully. Cron job will use new times.",
  "data": {
    "id": 1,
    "workStartTime": "09:00",
    "workEndTime": "17:00",
    "autoAbsentTime": "18:00",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Schedule updated
- `400 Bad Request` - Invalid time format
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

**Notes:**
- ⚠️ Server restart required untuk apply cron job schedule changes
- Work start time affects late detection
- Auto absent time determines when cron job runs

---

### 8. Get All Holidays
**GET** `/attendances/admin/holidays`

**Description:** Admin melihat semua holiday records

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response Success (200):**
```json
{
  "message": "All holidays",
  "data": [
    {
      "id": 1,
      "date": "2026-01-01",
      "description": "New Year's Day",
      "isActive": true,
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "date": "2026-12-25",
      "description": "Christmas Day",
      "isActive": true,
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### 9. Add Holiday
**POST** `/attendances/admin/holiday`

**Description:** Admin menambahkan tanggal holiday baru

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "date": "2026-01-01",
  "description": "New Year's Day"
}
```

**Date Format:** `YYYY-MM-DD`

**Response Success (201):**
```json
{
  "message": "Holiday added successfully",
  "data": {
    "id": 1,
    "date": "2026-01-01",
    "description": "New Year's Day",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Holiday added
- `400 Bad Request` - Validation error / Holiday exists
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

### 10. Delete Holiday
**DELETE** `/attendances/admin/holiday/:id`

**Description:** Admin menghapus holiday record

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id` - Holiday record ID

**Example Request:**
```
DELETE /attendances/admin/holiday/1
```

**Response Success (200):**
```json
{
  "message": "Holiday deleted successfully",
  "data": {
    "id": 1,
    "date": "2026-01-01",
    "description": "New Year's Day",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Holiday deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin
- `404 Not Found` - Holiday not found

---

## 📊 Attendance Status Values

| Status | Description |
|--------|-------------|
| `ON_TIME` | Employee clock-in on time and clock-out |
| `LATE` | Employee clock-in after work start time |
| `ABSENT` | Employee didn't clock-in (auto-set by cron job) |
| `HOLIDAY` | Company holiday (auto-set by cron job) |
| `ON_PROGRESS` | Employee has clocked-in but not yet clocked-out |

---

## 🔄 Automated Processes

### Auto Set Absent Cron Job

**Schedule:** Configurable via work schedule (default: daily at 18:00)

**Behavior:**
1. Check if today is a holiday
2. If holiday: Mark users without records as `HOLIDAY`
3. If not holiday: Mark users without records as `ABSENT`
4. Skip users who already have attendance records

**Manual Trigger:**
```
POST /attendances/admin/auto-set-absent
```

---

## 🛡️ Error Responses

### Standard Error Format

```json
{
  "message": "Error description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `400 Bad Request` | Invalid input / Validation error |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Insufficient permissions (not admin) |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Server error |

---

## 📝 Notes

1. **Authentication:** All endpoints (except `/login`) require JWT token
2. **Admin Endpoints:** Require user role = `admin`
3. **Date Format:** ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
4. **Time Format:** HH:MM (24-hour format) for work schedule
5. **Timezone:** Server uses local timezone
6. **Cron Job:** Auto set absent runs daily based on work schedule configuration

---

## 🔧 Configuration

### Environment Variables
```env
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_DIALECT=postgres
JWT_SECRET=your_jwt_secret
```

### Default Work Schedule
```json
{
  "workStartTime": "09:00",
  "workEndTime": "17:00",
  "autoAbsentTime": "18:00"
}
```

---

**Documentation Version:** 2.0  
**Last Updated:** January 1, 2026  
**API Status:** ✅ All endpoints tested and working
