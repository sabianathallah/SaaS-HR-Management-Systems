# Quick Debug Guide - Leave & Overtime Request

## 🔍 Quick Troubleshooting Steps:

### Step 1: Open Browser Console
```
Press F12 → Go to Console Tab
```

### Step 2: Clear Console
```
Click 🚫 or press Ctrl+L to clear old logs
```

### Step 3: Test Request

---

## 📋 Leave Request Debug Checklist:

### ✅ Before Submit:
- [ ] Form fields filled correctly
- [ ] Tanggal mulai < Tanggal selesai
- [ ] Alasan tidak kosong
- [ ] Token exists in localStorage

### ✅ Submit Click:
```javascript
// Expected Console Log:
Submitting leave request: {
  leaveType: "ANNUAL_LEAVE",
  startDate: "2026-01-15",
  endDate: "2026-01-17",
  reason: "butuh istirahat" // ✅ Should be trimmed
}
```

### ✅ Success Response:
- [ ] Toast: "Pengajuan cuti berhasil dikirim!"
- [ ] Form closed
- [ ] History refreshed

### ❌ Error Response:
```javascript
// Console will show:
Error submitting leave: AxiosError {...}
Error response: {
  message: "..." // ← Read this message
}
```

**Common Errors:**
| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Insufficient leave quota" | Kuota cuti tidak cukup | Kurangi jumlah hari |
| "All fields are required" | Ada field kosong | Isi semua field |
| "End date must be after..." | Tanggal salah | Perbaiki tanggal |
| "Overlapping request" | Sudah ada cuti di tanggal tsb | Pilih tanggal lain |

---

## ⏰ Overtime Request Debug Checklist:

### ✅ Before Submit:
- [ ] Tanggal overtime diisi
- [ ] Jam overtime: 0.5 - 12
- [ ] Alasan tidak kosong (min 10 char)
- [ ] Token exists in localStorage

### ✅ Submit Click:
```javascript
// Expected Console Log:
Submitting overtime request: {
  overtimeDate: "2026-01-15",
  requestedHours: 2.5, // ✅ Should be number, not string
  reason: "urgent project" // ✅ Should be trimmed
}
```

### ✅ Success Response:
- [ ] Toast: "Pengajuan overtime berhasil dikirim!"
- [ ] Form closed
- [ ] History refreshed

### ❌ Error Response:
```javascript
// Console will show:
Error submitting overtime: AxiosError {...}
Error response: {
  message: "..." // ← Read this message
}
```

**Common Errors:**
| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Requested hours must be between 0.5 and 12" | Jam diluar range | Gunakan 0.5 - 12 |
| "All fields are required" | Ada field kosong | Isi semua field |
| "Overtime request already exists" | Sudah ada overtime di tanggal tsb | Pilih tanggal lain |
| "Attendance record not found" | Belum absen di tanggal tsb | Absen dulu |

---

## 🎯 Data Type Validation:

### Leave Request Payload:
```javascript
{
  leaveType: "string",        // ✅ "ANNUAL_LEAVE" | "SICK_LEAVE" | "PERMISSION"
  startDate: "string",        // ✅ "YYYY-MM-DD"
  endDate: "string",          // ✅ "YYYY-MM-DD"
  reason: "string (trimmed)"  // ✅ No leading/trailing whitespace
}
```

### Overtime Request Payload:
```javascript
{
  overtimeDate: "string",     // ✅ "YYYY-MM-DD"
  requestedHours: number,     // ✅ 0.5 - 12 (NUMBER, not string!)
  reason: "string (trimmed)"  // ✅ No leading/trailing whitespace
}
```

---

## 🚨 Common Issues & Fixes:

### Issue 1: "Request failed with status code 400"
```
Possible Causes:
1. Field kosong atau undefined
2. Format data salah (string vs number)
3. Validasi backend gagal

Debug Steps:
1. Check console log "Submitting ..."
2. Verify all fields have values
3. Check data types (requestedHours = number?)
4. Read error response message
```

### Issue 2: "Request failed with status code 401"
```
Cause: Token expired atau tidak ada

Fix:
1. Check localStorage for 'access_token'
2. If no token → Login again
3. If token exists → might be expired, logout and login
```

### Issue 3: Form submit tapi tidak ada response
```
Debug Steps:
1. Check network tab (F12 → Network)
2. Look for POST request to /leave-requests or /overtimes/request
3. Check request payload
4. Check response status & body
```

### Issue 4: Validation error muncul tapi data sudah benar
```
Possible Causes:
1. Whitespace di reason (should be trimmed now)
2. Date format salah
3. requestedHours as string (should be number now)

Fix: Already fixed in code with:
- reason.trim()
- parseFloat(requestedHours)
```

---

