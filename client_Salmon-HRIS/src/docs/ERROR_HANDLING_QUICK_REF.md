# Error Handling Quick Reference

## 🎯 Quick Guide - Error Messages in Browser

**All backend error messages now display as toast notifications!**

---

## 📋 Common Error Messages You'll See:

### Overtime Request:
```
🔴 Overtime date, requested hours, and reason are required
🔴 Requested hours must be between 0.5 and 12 hours
🔴 Reason must be at least 10 characters ← Your case!
🔴 Overtime request already exists for this date
🔴 Attendance record not found or doesn't belong to you
```

### Leave Request:
```
🔴 All fields are required: leaveType, startDate, endDate, reason
🔴 Invalid leave type. Valid types: ANNUAL_LEAVE, SICK_LEAVE, PERMISSION
🔴 End date must be after or equal to start date
🔴 Insufficient leave quota. You have X days remaining, but requested Y days
🔴 You already have a leave request for this date range
```

### Attendance:
```
🔴 Already clocked in today
🔴 No clock-in record found for today
🔴 Photo is required for attendance
🔴 GPS location is required
🔴 You are outside the allowed office area
```

### Profile/Password:
```
🔴 Old password is incorrect
🔴 Password must be at least 6 characters
🔴 New password and confirmation do not match
🔴 Name is required
```

---

## 🔧 How It Works:

### Backend sends error:
```json
{
  "message": "Reason must be at least 10 characters"
}
```

### Frontend catches and displays:
```javascript
handleApiError(error, 'Gagal mengajukan overtime')
```

### User sees in browser:
```
🔴 Toast: "Reason must be at least 10 characters"
```

### Developer sees in console:
```
API Error: AxiosError {...}
Error response: {message: "Reason must be at least 10 characters"}
```

---

## ✅ What This Solves:

### Before:
- ❌ User: "Why did it fail?" (No clear message)
- ❌ Generic: "Gagal mengajukan overtime"
- ❌ No indication of what to fix

### After:
- ✅ User: "Oh, reason too short!" (Clear message)
- ✅ Specific: "Reason must be at least 10 characters"
- ✅ Knows exactly what to fix

---

## 🧪 Test It:

### Test 1: Overtime with Short Reason
```
1. Go to "Cuti & Izin" tab
2. Fill overtime form:
   - Date: Any date
   - Hours: 2
   - Reason: "urgent" (6 chars)
3. Submit
4. See toast: "Reason must be at least 10 characters" ✅
```

### Test 2: Leave Request Quota
```
1. Request leave for 20 days (when you only have 10)
2. Submit
3. See toast: "Insufficient leave quota. You have 10 days..." ✅
```

### Test 3: Clock-In Twice
```
1. Clock in successfully
2. Try to clock in again
3. See toast: "Already clocked in today" ✅
```

---

## 📊 Error Handling Coverage:

| Feature | Error Messages | Status |
|---------|---------------|--------|
| **Overtime** | 5+ error types | ✅ All handled |
| **Leave** | 6+ error types | ✅ All handled |
| **Attendance** | 5+ error types | ✅ All handled |
| **Profile** | 4+ error types | ✅ All handled |
| **Auth** | 3+ error types | ✅ All handled |

---

## 🎯 Key Benefits:

1. ✅ **Clear Feedback** - User knows exactly what's wrong
2. ✅ **Better UX** - No more confusion about failures
3. ✅ **Easy Debugging** - Console shows full error details
4. ✅ **Consistent** - All errors handled the same way
5. ✅ **Informative** - Backend validation messages shown directly

---

## 🚀 Usage:

**No manual intervention needed!**

All API errors are automatically:
- Extracted from backend response
- Formatted for user readability
- Displayed as toast notification
- Logged to console for debugging

**Just use the app normally, and you'll see helpful error messages when something goes wrong!**

---

## 💡 Pro Tip:

Keep browser console open (F12) during development to see:
- Full error stack traces
- API request/response details
- Exact error objects
- Network information

This helps both users (via toast) and developers (via console)!

---

## ✅ Status: FULLY IMPLEMENTED

**All 400 Bad Request errors and other API errors now show clear messages in the browser!** 🎉
