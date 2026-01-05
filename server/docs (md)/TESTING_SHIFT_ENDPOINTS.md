# TESTING SHIFT ENDPOINTS

## Prerequisites
- Server running on http://localhost:3000
- Admin token obtained from login
- Database with seeded shifts

## Environment Setup
```bash
# Login as admin to get token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mail.com",
    "password": "admin123"
  }'

# Save the token
export TOKEN="<your-admin-token>"
```

---

## 1. GET All Shifts

### Request
```bash
curl -X GET http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully retrieved all shifts",
  "data": [
    {
      "id": 1,
      "name": "Shift Pagi",
      "startTime": "07:00:00",
      "endTime": "15:00:00",
      "breakDuration": 60,
      "lateTolerance": 15,
      "overtimeThreshold": 15,
      "isFlexible": false,
      "description": "Shift pagi - Jam kerja 07:00 sampai 15:00 dengan istirahat 1 jam",
      "isActive": true,
      "createdAt": "2026-01-05T05:09:44.000Z",
      "updatedAt": "2026-01-05T05:09:44.000Z",
      "users": []
    },
    {
      "id": 2,
      "name": "Shift Siang",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "breakDuration": 60,
      "lateTolerance": 15,
      "overtimeThreshold": 15,
      "isFlexible": false,
      "description": "Shift siang - Jam kerja 09:00 sampai 17:00 dengan istirahat 1 jam",
      "isActive": true,
      "createdAt": "2026-01-05T05:09:44.000Z",
      "updatedAt": "2026-01-05T05:09:44.000Z",
      "users": []
    },
    {
      "id": 3,
      "name": "Shift Malam",
      "startTime": "15:00:00",
      "endTime": "23:00:00",
      "breakDuration": 60,
      "lateTolerance": 15,
      "overtimeThreshold": 15,
      "isFlexible": false,
      "description": "Shift malam - Jam kerja 15:00 sampai 23:00 dengan istirahat 1 jam",
      "isActive": true,
      "createdAt": "2026-01-05T05:09:44.000Z",
      "updatedAt": "2026-01-05T05:09:44.000Z",
      "users": []
    },
    {
      "id": 4,
      "name": "Flexible",
      "startTime": "00:00:00",
      "endTime": "23:59:59",
      "breakDuration": 60,
      "lateTolerance": 0,
      "overtimeThreshold": 60,
      "isFlexible": true,
      "description": "Shift flexible - Tidak ada jam kerja tetap",
      "isActive": true,
      "createdAt": "2026-01-05T05:09:44.000Z",
      "updatedAt": "2026-01-05T05:09:44.000Z",
      "users": []
    }
  ]
}
```

---

## 2. GET Shift by ID

### Request
```bash
curl -X GET http://localhost:3000/api/shifts/admin/shifts/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully retrieved shift",
  "data": {
    "id": 1,
    "name": "Shift Pagi",
    "startTime": "07:00:00",
    "endTime": "15:00:00",
    "breakDuration": 60,
    "lateTolerance": 15,
    "overtimeThreshold": 15,
    "isFlexible": false,
    "description": "Shift pagi - Jam kerja 07:00 sampai 15:00 dengan istirahat 1 jam",
    "isActive": true,
    "users": []
  }
}
```

### Test Not Found (404)
```bash
curl -X GET http://localhost:3000/api/shifts/admin/shifts/999 \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
{
  "success": false,
  "message": "Shift with ID 999 not found"
}
```

---

## 3. POST Create New Shift

### Request - Valid Data
```bash
curl -X POST http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shift Weekend",
    "startTime": "10:00:00",
    "endTime": "18:00:00",
    "breakDuration": 90,
    "lateTolerance": 30,
    "overtimeThreshold": 20,
    "isFlexible": false,
    "description": "Shift khusus untuk hari weekend"
  }'
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "message": "Shift created successfully",
  "data": {
    "id": 5,
    "name": "Shift Weekend",
    "startTime": "10:00:00",
    "endTime": "18:00:00",
    "breakDuration": 90,
    "lateTolerance": 30,
    "overtimeThreshold": 20,
    "isFlexible": false,
    "description": "Shift khusus untuk hari weekend",
    "isActive": true,
    "updatedAt": "2026-01-05T05:20:00.000Z",
    "createdAt": "2026-01-05T05:20:00.000Z"
  }
}
```

### Test Validation - Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Shift"
  }'

# Expected: 400 Bad Request
{
  "success": false,
  "message": "Name, startTime, and endTime are required"
}
```

### Test Duplicate Name
```bash
curl -X POST http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shift Pagi",
    "startTime": "07:00:00",
    "endTime": "15:00:00"
  }'

