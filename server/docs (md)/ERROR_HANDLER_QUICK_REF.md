# ⚡ Error Handler Quick Reference

**Last Updated:** 7 Januari 2026

## 🎯 Quick Guide

### Import Custom Errors
```javascript
const { 
  BadRequestError, 
  NotFoundError,
  UnauthorizedError,
  ForbiddenError 
} = require('../helpers/customErrors');
```

---

## 📋 Error Types & Status Codes

| Error Type | Status | Usage |
|-----------|--------|-------|
| `BadRequestError` | 400 | Invalid input, validation errors |
| `UnauthorizedError` | 401 | Auth required, invalid token |
| `ForbiddenError` | 403 | No permission |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate, conflict |
| `ValidationError` | 400 | Data validation failed |
| `LoginError` | 401 | Wrong credentials |
| `PayloadTooLargeError` | 413 | Request too large |

---

## ✅ Usage Examples

### 1. Using Custom Error Classes (RECOMMENDED)
```javascript
// Validation
if (!email) {
  throw new BadRequestError('Email is required');
}

// Not Found
const user = await User.findByPk(id);
if (!user) {
  throw new NotFoundError('User not found');
}

// Unauthorized
if (!token) {
  throw new UnauthorizedError('Please login first');
}

// Forbidden
if (user.role !== 'admin') {
  throw new ForbiddenError('Admin access required');
}
```

### 2. Using Generic Error (Auto-Detected)
```javascript
// These auto-convert to correct status codes:
throw new Error('Email is required');        // → 400
throw new Error('User not found');           // → 404
throw new Error('Access forbidden');         // → 403
throw new Error('Token is invalid');         // → 400
throw new Error('Unauthorized access');      // → 401
```

### 3. Using Old Pattern (Still Supported)
```javascript
throw { name: 'BadRequest', message: 'Invalid input' };
throw { name: 'NotFound', message: 'Data not found' };
throw { name: 'Forbidden' };
```

---

## 🔍 Auto-Detection Keywords

ErrorHandler automatically detects status codes from error messages:

| Keywords in Message | Status Code |
|-------------------|-------------|
| "not found" | 404 |
| "required", "invalid", "must be", "cannot", "should" | 400 |
| "unauthorized", "unauthenticated" | 401 |
| "forbidden", "access denied" | 403 |

---

## 🎨 Response Format

All errors return consistent JSON:
```json
{
  "message": "Error description here"
}
```

---

## 📊 Common Patterns

### Validation
```javascript
if (!startDate || !endDate) {
  throw new BadRequestError('Start date and end date are required');
}

if (startDate > endDate) {
  throw new BadRequestError('Start date must be before end date');
}
```

### Database Lookup
```javascript
const resource = await Model.findByPk(id);
if (!resource) {
  throw new NotFoundError('Resource not found');
}
```

### Permission Check
```javascript
if (resource.userId !== req.user.id) {
  throw new ForbiddenError('You do not have permission to access this resource');
}
```

### Range Validation
```javascript
if (hours < 0.5 || hours > 12) {
  throw new BadRequestError('Hours must be between 0.5 and 12');
}
```

---

## ⚠️ Do's and Don'ts

### ✅ DO:
```javascript
// Use custom error classes
throw new BadRequestError('Clear message');

// Use generic errors (auto-detected)
throw new Error('User not found');

// Use in try-catch
try {
  // operation
} catch (error) {
  next(error); // Pass to errorHandler
}
```

### ❌ DON'T:
```javascript
// Don't use direct response (bypasses errorHandler)
return res.status(400).json({ message: 'Error' }); // ❌

// Don't throw strings
throw 'Error message'; // ❌

// Don't forget to use next() in async
catch (error) {
  console.log(error); // ❌ Silent fail
}
```

---

## 🧪 Test Your Errors

```bash
# Run error handler tests
npm test -- __test__/errorHandler.test.js

# Run all tests
npm test
```

---

## 🔗 See Also

- [ERROR_HANDLER_IMPROVEMENTS.md](./ERROR_HANDLER_IMPROVEMENTS.md) - Full documentation
- [API_ENDPOINTS_COMPLETE.md](./API_ENDPOINTS_COMPLETE.md) - API docs
- `helpers/customErrors.js` - Error class definitions
- `middlewares/errorHandler.js` - Error handler implementation

---

**Pro Tip:** Semua error di project ini sekarang ter-handle dengan benar. Gunakan custom error classes untuk consistency dan better developer experience! 🚀
