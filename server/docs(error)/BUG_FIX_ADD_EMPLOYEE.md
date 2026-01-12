# 🐛 Bug Fix: Add Employee Button Not Working

## Masalah
Button "Add Employee" tidak berfungsi. Employee tidak berhasil ditambahkan.

## Akar Masalah

### 1. **Role Mismatch**
```javascript
// Backend (registerController.js) - SEBELUM
role: 'Employee',  // ❌ Huruf kecil, tidak sesuai enum

// Frontend mengirim
role: 'EMPLOYEE'   // ✅ Huruf kapital semua
```

### 2. **Field Tidak Diterima**
Backend tidak menerima field yang dikirim dari frontend:
- ❌ `phoneNumber`
- ❌ `position`
- ❌ `department`
- ❌ `isActive`

### 3. **Field Tidak Ada di Database**
Tabel `Users` tidak memiliki kolom:
- ❌ `phoneNumber`
- ❌ `position`
- ❌ `department`

### 4. **Response Format Tidak Konsisten**
```javascript
// Backend response - SEBELUM
{
    message: "Success create new user",
    email: user.email,
    name: user.name,
    // ... field individual
}

// Frontend mengharapkan
response.data.data  // ❌ Tidak ada key "data"
```

## Solusi

### 1. ✅ Tambahkan Kolom di Database

**File:** Migration `20260112165336-add-employee-details-to-users.js`

```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'phoneNumber', {
    type: Sequelize.STRING,
    allowNull: true
  });
  
  await queryInterface.addColumn('Users', 'position', {
    type: Sequelize.STRING,
    allowNull: true
  });
  
  await queryInterface.addColumn('Users', 'department', {
    type: Sequelize.STRING,
    allowNull: true
  });
}
```

**Jalankan migration:**
```bash
cd server
npx sequelize-cli db:migrate
```

### 2. ✅ Update Model User

**File:** `server/models/user.js`

```javascript
// Tambahkan field baru
phoneNumber: {
  type: DataTypes.STRING,
  allowNull: true
},
role: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'EMPLOYEE',  // ✅ Ubah dari 'employee' ke 'EMPLOYEE'
  notEmpty: {
    msg: 'Role cannot be empty'
  }
},
position: {
  type: DataTypes.STRING,
  allowNull: true
},
department: {
  type: DataTypes.STRING,
  allowNull: true
}
```

### 3. ✅ Update Register Controller

**File:** `server/controllers/registerController.js`

**SEBELUM:**
```javascript
static async register(req, res, next) {
    try {
        const { email, password, name, joinDate } = req.body
        if (!email || !password) throw { name: "BadRequest" }

        const userData = { 
            email, 
            password, 
            name, 
            role: 'Employee',  // ❌ Hardcoded, typo
            isActive: true
        }

        if (joinDate) {
            userData.joinDate = joinDate
        } else {
            userData.joinDate = new Date()
        }

        const user = await User.create(userData)

        res.status(201).json({
            message: "Success create new user",
            email: user.email,     // ❌ Format tidak konsisten
            name: user.name,
            joinDate: user.joinDate,
            isActive: user.isActive
        })
    } catch (error) {
        next(error)
    }
}
```

**SESUDAH:**
```javascript
static async register(req, res, next) {
    try {
        const { 
            email, 
            password, 
            name, 
            phoneNumber,      // ✅ Tambah
            role,             // ✅ Terima dari request
            position,         // ✅ Tambah
            department,       // ✅ Tambah
            joinDate,
            isActive          // ✅ Terima dari request
        } = req.body
        
        if (!email || !password || !name) {
            throw { name: "BadRequest", message: "Email, password, and name are required" }
        }

        const userData = { 
            email, 
            password, 
            name, 
            phoneNumber: phoneNumber || null,    // ✅
            role: role || 'EMPLOYEE',             // ✅ Default EMPLOYEE
            position: position || null,           // ✅
            department: department || null,       // ✅
            isActive: isActive !== undefined ? isActive : true
        }

        if (joinDate) {
            userData.joinDate = joinDate
        } else {
            userData.joinDate = new Date()
        }

        const user = await User.create(userData)

        res.status(201).json({
            message: "Employee created successfully",
            data: {                              // ✅ Konsisten dengan format
                id: user.id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,   // ✅
                role: user.role,
                position: user.position,         // ✅
                department: user.department,     // ✅
                joinDate: user.joinDate,
                isActive: user.isActive
            }
        })
    } catch (error) {
        next(error)
    }
}
```

## Perubahan yang Dilakukan

### Database
1. ✅ Tambah kolom `phoneNumber` (STRING, nullable)
2. ✅ Tambah kolom `position` (STRING, nullable)
3. ✅ Tambah kolom `department` (STRING, nullable)

### Model
1. ✅ Tambah field `phoneNumber`
2. ✅ Ubah default role dari `'employee'` → `'EMPLOYEE'`
3. ✅ Tambah field `position`
4. ✅ Tambah field `department`

### Controller
1. ✅ Terima semua field dari request body
2. ✅ Validasi yang lebih baik
3. ✅ Response format konsisten dengan `data` object
4. ✅ Return semua field yang dibutuhkan frontend

## Testing

1. **Restart backend server:**
   ```bash
   cd server
   node bin/www.js
   ```

2. **Test Add Employee:**
   - Klik button "Add Employee"
   - Isi form dengan data employee
   - Submit
   - ✅ Employee berhasil ditambahkan
   - ✅ Data muncul di tabel

3. **Verifikasi field:**
   - ✅ Name
   - ✅ Email
   - ✅ Phone Number
   - ✅ Position
   - ✅ Department
   - ✅ Role
   - ✅ Join Date
   - ✅ Status (Active/Inactive)

## Endpoint Register

**POST** `/register`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "08123456789",
  "role": "EMPLOYEE",
  "position": "Software Engineer",
  "department": "IT",
  "joinDate": "2026-01-12",
  "isActive": true
}
```

**Response Success (201):**
```json
{
  "message": "Employee created successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "08123456789",
    "role": "EMPLOYEE",
    "position": "Software Engineer",
    "department": "IT",
    "joinDate": "2026-01-12T00:00:00.000Z",
    "isActive": true
  }
}
```

## Catatan Penting

### Role Values
Pastikan role menggunakan format UPPERCASE:
- ✅ `EMPLOYEE`
- ✅ `ADMIN`
- ✅ `SUPER_ADMIN`
- ❌ `Employee`
- ❌ `employee`

### Default Values
- `role`: Default ke `'EMPLOYEE'` jika tidak dikirim
- `isActive`: Default ke `true` jika tidak dikirim
- `joinDate`: Default ke tanggal sekarang jika tidak dikirim
- `phoneNumber`, `position`, `department`: Nullable

---
**Fixed by:** 
1. Database migration untuk field baru
2. Update model User
3. Update registerController dengan field lengkap dan response konsisten

**Date:** January 12, 2026
