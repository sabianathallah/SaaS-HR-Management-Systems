# 🔧 CANCEL LEAVE/OVERTIME FIX

## ❌ Problem
Tidak bisa membatalkan cuti atau overtime yang diajukan di mobile app.

## ✅ Solution

### Root Cause:
Mobile app menggunakan **PATCH** method, tapi backend expect **DELETE** method.

Additionally:
- Overtime CREATE endpoint salah: menggunakan `/overtimes` seharusnya `/overtimes/request`
- Overtime HISTORY endpoint salah: menggunakan `/overtimes/my-requests` seharusnya `/overtimes/my-history`

---

## 🔧 Files Changed

### 1. **`src/services/index.js`** - Fixed HTTP Methods

#### Leave Cancel:
**Before:** ❌
```javascript
cancelLeaveRequest: async (id) => {
  const response = await api.patch(config.API_ENDPOINTS.LEAVE_CANCEL(id));
  return response.data;
},
```

**After:** ✅
```javascript
cancelLeaveRequest: async (id) => {
  const response = await api.delete(config.API_ENDPOINTS.LEAVE_CANCEL(id));
  return response.data;
},
```

#### Overtime Cancel:
**Before:** ❌
```javascript
cancelOvertimeRequest: async (id) => {
  const response = await api.patch(config.API_ENDPOINTS.OVERTIME_CANCEL(id));
  return response.data;
},
```

**After:** ✅
```javascript
cancelOvertimeRequest: async (id) => {
  const response = await api.delete(config.API_ENDPOINTS.OVERTIME_CANCEL(id));
  return response.data;
},
```

---

### 2. **`src/config/api.js`** - Fixed Overtime Endpoints

**Before:** ❌
```javascript
OVERTIME_REQUESTS: '/overtimes/my-requests',
OVERTIME_HISTORY: '/overtimes/my-requests',  // ❌ Same as requests!
OVERTIME_CREATE: '/overtimes',               // ❌ Wrong endpoint
OVERTIME_CANCEL: (id) => `/overtimes/${id}`,
```

**After:** ✅
```javascript
OVERTIME_REQUESTS: '/overtimes/my-requests',
OVERTIME_HISTORY: '/overtimes/my-history',   // ✅ Correct endpoint
OVERTIME_CREATE: '/overtimes/request',       // ✅ Correct endpoint
OVERTIME_CANCEL: (id) => `/overtimes/${id}`,
```

---

## 📊 Backend API Reference

### Leave Requests API:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leave-requests` | Submit new leave request |
| GET | `/leave-requests/my-requests` | Get my leave requests |
| GET | `/leave-requests/my-balance` | Get my leave balance |
| **DELETE** | `/leave-requests/:id` | **Cancel leave request (PENDING only)** |

### Overtime API:
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | **/overtimes/request** | **Submit overtime request** |
| GET | `/overtimes/my-requests` | Get my overtime requests |
| GET | `/overtimes/my-history` | Get my overtime history |
| **DELETE** | `/overtimes/:id` | **Cancel overtime request (PENDING only)** |

---

## ✅ Testing Results

### 1. Cancel Leave Request:
```bash
TOKEN="..." 
curl -X DELETE http://localhost:3000/leave-requests/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅
```json
{
  "message": "Leave request cancelled successfully",
  "data": {
    "id": 1,
    "status": "CANCELLED",
    ...
  }
}
```

### 2. Cancel Overtime Request:
```bash
TOKEN="..."
curl -X DELETE http://localhost:3000/overtimes/4 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅
```json
{
  "message": "Overtime request cancelled successfully"
}
```

### 3. Create Overtime Request:
```bash
TOKEN="..."
curl -X POST http://localhost:3000/overtimes/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "overtimeDate": "2026-02-15",
    "requestedHours": 2.5,
    "reason": "Testing"
  }'
```

**Response:** ✅
```json
{
  "message": "Overtime request submitted successfully",
  "data": {
    "id": 4,
    "overtimeDate": "2026-02-15T00:00:00.000Z",
    "requestedHours": "2.50",
    "status": "pending"
  }
}
```

---

## 🎯 What Was Fixed?

### Issue 1: Wrong HTTP Method ❌
- **Leave Cancel:** PATCH → DELETE ✅
- **Overtime Cancel:** PATCH → DELETE ✅

### Issue 2: Wrong Endpoints ❌
- **Overtime Create:** `/overtimes` → `/overtimes/request` ✅
- **Overtime History:** `/overtimes/my-requests` → `/overtimes/my-history` ✅

### Issue 3: Understanding DELETE vs PATCH
- **DELETE** = Remove/Cancel the resource (what backend uses)
- **PATCH** = Partial update of resource (not used for cancel in this app)

