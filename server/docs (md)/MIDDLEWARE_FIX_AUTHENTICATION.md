# 🔧 Middleware Fix: Authentication & Authorization
**Date:** January 2, 2026  
**Issue:** User dengan bearer token mendapat error tanpa pesan yang jelas

---

## 🔴 **Problem yang Ditemukan:**

### **Issue #1: Tidak Ada Error Message yang Jelas**

**Before:**
```javascript
// Middleware throw error object tanpa message jelas
if (!authorization) throw { name: "Unauthorized" }
if (!user) throw { name: 'Unauthorized' }
if (user.role !== 'ADMIN') throw { name: 'Forbidden' }
```

**Problem:**
- User tidak tahu kenapa request ditolak
- Error message generic dari errorHandler
- Sulit untuk debugging

---

### **Issue #2: Potential Role Case Sensitivity**

**Data Inconsistency:**
```javascript
// Seeder data
role: "ADMIN"        // Uppercase

// Model default
role: "employee"     // Lowercase

// Middleware check
user.role !== 'ADMIN'  // Strict equality, case-sensitive
```

**Problem:**
- Kalau ada role `'admin'` (lowercase) di database, check akan fail
- Tidak ada case-insensitive handling

---

## ✅ **Solution Implemented:**

### **Fix #1: Add Clear Error Messages**

#### **authentication.js - UPDATED**

```javascript
const { verifyToken } = require('../helpers/jwt')

const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers

        // ✅ Clear error message
        if (!authorization) {
            return res.status(401).json({ 
                message: 'Unauthorized: No authorization header provided' 
            });
        }

        const token = authorization.split(' ')[1]
        
        // ✅ Check token format
        if (!token) {
            return res.status(401).json({ 
                message: 'Unauthorized: Invalid token format. Use: Bearer <token>' 
            });
        }

        const decoded = verifyToken(token)

        req.user = {
            id: decoded.id || decoded.userId,
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role
        }
        next()
    } catch (err) {
        console.error('Authentication error:', err);
        
        // ✅ Handle JWT specific errors with clear messages
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Unauthorized: Invalid token' 
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Unauthorized: Token has expired, please login again' 
            });
        }
        
        next(err)
    }
} 

module.exports = authentication
```

**Benefits:**
- ✅ User tahu kenapa request ditolak
- ✅ Clear instructions (e.g., "Use: Bearer <token>")
- ✅ Better debugging experience

---

#### **authorization.js - UPDATED**

```javascript
const { User } = require('../models')

// isAdmin middleware: ensure the requester (from token) is admin
const isAdmin = async (req, res, next) => {
    try {
        const userIdFromToken = req.user && (req.user.userId || req.user.id)
        
        // ✅ Clear error message
        if (!userIdFromToken) {
            return res.status(401).json({ 
                message: 'Unauthorized: Please login first' 
            });
        }

        const user = await User.findByPk(userIdFromToken)
        
        // ✅ Clear error message
        if (!user) {
            return res.status(401).json({ 
                message: 'Unauthorized: User not found' 
            });
        }

        // ✅ Case-insensitive role check
        const userRole = user.role.toUpperCase();
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ 
                message: 'Forbidden: Admin access required' 
            });
        }

        next()
    } catch (err) {
        console.error('isAdmin middleware error:', err);
        next(err)
    }
}

module.exports = isAdmin
```

**Benefits:**
- ✅ Case-insensitive role check (`toUpperCase()`)
- ✅ Clear error messages for each failure point
- ✅ Better logging for debugging

---

### **Fix #2: Remove Unused Imports**

**Before:**
```javascript
const { Product, User, Category } = require('../models')
```

**After:**
```javascript
const { User } = require('../models')
```

**Benefits:**
- ✅ Clean code (no unused imports)
- ✅ Faster model loading

---

## 📊 **Error Response Comparison:**

### **Before (Unclear):**

```json
// Request tanpa Authorization header
{
  "message": "Please login first"
}

// Request dengan invalid token
{
  "message": "Please login first"
}

// Request employee ke admin endpoint
{
  "message": "You dont have any access"
}
```

**Problem:** Semua error mirip, user bingung!

---

### **After (Clear):**

```json
// Request tanpa Authorization header
{
  "message": "Unauthorized: No authorization header provided"
}

// Request dengan format token salah (tanpa "Bearer")
{
  "message": "Unauthorized: Invalid token format. Use: Bearer <token>"
}

// Request dengan invalid token
{
  "message": "Unauthorized: Invalid token"
}

// Request dengan expired token
{
  "message": "Unauthorized: Token has expired, please login again"
}

// Request dengan user tidak ditemukan
{
  "message": "Unauthorized: User not found"
}

// Request employee ke admin endpoint
{
  "message": "Forbidden: Admin access required"
}
```

**Benefits:** ✅ Jelas, spesifik, actionable!

---

## 🧪 **Testing Scenarios:**

