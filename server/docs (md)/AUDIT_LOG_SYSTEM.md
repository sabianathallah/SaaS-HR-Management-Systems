# 📊 AUDIT LOG SYSTEM - DOCUMENTATION

## 🎯 Overview

Sistem Audit Log untuk tracking semua aktivitas penting dalam HR Management System. Mencatat **siapa** melakukan **apa**, **kapan**, dan **perubahan data** yang terjadi.

**📚 Related Documentation:**
- **[WHY_LOGIN_TRACKING.md](./WHY_LOGIN_TRACKING.md)** - Penjelasan detail kenapa login tracking penting (WAJIB BACA!)
- **[IP_ADDRESS_TRACKING.md](./IP_ADDRESS_TRACKING.md)** - Cara tracking IP address
- **[AUDIT_LOG_QUICKREF.md](./AUDIT_LOG_QUICKREF.md)** - Quick reference

---

## 🏗️ Architecture

### Database Schema

**Tabel: `AuditLogs`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Primary key |
| `userId` | INTEGER | User yang melakukan aksi (FK ke Users) |
| `action` | ENUM | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, APPROVE, REJECT |
| `tableName` | STRING | Nama tabel yang diubah (Users, Attendances, etc) |
| `recordId` | INTEGER | ID record yang diubah |
| `oldData` | JSON | Data sebelum perubahan (untuk UPDATE & DELETE) |
| `newData` | JSON | Data sesudah perubahan (untuk CREATE & UPDATE) |
| `changes` | JSON | Summary field-field yang berubah |
| `ipAddress` | STRING | IP address user |
| `userAgent` | TEXT | Browser/device info |
| `description` | TEXT | Deskripsi tambahan |
| `createdAt` | DATE | Timestamp |

**Indexes:**
- `userId` - Query by user
- `tableName` - Query by table
- `recordId` - Query by record
- `action` - Query by action type
- `createdAt` - Query by date range

---

## 🔌 API ENDPOINTS

Base URL: `/audit-logs`  
**⚠️ All endpoints require ADMIN role**

### 1. Get All Audit Logs (dengan Filter)

```http
GET /audit-logs
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `action` (optional) - Filter by action (CREATE, UPDATE, DELETE, etc)
- `tableName` (optional) - Filter by table name
- `recordId` (optional) - Filter by record ID
- `startDate` (optional) - Start date (ISO format)
- `endDate` (optional) - End date (ISO format)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page
- `sortBy` (optional, default: createdAt) - Sort field
- `sortOrder` (optional, default: DESC) - Sort order

**Example Request:**
```bash
curl -X GET "http://localhost:3000/audit-logs?tableName=Users&action=UPDATE&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "auditLogs": [
      {
        "id": 1,
        "userId": 2,
        "action": "UPDATE",
        "tableName": "Users",
        "recordId": 5,
        "oldData": {
          "name": "John Doe",
          "role": "employee"
        },
        "newData": {
          "name": "John Doe",
          "role": "admin"
        },
        "changes": {
          "role": {
            "from": "employee",
            "to": "admin"
          }
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "description": "Updated Users record",
        "createdAt": "2026-01-05T10:30:00.000Z",
        "user": {
          "id": 2,
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "admin"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    },
    "filters": {
      "tableName": "Users",
      "action": "UPDATE"
    }
  }
}
```

---

### 2. Get Audit Log by ID

```http
GET /audit-logs/:id
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X GET "http://localhost:3000/audit-logs/123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 3. Get Audit Logs for Specific Record

Track semua perubahan pada satu record tertentu.

```http
GET /audit-logs/record/:tableName/:recordId
Authorization: Bearer <admin_token>
```

**Example:**
```bash
# Lihat semua perubahan pada User ID 5
curl -X GET "http://localhost:3000/audit-logs/record/Users/5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Audit logs for Users #5 retrieved successfully",
  "data": {
    "auditLogs": [
      {
        "id": 10,
        "action": "UPDATE",
        "changes": {
          "salary": {
            "from": 5000000,
            "to": 6000000
          }
        },
        "createdAt": "2026-01-05T14:00:00.000Z",
        "user": {
          "name": "Admin User"
        }
      },
      {
        "id": 5,
        "action": "CREATE",
        "newData": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2026-01-01T09:00:00.000Z"
      }
    ],
    "total": 2,
    "tableName": "Users",
    "recordId": "5"
  }
}
```

---

### 4. Get Audit Logs by User

Lihat semua aktivitas yang dilakukan oleh seorang user.

```http
GET /audit-logs/user/:userId
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `startDate` (optional)
- `endDate` (optional)

**Example:**
```bash
curl -X GET "http://localhost:3000/audit-logs/user/2?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 5. Get Audit Statistics

Dashboard statistics untuk admin.

```http
GET /audit-logs/stats
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (optional) - Filter by date range
- `endDate` (optional)

**Example:**
```bash
curl -X GET "http://localhost:3000/audit-logs/stats?startDate=2026-01-01" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Audit statistics retrieved successfully",
  "data": {
    "total": 1523,
    "byAction": [
      {
        "action": "UPDATE",
        "count": 850
      },
      {
        "action": "CREATE",
        "count": 423
      },
      {
        "action": "DELETE",
        "count": 150
      },
      {
        "action": "LOGIN",
        "count": 100
      }
    ],
    "byTable": [
      {
        "tableName": "Attendances",
        "count": 650
      },
      {
        "tableName": "Users",
        "count": 320
      },
      {
        "tableName": "LeaveRequests",
        "count": 280
      }
    ],
    "mostActiveUsers": [
      {
        "userId": 2,
        "count": 450,
        "user": {
          "id": 2,
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "admin"
        }
      }
    ],
    "dateRange": {
      "startDate": "2026-01-01",
      "endDate": null
    }
  }
}
```

---

### 6. Get Recent Activities

Get latest audit logs (untuk dashboard).

```http
GET /audit-logs/recent
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `limit` (optional, default: 20)

