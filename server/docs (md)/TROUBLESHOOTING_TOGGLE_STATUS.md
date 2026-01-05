# Troubleshooting Guide - Toggle User Status Endpoint

## Endpoint
`PATCH /users/admin/:id/status`

---

## ✅ Format Request yang BENAR

### **1. Boolean Native (Recommended)**
```json
PATCH http://localhost:3000/users/admin/1/status
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "isActive": true
}
```

### **2. Boolean as String (Juga Diterima)**
```json
{
  "isActive": "true"
}
```
atau
```json
{
  "isActive": "false"
}
```

---

## ❌ Format yang SALAH

### **1. Missing isActive Field**
```json
{
  // Error: isActive field is required
}
```

### **2. Invalid Boolean Value**
```json
{
  "isActive": "yes"  // ❌ Error
}
```

### **3. Number Instead of Boolean**
```json
{
  "isActive": 1  // ❌ Error
}
```

---

## 📝 Contoh Lengkap dengan cURL

### **Activate User (Set to Active)**
```bash
curl -X PATCH http://localhost:3000/users/admin/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

**Response Success (200)**:
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

### **Deactivate User (Set to Inactive)**
```bash
curl -X PATCH http://localhost:3000/users/admin/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Response Success (200)**:
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

---

## 🔍 Possible Errors dan Solusinya

### **1. Error: "isActive field is required"**
**Status Code**: 400

**Penyebab**: Request body kosong atau tidak ada field `isActive`

**Solusi**: Pastikan mengirim body dengan field `isActive`
```json
{
  "isActive": true
}
```

---

### **2. Error: "isActive must be a boolean value (true or false)"**
**Status Code**: 400

**Penyebab**: Nilai `isActive` bukan boolean atau string "true"/"false"

**Solusi**: Gunakan nilai `true`, `false`, `"true"`, atau `"false"`

---

### **3. Error: "User not found"**
**Status Code**: 404

**Penyebab**: User dengan ID tersebut tidak ada di database

**Solusi**: Pastikan ID user benar
```bash
# Cek daftar user terlebih dahulu
GET http://localhost:3000/users/admin
```

---

### **4. Error: "Please login first"**
**Status Code**: 401

**Penyebab**: Token JWT tidak ada atau tidak valid

**Solusi**: 
1. Login terlebih dahulu untuk mendapatkan token
2. Gunakan token di header `Authorization: Bearer YOUR_TOKEN`

---

### **5. Error: "You dont have any access"**
**Status Code**: 403

**Penyebab**: User yang login bukan admin

**Solusi**: Login dengan user yang memiliki role "Admin"

---

## 🧪 Testing dengan Postman

### **Step 1: Setup Request**
1. Method: `PATCH`
2. URL: `http://localhost:3000/users/admin/1/status`
3. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer YOUR_ADMIN_TOKEN`

### **Step 2: Request Body (raw JSON)**
```json
{
  "isActive": false
}
```

### **Step 3: Send Request**
Klik **Send** dan pastikan response status **200 OK**

---

## 🔧 Perbaikan yang Sudah Dilakukan

### **Sebelum** (Error Prone):
```javascript
if (typeof isActive !== 'boolean') {
    throw { name: "BadRequest", message: "isActive must be a boolean value" };
}
```

❌ **Masalah**: Tidak bisa menerima string `"true"` atau `"false"`

### **Sesudah** (Lebih Flexible):
```javascript
// Handle different input formats
if (isActive === undefined || isActive === null) {
    throw { name: "BadRequest", message: "isActive field is required" };
}

// Convert string to boolean if needed
if (typeof isActive === 'string') {
    if (isActive.toLowerCase() === 'true') {
        isActive = true;
    } else if (isActive.toLowerCase() === 'false') {
        isActive = false;
    } else {
        throw { name: "BadRequest", message: "isActive must be a boolean value (true or false)" };
    }
} else if (typeof isActive !== 'boolean') {
    throw { name: "BadRequest", message: "isActive must be a boolean value (true or false)" };
}
```

✅ **Sekarang bisa menerima**:
- `true` / `false` (boolean)
- `"true"` / `"false"` (string)
- `"True"` / `"False"` (case insensitive)

---

## 📌 Quick Reference

| Input Value | Accepted? | Result |
|------------|-----------|--------|
| `true` | ✅ Yes | Active |
| `false` | ✅ Yes | Inactive |
| `"true"` | ✅ Yes | Active |
| `"false"` | ✅ Yes | Inactive |
| `"TRUE"` | ✅ Yes | Active |
| `"FALSE"` | ✅ Yes | Inactive |
| `1` | ❌ No | Error |
| `0` | ❌ No | Error |
| `"yes"` | ❌ No | Error |
| `"no"` | ❌ No | Error |
| (empty) | ❌ No | Error |

---

## ✨ Best Practice

**Gunakan boolean native untuk konsistensi**:
```json
{
  "isActive": true
}
```

Bukan string:
```json
{
  "isActive": "true"  // Meskipun diterima, tapi kurang ideal
}
```

---

Endpoint sekarang sudah diperbaiki dan lebih robust dalam menangani berbagai format input! 🎉