# Expected: 500 or Validation Error (unique constraint)
```

---

## 4. PUT Update Shift

### Request - Update Multiple Fields
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/shifts/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lateTolerance": 20,
    "overtimeThreshold": 20,
    "description": "Shift pagi - Updated description"
  }'
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Shift updated successfully",
  "data": {
    "id": 1,
    "name": "Shift Pagi",
    "startTime": "07:00:00",
    "endTime": "15:00:00",
    "breakDuration": 60,
    "lateTolerance": 20,
    "overtimeThreshold": 20,
    "isFlexible": false,
    "description": "Shift pagi - Updated description",
    "isActive": true
  }
}
```

### Test Update Not Found
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/shifts/999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Test" }'

# Expected: 404 Not Found
```

---

## 5. DELETE Shift

### Request - Delete Unused Shift
```bash
# First, create a test shift
curl -X POST http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Delete",
    "startTime": "08:00:00",
    "endTime": "16:00:00"
  }'

# Then delete it (assuming ID is 5)
curl -X DELETE http://localhost:3000/api/shifts/admin/shifts/5 \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Shift deleted successfully",
  "data": {
    "id": 5
  }
}
```

### Test Delete Shift in Use
```bash
# Try to delete Shift Pagi (ID 1) if it's being used
curl -X DELETE http://localhost:3000/api/shifts/admin/shifts/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected: 400 Bad Request
{
  "success": false,
  "message": "Cannot delete shift. It is being used by X user(s) and Y attendance(s). Please reassign them first."
}
```

---

## 6. PUT Assign Shift to User

### Request
```bash
# Get user ID first (assuming user ID is 2)
curl -X PUT http://localhost:3000/api/shifts/admin/users/2/shift \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftId": 1
  }'
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Shift assigned to user successfully",
  "data": {
    "id": 2,
    "name": "Employee Name",
    "email": "employee@mail.com",
    "ShiftId": 1,
    "shift": {
      "id": 1,
      "name": "Shift Pagi",
      "startTime": "07:00:00",
      "endTime": "15:00:00",
      "breakDuration": 60,
      "lateTolerance": 15,
      "overtimeThreshold": 15,
      "isFlexible": false,
      "isActive": true
    }
  }
}
```

### Test Invalid User
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/users/999/shift \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "shiftId": 1 }'

# Expected: 404 Not Found
{
  "success": false,
  "message": "User with ID 999 not found"
}
```

### Test Invalid Shift
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/users/2/shift \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "shiftId": 999 }'

# Expected: 404 Not Found
{
  "success": false,
  "message": "Shift with ID 999 not found"
}
```

### Test Missing shiftId
```bash
curl -X PUT http://localhost:3000/api/shifts/admin/users/2/shift \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request
{
  "success": false,
  "message": "shiftId is required"
}
```

---

## 7. DELETE Remove Shift from User

### Request
```bash
curl -X DELETE http://localhost:3000/api/shifts/admin/users/2/shift \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Shift removed from user successfully",
  "data": {
    "id": 2,
    "name": "Employee Name",
    "email": "employee@mail.com",
    "ShiftId": null
  }
}
```

### Test Invalid User
```bash
curl -X DELETE http://localhost:3000/api/shifts/admin/users/999/shift \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

---

## Authorization Tests

### Test Without Token
```bash
curl -X GET http://localhost:3000/api/shifts/admin/shifts

# Expected: 401 Unauthorized
```

### Test With Non-Admin Token
```bash
# Login as regular user first
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@mail.com",
    "password": "user123"
  }'

# Use the user token
export USER_TOKEN="<user-token>"

curl -X GET http://localhost:3000/api/shifts/admin/shifts \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 403 Forbidden
```

---

## Summary Checklist

### Shift CRUD
- [ ] GET all shifts - Success
- [ ] GET shift by ID - Success
- [ ] GET shift by ID - Not Found (404)
- [ ] POST create shift - Success
- [ ] POST create shift - Validation Error
- [ ] POST create shift - Duplicate Name Error
- [ ] PUT update shift - Success
- [ ] PUT update shift - Not Found (404)
- [ ] DELETE shift - Success (unused)
- [ ] DELETE shift - Fail (in use)
- [ ] DELETE shift - Not Found (404)

### User Shift Assignment
- [ ] PUT assign shift - Success
- [ ] PUT assign shift - User Not Found
- [ ] PUT assign shift - Shift Not Found
- [ ] PUT assign shift - Missing shiftId
- [ ] DELETE remove shift - Success
- [ ] DELETE remove shift - User Not Found

### Authorization
- [ ] All endpoints - No token (401)
- [ ] All endpoints - Non-admin token (403)
- [ ] All endpoints - Admin token (Success)

## Test Data

### Sample Shifts Created
1. ID 1: Shift Pagi (07:00 - 15:00)
2. ID 2: Shift Siang (09:00 - 17:00)
3. ID 3: Shift Malam (15:00 - 23:00)
4. ID 4: Flexible (00:00 - 23:59)
5. ID 5: Shift Weekend (10:00 - 18:00) - if created

### Sample Users for Testing
- Admin: admin@mail.com / admin123
- User 1: user1@mail.com / user123
- User 2: user2@mail.com / user123