**Example:**
```bash
curl -X GET "http://localhost:3000/audit-logs/recent?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 💻 USAGE IN CODE

### 1. Manual Logging (Recommended for Important Actions)

```javascript
const AuditLogger = require('../helpers/auditLogger');

// Example: Log approval action
static async approveLeaveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const leaveRequest = await LeaveRequest.findByPk(id);
    const oldData = leaveRequest.toJSON();
    
    // Update leave request
    await leaveRequest.update({
      status: 'approved',
      approvedBy: req.user.id
    });
    
    const newData = leaveRequest.toJSON();
    
    // 📌 Log approval
    await AuditLogger.logApprove({
      userId: req.user.id,
      tableName: 'LeaveRequests',
      recordId: id,
      oldData,
      newData,
      req,
      description: `Approved leave request for ${leaveRequest.User.name}`
    });
    
    res.status(200).json({ success: true, data: leaveRequest });
  } catch (error) {
    next(error);
  }
}
```

### 2. Auto-Tracking dengan Hooks (Optional)

Untuk otomatis tracking semua perubahan:

```javascript
// Di models/index.js atau setup file
const AuditMiddleware = require('../middlewares/auditMiddleware');
const { User, Attendance, LeaveRequest } = require('../models');

// Setup auto-tracking untuk models
AuditMiddleware.setupMultipleHooks([
  User,
  Attendance,
  LeaveRequest
], {
  excludeFields: ['createdAt', 'updatedAt', 'password'],
  trackCreate: true,
  trackUpdate: true,
  trackDelete: true
});
```

**Kemudian di controller, gunakan transaction dengan userId:**

```javascript
static async updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    // Create transaction with user context
    const result = await req.createAuditTransaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t });
      
      // Update akan otomatis tercatat karena hooks
      await user.update({ name, role }, { 
        transaction: t,
        userId: req.user.id,  // Pass userId untuk hooks
        req: req              // Pass req untuk IP & UserAgent
      });
      
      return user;
    });
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

---

## 🔐 Security Features

1. **Sensitive Data Redaction**
   - Password, token, dll otomatis di-redact menjadi `***REDACTED***`

2. **Admin Only Access**
   - Semua endpoint hanya bisa diakses oleh admin

3. **IP Address & User Agent Tracking**
   - Mencatat dari mana dan device apa aktivitas dilakukan

4. **Immutable Logs**
   - Audit logs tidak bisa diedit/dihapus (best practice)

---

## 📊 Use Cases

### 1. Compliance & Legal
```
Q: "Siapa yang mengubah gaji karyawan X pada tanggal Y?"
A: Query audit logs dengan tableName=Users, recordId=X, startDate=Y
```

### 2. Security Investigation
```
Q: "Apakah ada aktivitas mencurigakan dari IP tertentu?"
A: Filter audit logs by ipAddress
```

### 3. Troubleshooting
```
Q: "Kenapa data attendance karyawan berubah?"
A: Lihat audit trail dengan /record/Attendances/{id}
```

### 4. Performance Monitoring
```
Q: "User mana yang paling aktif melakukan perubahan?"
A: Check /audit-logs/stats untuk mostActiveUsers
```

---

## 🎨 Frontend Integration Example

```javascript
// Fetch audit logs with filters
async function fetchAuditLogs(filters) {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`/audit-logs?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return await response.json();
}

// Usage
const logs = await fetchAuditLogs({
  tableName: 'Users',
  action: 'UPDATE',
  startDate: '2026-01-01',
  page: 1,
  limit: 20
});

console.log(logs.data.auditLogs);
```

---

## ✅ Best Practices

1. **Log Important Actions Only**
   - Login/Logout
   - Data changes (CREATE, UPDATE, DELETE)
   - Approval/Rejection actions
   - Privilege changes

2. **Don't Log Everything**
   - Skip read operations (GET requests)
   - Skip frequently-updated fields (lastLoginAt, viewCount, etc)

3. **Data Retention**
   - Consider archiving old audit logs (>1 year)
   - Set up database cleanup jobs

4. **Performance**
   - Audit logging should NEVER block main operations
   - Use async/await with try-catch
   - Add database indexes

---

## 🚀 Testing

```bash
# 1. Login as admin
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# 2. Get recent activities
curl -X GET http://localhost:3000/audit-logs/recent \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get statistics
curl -X GET http://localhost:3000/audit-logs/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get audit trail for specific user
curl -X GET http://localhost:3000/audit-logs/record/Users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📌 Summary

✅ **Implemented:**
- ✅ Audit Log Model & Migration
- ✅ Helper functions untuk easy logging
- ✅ Auto-tracking dengan Sequelize hooks
- ✅ Admin-only API endpoints dengan filter lengkap
- ✅ Statistics & analytics
- ✅ IP & UserAgent tracking
- ✅ Sensitive data redaction
- ✅ Changes comparison (before/after)

🎯 **Enterprise-Ready Features:**
- Track siapa edit apa ✅
- Track kapan ✅
- Track data sebelum & sesudah ✅
- Track IP & device ✅
- Filtering & pagination ✅
- Statistics & reporting ✅

---

**🎉 Your HR System is now ENTERPRISE-READY with complete Audit Trail!**
