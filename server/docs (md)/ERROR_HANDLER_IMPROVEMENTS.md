# 🛡️ Error Handler Improvements

**Tanggal Update:** 7 Januari 2026  
**Status:** ✅ Implemented & Tested (304/304 tests passed)

## 📋 Overview

Error Handler telah ditingkatkan untuk menangani **SEMUA jenis error** yang terjadi di aplikasi, termasuk:
- ✅ Error dari Sequelize (validation, database, constraint)
- ✅ Custom application errors (BadRequest, NotFound, Forbidden, dll)
- ✅ JWT/Authentication errors
- ✅ File upload errors (Multer)
- ✅ **Generic Error objects dari models dan helpers** ⭐ NEW
- ✅ Custom error classes ⭐ NEW
- ✅ External service errors (Midtrans, Google OAuth)

---

## 🎯 Masalah yang Diperbaiki

### Problem Sebelumnya:
1. ❌ Generic `Error` objects dari models/helpers tidak ter-handle dengan baik
2. ❌ Error seperti:
   - `throw new Error('Start date and end date are required')`
   - `throw new Error('Notification not found')`
   - `throw new Error('Leave date must be after join date')`
   
   Semua menjadi **500 Internal Server Error** padahal harusnya 400 atau 404.

### Solusi:
✅ ErrorHandler sekarang **otomatis mendeteksi** jenis error berdasarkan message content dan memberikan status code yang tepat.

---

## 🚀 Fitur Baru

### 1. **Smart Error Message Detection**

ErrorHandler sekarang membaca message error dan memberikan status code yang sesuai:

| **Error Message Contains** | **HTTP Status** | **Contoh** |
|---------------------------|----------------|------------|
| "not found" | 404 | `new Error('Notification not found')` |
| "required", "invalid", "must be", "cannot", "should" | 400 | `new Error('Start date is required')` |
| "unauthorized", "unauthenticated" | 401 | `new Error('User is unauthorized')` |
| "forbidden", "access denied" | 403 | `new Error('Access is forbidden')` |
| Other | 500 | Generic errors |

### 2. **Custom Error Classes**

Tambahan file baru: `helpers/customErrors.js`

```javascript
const { BadRequestError, NotFoundError, ForbiddenError } = require('../helpers/customErrors');

// Contoh penggunaan:
throw new BadRequestError('Email is required');
throw new NotFoundError('User not found');
throw new ForbiddenError('Admin access required');
```

**Available Error Classes:**
- `BadRequestError` - 400
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `ValidationError` - 400
- `LoginError` - 401
- `TokenExpiredError` - 401
- `GoogleAuthError` - 401
- `PayloadTooLargeError` - 413

**Keuntungan:**
- ✅ Type safety
- ✅ Stack trace preservation
- ✅ Consistent error handling
- ✅ Auto HTTP status code

---

## 📝 Cara Penggunaan

### ❌ **SEBELUM (Inconsistent):**

```javascript
// Pattern 1: Direct response (tidak melewati errorHandler)
return res.status(400).json({
    message: "Invalid input"
});

// Pattern 2: Throw object (melewati errorHandler)
throw { name: "BadRequest", message: "Invalid input" };

// Pattern 3: Generic error (jadi 500)
throw new Error('User not found'); // ❌ Jadi 500, harusnya 404
```

### ✅ **SESUDAH (Semua ter-handle dengan baik):**

```javascript
// Opsi 1: Pakai Custom Error Class (RECOMMENDED)
throw new NotFoundError('User not found'); // ✅ Auto 404

// Opsi 2: Pakai Generic Error (otomatis dideteksi)
throw new Error('User not found'); // ✅ Auto 404 (deteksi dari "not found")
throw new Error('Email is required'); // ✅ Auto 400 (deteksi dari "required")

// Opsi 3: Throw object (backward compatible)
throw { name: "BadRequest", message: "Invalid input" }; // ✅ Still works

// Opsi 4: Direct response (masih bisa, tapi tidak recommended)
return res.status(400).json({ message: "Invalid input" }); // ⚠️ Works but inconsistent
```

---

## 🧪 Testing

File test baru: `__test__/errorHandler.test.js`

**Test Coverage:**
- ✅ 30 test cases
- ✅ Covers all error types
- ✅ Sequelize errors
- ✅ Custom application errors
- ✅ JWT errors
- ✅ Multer errors
- ✅ Generic Error objects
- ✅ Custom Error classes
- ✅ Edge cases

**Run Test:**
```bash
npm test -- __test__/errorHandler.test.js
```

**Full Test Suite:**
```bash
npm test
# Result: ✅ 304/304 tests passed
```