## 🔧 Manual Debug Commands:

### Check Token:
```javascript
// Run in Console:
localStorage.getItem('access_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Check baseUrl:
```javascript
// In EmployeePage.jsx, baseUrl is imported from:
// '../constant/url.js'
// Should be: "http://localhost:3000"
```

### Test Leave Payload:
```javascript
// Example payload:
const payload = {
  leaveType: "ANNUAL_LEAVE",
  startDate: "2026-01-15",
  endDate: "2026-01-17",
  reason: "butuh istirahat".trim()
}
console.log(payload)
```

### Test Overtime Payload:
```javascript
// Example payload:
const payload = {
  overtimeDate: "2026-01-15",
  requestedHours: parseFloat("2.5"), // Should be 2.5 (number)
  reason: "urgent project".trim()
}
console.log(payload)
console.log(typeof payload.requestedHours) // Should log: "number"
```

---

## 📊 Network Tab Debugging:

### How to Check Request:

1. **Open Network Tab** (F12 → Network)
2. **Clear network log** (🚫 icon)
3. **Submit form**
4. **Look for request:**
   - Leave: `POST /leave-requests`
   - Overtime: `POST /overtimes/request`

### Check Request Headers:
```
Authorization: Bearer eyJhbGciOiJI... ← Should exist
Content-Type: application/json ← Should be JSON
```

### Check Request Payload:
```json
// Leave Request:
{
  "leaveType": "ANNUAL_LEAVE",
  "startDate": "2026-01-15",
  "endDate": "2026-01-17",
  "reason": "butuh istirahat"
}

// Overtime Request:
{
  "overtimeDate": "2026-01-15",
  "requestedHours": 2.5,
  "reason": "urgent project"
}
```

### Check Response:
```json
// Success (200):
{
  "message": "Leave request submitted successfully",
  "data": { ... }
}

// Error (400):
{
  "message": "Insufficient leave quota. You have 5 days remaining..."
}
```

---

## ✅ Verification Checklist:

### Leave Request Working:
- [ ] Console log shows: "Submitting leave request: {...}"
- [ ] Payload has trimmed reason
- [ ] Network shows POST to /leave-requests
- [ ] Status 201 Created
- [ ] Toast success appears
- [ ] Form closes
- [ ] History updates

### Overtime Request Working:
- [ ] Console log shows: "Submitting overtime request: {...}"
- [ ] requestedHours is number type
- [ ] Payload has trimmed reason
- [ ] Network shows POST to /overtimes/request
- [ ] Status 201 Created
- [ ] Toast success appears
- [ ] Form closes
- [ ] History updates

---

## 🎯 Quick Fix Reference:

| Problem | Quick Fix |
|---------|-----------|
| requestedHours as string | ✅ Already fixed: `parseFloat()` |
| reason with whitespace | ✅ Already fixed: `.trim()` |
| No console logs | ✅ Already fixed: Added logs |
| No error details | ✅ Already fixed: Log response |
| 400 Bad Request | Check console "Error response" |
| 401 Unauthorized | Re-login (token expired) |
| Form not submitting | Check validations in console |

---

## 🚀 Testing Commands:

### Test in Browser Console:

```javascript
// 1. Check if form data is correct:
console.log('Leave Form:', {
  leaveType: document.querySelector('select').value,
  startDate: document.querySelectorAll('input[type="date"]')[0].value,
  endDate: document.querySelectorAll('input[type="date"]')[1].value,
  reason: document.querySelector('textarea').value
})

// 2. Check token:
console.log('Token:', localStorage.getItem('access_token'))

// 3. Check baseUrl (can't directly, but can infer from network requests)
```

---

## 📞 If Still Not Working:

### Check These:

1. **Backend Running?**
   ```bash
   # Should see:
   Server running on port 3000
   ```

2. **Database Connected?**
   ```bash
   # Check server logs for:
   Executing (default): SELECT ...
   ```

3. **CORS Enabled?**
   ```javascript
   // Backend should have:
   app.use(cors())
   ```

4. **Route Exists?**
   ```javascript
   // Backend routes should have:
   POST /leave-requests
   POST /overtimes/request
   ```

---

## 🎉 Success Indicators:

### Leave Request Success:
```
✅ Console: "Submitting leave request: {...}"
✅ Network: POST /leave-requests → 201
✅ Toast: "Pengajuan cuti berhasil dikirim!"
✅ Form closed automatically
✅ History shows new request
```

### Overtime Request Success:
```
✅ Console: "Submitting overtime request: {...}"
✅ Network: POST /overtimes/request → 201
✅ Toast: "Pengajuan overtime berhasil dikirim!"
✅ Form closed automatically
✅ History shows new request
```

**If you see all ✅ above, it's working perfectly!** 🚀