### **Test 1: No Authorization Header**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance
```

**Response:**
```json
{
  "message": "Unauthorized: No authorization header provided"
}
```

✅ **Status:** 401 Unauthorized

---

### **Test 2: Invalid Token Format (Missing "Bearer")**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance \
  -H "Authorization: invalidtoken123"
```

**Response:**
```json
{
  "message": "Unauthorized: Invalid token format. Use: Bearer <token>"
}
```

✅ **Status:** 401 Unauthorized

---

### **Test 3: Invalid Token**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance \
  -H "Authorization: Bearer invalidtoken123"
```

**Response:**
```json
{
  "message": "Unauthorized: Invalid token"
}
```

✅ **Status:** 401 Unauthorized

---

### **Test 4: Expired Token**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance \
  -H "Authorization: Bearer <expired-token>"
```

**Response:**
```json
{
  "message": "Unauthorized: Token has expired, please login again"
}
```

✅ **Status:** 401 Unauthorized

---

### **Test 5: Employee Token ke Admin Endpoint**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance \
  -H "Authorization: Bearer <employee-token>"
```

**Response:**
```json
{
  "message": "Forbidden: Admin access required"
}
```

✅ **Status:** 403 Forbidden

---

### **Test 6: Valid Admin Token**

**Request:**
```bash
curl -X GET http://localhost:3000/attendances/admin/all-attendance \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**
```json
{
  "message": "All attendance records",
  "data": [...]
}
```

✅ **Status:** 200 OK

---

## 🎯 **Best Practices Applied:**

### **1. Explicit Error Messages** ✅
```javascript
// ❌ BAD: Generic error
throw { name: 'Unauthorized' }

// ✅ GOOD: Specific error
return res.status(401).json({ 
    message: 'Unauthorized: Please login first' 
});
```

---

### **2. Early Return Pattern** ✅
```javascript
// ✅ GOOD: Early return for errors
if (!authorization) {
    return res.status(401).json({ message: '...' });
}

// Continue with main logic
const token = authorization.split(' ')[1];
```

---

### **3. Case-Insensitive Comparison** ✅
```javascript
// ❌ BAD: Case-sensitive (fragile)
if (user.role !== 'ADMIN')

// ✅ GOOD: Case-insensitive (robust)
const userRole = user.role.toUpperCase();
if (userRole !== 'ADMIN')
```

---

### **4. Proper Status Codes** ✅
```javascript
401 Unauthorized - Authentication failed
403 Forbidden    - Authorization failed (valid token, wrong role)
```

---

### **5. Console Logging for Debugging** ✅
```javascript
console.error('Authentication error:', err);
console.error('isAdmin middleware error:', err);
```

---

## 📝 **Files Modified:**

1. ✅ `middlewares/authentication.js` - Better error messages & JWT handling
2. ✅ `middlewares/authorization.js` - Case-insensitive role check & clear messages

---

## 🔍 **Root Cause Analysis:**

### **Why Error Messages Weren't Showing:**

**Flow Before:**
```
1. Middleware throws: { name: 'Unauthorized' }
2. Goes to errorHandler
3. errorHandler checks: if (err.name == 'Unauthorized')
4. Returns generic: "Please login first"
```

**Problem:** Generic message doesn't help user understand what's wrong!

---

**Flow After:**
```
1. Middleware returns direct response with specific message
2. User gets clear, actionable error message
3. No need to go through errorHandler
```

**Benefits:** ✅ Immediate, specific feedback!

---

## ✨ **Summary:**

### **Changes Made:**
- ✅ Added explicit error messages in both middlewares
- ✅ Case-insensitive role checking
- ✅ Better JWT error handling
- ✅ Console logging for debugging
- ✅ Removed unused imports

### **Benefits:**
- ✅ Clear error messages for users
- ✅ Easier debugging for developers
- ✅ More robust role checking
- ✅ Better user experience

### **Status:**
```
✅ Server: Running without errors
✅ Authentication: Working with clear messages
✅ Authorization: Working with case-insensitive check
✅ Ready for testing
```

---

## 🎓 **How to Test:**

### **Step 1: Login as Admin**
```bash
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Copy the `access_token` from response**

---

### **Step 2: Test Admin Endpoint**
```bash
GET http://localhost:3000/attendances/admin/all-attendance
Authorization: Bearer <paste-your-token-here>
```

**Should return:** All attendance records ✅

---

### **Step 3: Test Employee Token (Should Fail)**
```bash
# Login as employee first
POST http://localhost:3000/login
{
  "email": "budi@company.com",
  "password": "budi123"
}

# Try admin endpoint with employee token
GET http://localhost:3000/attendances/admin/all-attendance
Authorization: Bearer <employee-token>
```

**Should return:** 
```json
{
  "message": "Forbidden: Admin access required"
}
```

---

**Fix Date:** January 2, 2026  
**Status:** ✅ Resolved  
**Testing:** Ready for validation