---

## 📊 Impact Analysis

### Files Modified:
1. ✅ `middlewares/errorHandler.js` - Enhanced logic
2. ✅ `helpers/customErrors.js` - New file (custom error classes)
3. ✅ `__test__/errorHandler.test.js` - New test file

### Backward Compatibility:
✅ **100% BACKWARD COMPATIBLE**
- Semua existing error handling tetap bekerja
- Tidak ada breaking changes
- Hanya **menambahkan** kemampuan baru

### Benefits:
1. ✅ Semua error sekarang ter-handle dengan status code yang tepat
2. ✅ Tidak ada lagi error 500 yang seharusnya 400/404
3. ✅ Consistent error response format
4. ✅ Better debugging experience
5. ✅ Production-ready (sensitive errors hidden in production)

---

## 🔍 Before vs After Comparison

### Scenario 1: Model Validation Error

**Before:**
```javascript
// models/user.js
throw new Error('Leave date must be after join date');
// ❌ Response: 500 Internal Server Error
```

**After:**
```javascript
// models/user.js
throw new Error('Leave date must be after join date');
// ✅ Response: 400 Bad Request
// Message: "Leave date must be after join date"
```

### Scenario 2: Helper Not Found Error

**Before:**
```javascript
// helpers/notificationHelper.js
throw new Error('Notification not found');
// ❌ Response: 500 Internal Server Error
```

**After:**
```javascript
// helpers/notificationHelper.js
throw new Error('Notification not found');
// ✅ Response: 404 Not Found
// Message: "Notification not found"
```

### Scenario 3: Using Custom Error Class

**New Feature:**
```javascript
const { NotFoundError } = require('../helpers/customErrors');

// In any controller/helper
throw new NotFoundError('User not found');
// ✅ Response: 404 Not Found
// ✅ Includes stack trace
// ✅ Type safe
```

---

## 🎯 Best Practices

### 1. **Use Custom Error Classes** (Recommended)
```javascript
const { BadRequestError, NotFoundError } = require('../helpers/customErrors');

// Validation
if (!email) throw new BadRequestError('Email is required');

// Not found
if (!user) throw new NotFoundError('User not found');
```

### 2. **Generic Errors Still Work**
```javascript
// These will auto-detect status code:
throw new Error('Email is required'); // → 400
throw new Error('User not found'); // → 404
throw new Error('Access is forbidden'); // → 403
```

### 3. **Avoid Direct Response** (For Consistency)
```javascript
// ❌ NOT RECOMMENDED (bypasses errorHandler)
return res.status(400).json({ message: 'Error' });

// ✅ RECOMMENDED (goes through errorHandler)
throw new BadRequestError('Error message');
```

### 4. **Custom Status Codes**
```javascript
const err = new Error('Custom error');
err.statusCode = 422;
throw err; // → 422 Unprocessable Entity
```

---

## 🔒 Security Considerations

**Production Mode:**
```javascript
// Unknown errors (500) hide details in production
if (process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error'; // Generic message
} else {
    message = err.message; // Detailed message for debugging
}
```

**Known errors** (400, 401, 403, 404) tetap menampilkan message asli karena aman untuk user.

---

## 📚 Related Documentation

- [API_ENDPOINTS_COMPLETE.md](./API_ENDPOINTS_COMPLETE.md) - API documentation
- [MIDDLEWARE_FIX_AUTHENTICATION.md](./MIDDLEWARE_FIX_AUTHENTICATION.md) - Auth middleware
- [TESTING_COMPLETE.md](./TESTING_COMPLETE.md) - Testing guide

---

## ✅ Checklist

- [x] ErrorHandler enhanced untuk generic errors
- [x] Custom error classes dibuat
- [x] Test suite dibuat (30 test cases)
- [x] Semua test passed (304/304)
- [x] Backward compatibility maintained
- [x] Documentation created
- [x] Production-ready

---

## 🎉 Summary

ErrorHandler sekarang **COMPLETE** dan menangani **SEMUA** jenis error dengan tepat:

1. ✅ **Sequelize Errors** → Proper validation messages
2. ✅ **Custom Application Errors** → Named errors (BadRequest, NotFound, etc.)
3. ✅ **JWT Errors** → Auth/token issues
4. ✅ **Multer Errors** → File upload issues
5. ✅ **Generic Error Objects** → Smart detection dari message ⭐ NEW
6. ✅ **Custom Error Classes** → Type-safe error throwing ⭐ NEW
7. ✅ **Custom Status Codes** → Flexible error handling

**Result:** Aplikasi sekarang memiliki **consistent, comprehensive, and production-ready error handling** system! 🚀
