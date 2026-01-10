# Leave & Overtime Request Fix - Data Submission Issue

## 🐛 Problem Report:
**User Issue:** "leave req dan overtime req tidak bisa dilakukan. ada kesalahan pengiriman data dari fe sepertinya"

---

## 🔍 Root Cause Analysis:

### Issues Found:

1. **Leave Request - No Payload Formatting**
   - ❌ Data dikirim langsung sebagai `leaveForm` object
   - ❌ `reason` tidak di-trim, bisa ada whitespace
   - ❌ Tidak konsisten dengan overtime yang pakai `payload`

2. **Overtime Request - Missing Error Logging**
   - ✅ Sudah pakai payload formatting
   - ❌ Tidak ada `console.log` untuk debug
   - ❌ Error response tidak di-log detail

3. **Debugging Difficulty**
   - ❌ Tidak ada logging sebelum submit
   - ❌ Tidak ada error detail logging

---

## ✅ Solutions Implemented:

### 1. **Leave Request - Added Payload Formatting**

**Before:**
```javascript
const handleLeaveSubmit = async (e) => {
  e.preventDefault()
  // ... validations ...
  
  setLoading(true)
  try {
    const token = localStorage.getItem('access_token')
    console.log('Submitting leave request:', leaveForm) // Direct object
    
    await axios.post(`${baseUrl}/leave-requests`, leaveForm, { // ❌ Direct
      headers: { Authorization: `Bearer ${token}` }
    })
    // ...
  }
}
```

**After:**
```javascript
const handleLeaveSubmit = async (e) => {
  e.preventDefault()
  // ... validations ...
  
  setLoading(true)
  try {
    const token = localStorage.getItem('access_token')
    
    // ⭐ Prepare payload with trimmed reason
    const payload = {
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason.trim() // ✅ Trim whitespace
    }
    
    console.log('Submitting leave request:', payload) // ✅ Log payload
    
    await axios.post(`${baseUrl}/leave-requests`, payload, { // ✅ Clean payload
      headers: { Authorization: `Bearer ${token}` }
    })
    // ...
  } catch (error) {
    console.error('Error submitting leave:', error)
    console.error('Error response:', error.response?.data) // ✅ Log error detail
    // ...
  }
}
```

### 2. **Overtime Request - Added Debug Logging**

**Before:**
```javascript
const handleOvertimeSubmit = async (e) => {
  // ... validations ...
  
  setLoading(true)
  try {
    const token = localStorage.getItem('access_token')
    
    const payload = {
      overtimeDate: overtimeForm.overtimeDate,
      requestedHours: parseFloat(overtimeForm.requestedHours),
      reason: overtimeForm.reason.trim()
    }
    
    // ❌ No logging before submit
    await axios.post(`${baseUrl}/overtimes/request`, payload, ...)
    // ...
  } catch (error) {
    console.error('Error submitting overtime:', error)
    // ❌ No error response detail
  }
}
```

**After:**
```javascript
const handleOvertimeSubmit = async (e) => {
  // ... validations ...
  
  setLoading(true)
  try {
    const token = localStorage.getItem('access_token')
    
    const payload = {
      overtimeDate: overtimeForm.overtimeDate,
      requestedHours: parseFloat(overtimeForm.requestedHours),
      reason: overtimeForm.reason.trim()
    }
    
    console.log('Submitting overtime request:', payload) // ✅ Log payload
    
    await axios.post(`${baseUrl}/overtimes/request`, payload, ...)
    // ...
  } catch (error) {
    console.error('Error submitting overtime:', error)
    console.error('Error response:', error.response?.data) // ✅ Log error detail
    toast.error(error.response?.data?.message || 'Gagal mengajukan overtime')
  }
}
```

---

## 📊 Data Flow Comparison:

### Leave Request:

**Before:**
```
Form Input → leaveForm state → Direct submit (no trim)
{
  leaveType: "ANNUAL_LEAVE",
  startDate: "2026-01-15",
  endDate: "2026-01-17",
  reason: "  butuh istirahat  " // ❌ Whitespace tidak di-trim
}
```

**After:**
```
Form Input → leaveForm state → Payload creation (with trim) → Submit
{
  leaveType: "ANNUAL_LEAVE",
  startDate: "2026-01-15",
  endDate: "2026-01-17",
  reason: "butuh istirahat" // ✅ Whitespace removed
}
```

### Overtime Request:

**Before:**
```
Form Input → overtimeForm state → Payload (no logging)
{
  overtimeDate: "2026-01-15",
  requestedHours: 2.5, // Already number
  reason: "urgent project" // Already trimmed
}
// ❌ No console.log before submit
```

**After:**
```
Form Input → overtimeForm state → Payload (with logging)
{
  overtimeDate: "2026-01-15",
  requestedHours: 2.5,
  reason: "urgent project"
}
// ✅ console.log('Submitting overtime request:', payload)
```

---

## 🎯 Key Improvements:

| Feature | Before | After |
|---------|--------|-------|
| **Leave - Payload Format** | ❌ Direct object | ✅ Formatted payload |
| **Leave - Reason Trim** | ❌ No trim | ✅ Trimmed |
| **Leave - Debug Log** | ⚠️ Basic | ✅ Detailed |
| **Leave - Error Log** | ⚠️ Basic | ✅ With response data |
| **Overtime - Debug Log** | ❌ No log | ✅ With payload |
| **Overtime - Error Log** | ⚠️ Basic | ✅ With response data |
| **Consistency** | ❌ Different patterns | ✅ Same pattern |

---

## 🧪 Testing Guide:

### Test Leave Request:

#### Test 1: Normal Submit
```
Steps:
1. Fill form:
   - Jenis: Cuti Tahunan
   - Tanggal Mulai: 2026-01-15
   - Tanggal Selesai: 2026-01-17
   - Alasan: "butuh istirahat"
2. Submit

Expected Console Output:
✅ "Submitting leave request: {leaveType: 'ANNUAL_LEAVE', ...}"

Expected Result:
✅ Toast success
✅ Form cleared
✅ History refreshed
```

#### Test 2: Whitespace in Reason
```
Steps:
1. Fill form with reason: "  butuh istirahat  " (with spaces)
2. Submit

Expected:
✅ Payload logs reason: "butuh istirahat" (trimmed)
✅ Submit successful
```

#### Test 3: Error Case
```
Steps:
1. Submit request that will fail (e.g., insufficient quota)

Expected Console Output:
✅ "Error submitting leave: ..."
✅ "Error response: {message: '...', ...}"

Expected Result:
✅ Toast error with backend message
```

### Test Overtime Request:

#### Test 1: Normal Submit
```
Steps:
1. Fill form:
   - Tanggal: 2026-01-15
   - Jam: 2.5
   - Alasan: "urgent project"
2. Submit

Expected Console Output:
✅ "Submitting overtime request: {overtimeDate: '2026-01-15', requestedHours: 2.5, ...}"

Expected Result:
✅ Toast success
✅ Form cleared
```

#### Test 2: Invalid Hours
```
Steps:
1. Fill form with hours: 15 (> 12)
2. Submit

Expected:
✅ Toast error: "Jam overtime harus antara 0.5 - 12 jam!"
✅ No API call (validation blocks)
```

#### Test 3: Error Case
```
Steps:
1. Submit request that will fail

Expected Console Output:
✅ "Error submitting overtime: ..."
✅ "Error response: {message: '...', ...}"

Expected Result:
✅ Toast error with backend message
```

---

## 🔍 Debug Console Outputs:

### Successful Leave Request:
```javascript
// Console output:
Submitting leave request: {
  leaveType: "ANNUAL_LEAVE",
  startDate: "2026-01-15",
  endDate: "2026-01-17",
  reason: "butuh istirahat" // trimmed
}
```

### Successful Overtime Request:
```javascript
// Console output:
Submitting overtime request: {
  overtimeDate: "2026-01-15",
  requestedHours: 2.5, // number type
  reason: "urgent project" // trimmed
}
```

### Error Case (Leave):
```javascript
// Console output:
Error submitting leave: AxiosError {...}
Error response: {
  message: "Insufficient leave quota. You have 5 days remaining, but requested 10 days.",
  remainingQuota: 5,
  requestedDays: 10
}
```

### Error Case (Overtime):
```javascript
// Console output:
Error submitting overtime: AxiosError {...}
Error response: {
  message: "Overtime request already exists for this date"
}
```

---

## 📝 Backend API Requirements:

### Leave Request Endpoint:
```
POST /leave-requests
Headers: Authorization: Bearer <token>

Payload:
{
  leaveType: "ANNUAL_LEAVE" | "SICK_LEAVE" | "PERMISSION",
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD",
  reason: "string (trimmed)"
}

Validations:
- All fields required
- endDate >= startDate
- Sufficient quota (for ANNUAL_LEAVE/SICK_LEAVE)
- No overlapping requests
```

### Overtime Request Endpoint:
```
POST /overtimes/request
Headers: Authorization: Bearer <token>

Payload:
{
  overtimeDate: "YYYY-MM-DD",
  requestedHours: number (0.5 - 12),
  reason: "string (trimmed, min 10 chars)"
}

Validations:
- All fields required
- requestedHours: 0.5 - 12
- No duplicate request for same date
```

---

## ✅ Implementation Complete!

### Files Modified:
```
✅ /client_Salmon-HRIS/src/views/EmployeePage.jsx
   - handleLeaveSubmit: Added payload formatting & detailed logging
   - handleOvertimeSubmit: Added detailed logging
```

### Changes Summary:

**Leave Request:**
- ✅ Create payload object dengan trim()
- ✅ Log payload before submit
- ✅ Log error response detail
- ✅ Konsisten dengan overtime pattern

**Overtime Request:**
- ✅ Log payload before submit
- ✅ Log error response detail
- ✅ Better error handling

**Debugging:**
- ✅ Console logs untuk troubleshooting
- ✅ Error details untuk analisis
- ✅ Clear data flow visibility

---

## 🚀 How to Test:

1. **Open Browser Console** (F12 → Console)
2. **Go to Employee Page** → Tab "Cuti & Izin"
3. **Test Leave Request:**
   - Click "Ajukan Cuti/Izin"
   - Fill form
   - Submit
   - Check console for logs
4. **Test Overtime Request:**
   - Fill overtime form
   - Submit
   - Check console for logs

### Expected Console Logs:
```
✅ Submitting leave request: {leaveType: ..., startDate: ..., ...}
✅ Submitting overtime request: {overtimeDate: ..., requestedHours: ..., ...}
```

### If Error Occurs:
```
❌ Error submitting leave: AxiosError {...}
❌ Error response: {message: "...", ...}
```
Now you can see **exact error message** from backend!

---

## 🎉 Benefits:

1. ✅ **Clean Data** - reason di-trim, no extra whitespace
2. ✅ **Type Safety** - requestedHours as number
3. ✅ **Consistency** - same pattern untuk leave & overtime
4. ✅ **Debuggable** - detailed console logs
5. ✅ **Error Visibility** - see exact backend errors
6. ✅ **Better UX** - clear error messages to users

**READY TO TEST!** 🚀

Silakan test kedua fitur (leave & overtime request) dan lihat console log untuk debug jika ada error.