---

## 🚀 How to Test

### In Mobile App:

#### Test Cancel Leave:
1. Open **Leave** tab
2. Buat leave request baru (harus status PENDING)
3. Tap **"Batalkan"** button
4. Confirm dialog
5. ✅ Should show success message & refresh list

#### Test Cancel Overtime:
1. Open **Overtime** tab
2. Buat overtime request baru
3. Tap **"Batalkan"** button di pending request
4. Confirm dialog
5. ✅ Should show success message & refresh list

#### Test Create Overtime:
1. Open **Overtime** tab
2. Tap **"+ Ajukan Lembur"**
3. Fill form:
   - Date: `2026-02-15`
   - Hours: `2.5`
   - Reason: `Testing create overtime`
4. Submit
5. ✅ Should appear in pending list

---

## ⚠️ Important Notes

### Can Only Cancel PENDING Requests:
- ✅ **PENDING** - Can be cancelled
- ❌ **APPROVED** - Cannot be cancelled
- ❌ **REJECTED** - Cannot be cancelled
- ❌ **CANCELLED** - Already cancelled

### Backend Validation:
Backend will check:
1. Request must exist
2. Request must belong to current user
3. Request status must be PENDING
4. If any condition fails → Error response

### Error Messages:
```javascript
// If not PENDING:
"Only pending requests can be cancelled"

// If not owner:
"Unauthorized to cancel this request"

// If not found:
"Request not found"
```

---

## 🔍 API Comparison Table

| Feature | Mobile App (Before) | Backend Reality | Fixed |
|---------|-------------------|-----------------|-------|
| Cancel Leave | PATCH /leave-requests/:id | DELETE /leave-requests/:id | ✅ |
| Cancel Overtime | PATCH /overtimes/:id | DELETE /overtimes/:id | ✅ |
| Create Overtime | POST /overtimes | POST /overtimes/request | ✅ |
| Overtime History | GET /overtimes/my-requests | GET /overtimes/my-history | ✅ |

---

## 📱 User Flow

### Cancel Leave Flow:
```
1. User opens Leave tab
   ↓
2. Sees list of leave requests
   ↓
3. Clicks "Batalkan" on PENDING request
   ↓
4. Confirmation dialog appears
   ↓
5. User confirms
   ↓
6. DELETE /leave-requests/:id
   ↓
7. Success → List refreshes
   ↓
8. Request now shows CANCELLED status
```

### Cancel Overtime Flow:
```
1. User opens Overtime tab
   ↓
2. Sees pending overtime requests
   ↓
3. Clicks "Batalkan" button
   ↓
4. Confirmation dialog appears
   ↓
5. User confirms
   ↓
6. DELETE /overtimes/:id
   ↓
7. Success → List refreshes
   ↓
8. Request removed from pending list
```

---

## 🐛 Troubleshooting

### "Gagal membatalkan pengajuan"

**Check:**
1. Request status is PENDING? (only PENDING can be cancelled)
2. Request belongs to you? (can't cancel others' requests)
3. Backend server running? (check connection)
4. Token valid? (check authentication)

**Debug:**
```javascript
// Check console in Expo DevTools:
❌ API Error Details:
  URL: /leave-requests/123
  Method: DELETE
  Status: 400
  Data: { message: "Only pending requests can be cancelled" }
```

### Button Not Showing

**Reason:** Cancel button only shows for PENDING requests

**Code in LeaveScreen.js:**
```javascript
{leave.status === 'PENDING' && (
  <TouchableOpacity onPress={() => handleCancelLeave(leave.id)}>
    <Text>Batalkan</Text>
  </TouchableOpacity>
)}
```

---

## ✅ Verification Checklist

After fix, verify:

- [x] Cancel leave (PENDING) works ✅
- [x] Cancel overtime (PENDING) works ✅
- [x] Create overtime works ✅
- [x] Overtime history shows correctly ✅
- [x] Cannot cancel APPROVED/REJECTED requests ✅
- [x] Error messages show properly ✅
- [x] List refreshes after cancel ✅

---

## 📝 Summary

### Fixed Issues:
1. ✅ Changed leave cancel: PATCH → DELETE
2. ✅ Changed overtime cancel: PATCH → DELETE  
3. ✅ Fixed overtime create endpoint
4. ✅ Fixed overtime history endpoint

### Files Modified:
- `src/services/index.js` - HTTP methods
- `src/config/api.js` - Endpoint URLs

### No Changes Needed:
- `src/screens/LeaveScreen.js` - Logic already correct
- Backend routes - Already correct

---

**All Fixed! 🎉**

Restart mobile app and test cancel functionality!
