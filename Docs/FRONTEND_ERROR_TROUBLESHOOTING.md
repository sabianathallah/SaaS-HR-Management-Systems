# 🧪 Frontend Error Troubleshooting Guide

## ✅ Current Status:
- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:5174
- ✅ No compilation errors in code

---

## 🔍 Common Errors & Solutions:

### 1. **"Cannot GET /admin/payroll/periods"** (404 Error)
**Cause:** Routes not properly registered or component not found

**Check:**
```bash
# Verify files exist:
ls -la client_Salmon-HRIS/src/views/Payroll*.jsx
ls -la client_Salmon-HRIS/src/views/MyPayslips.jsx
```

**Solution:** Files already created ✅

---

### 2. **"axiosInstance is not defined"** (Import Error)
**Cause:** Missing axios config import

**Check in each component:**
```javascript
import axiosInstance from '../config/axios';
```

**Verify axios.js exists:**
```bash
ls -la client_Salmon-HRIS/src/config/axios.js
```

**Solution:** File created ✅

---

### 3. **"Network Error" or "404 Not Found"** (API Calls)
**Cause:** 
- Backend not running
- Wrong API endpoint
- CORS issue

**Test API manually:**
```bash
# Test if backend is accessible
curl http://localhost:3000/api/payroll/my-payslips \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 401 or valid response (not connection refused)
```

**Check baseURL:**
```javascript
// src/constant/url.js should have:
const baseUrl = "http://localhost:3000"

// src/config/axios.js should have:
baseURL: `${baseUrl}/api`
```

---

### 4. **"Unexpected token '<'"** (HTML instead of JSON)
**Cause:** Backend returning error page instead of JSON

**Check:**
- Backend logs for errors
- Route exists in `server/routes/index.js`

**Verify routes registered:**
```bash
# Check server/routes/index.js contains:
grep "payroll" server/routes/index.js
grep "payrollSettings" server/routes/index.js
grep "webhook" server/routes/index.js
```

---

### 5. **"Module not found: date-fns"**
**Cause:** Missing dependency

**Solution:**
```bash
cd client_Salmon-HRIS
npm install date-fns
```

---

### 6. **"useNavigate() may be used only in context of <Router>"**
**Cause:** Component used outside BrowserRouter

**Check App.jsx:**
- All routes wrapped in <BrowserRouter>
- Components imported correctly

---

### 7. **"Cannot read property 'map' of undefined"**
**Cause:** API response structure different from expected

**Debug:**
```javascript
// In component, add console.log:
const fetchPayslips = async () => {
  const response = await axiosInstance.get('/payroll/my-payslips');
  console.log('API Response:', response.data); // Check structure
  setPayslips(response.data.data || []); // Handle if data is null
};
```

---

## 🧪 Manual Testing Steps:

### Test 1: Access Admin Payroll Page
1. Open browser: http://localhost:5174
2. Login as admin
3. Click "💰 Payroll" in sidebar
4. Should show PayrollPeriodList component

**Expected:** Empty list with "Create Period" button

**If Error:** 
- Check browser console (F12)
- Check network tab for API calls
- Copy error message

---

### Test 2: Create Period
1. Click "Create Period"
2. Fill form
3. Submit

**Expected:** Success message, period appears in list

**If Error:**
- Check network tab for POST request
- Check backend logs
- Verify migration ran: `npx sequelize-cli db:migrate:status`

---

### Test 3: Employee Payslips
1. Logout from admin
2. Login as employee (if exists)
3. Navigate to: http://localhost:5174/payroll/my-payslips

**Expected:** Empty list with message "No payslips available yet"

**If Error:**
- Check if route exists in App.jsx
- Check ProtectedRoute allows EMPLOYEE role

---

## 🐛 Debug Commands:

### Check File Exists:
```bash
ls -la client_Salmon-HRIS/src/views/Payroll*.jsx
ls -la client_Salmon-HRIS/src/views/MyPayslips.jsx
ls -la client_Salmon-HRIS/src/views/PayslipDetail.jsx
ls -la client_Salmon-HRIS/src/config/axios.js
```

### Check Routes in App.jsx:
```bash
grep -A 5 "payroll" client_Salmon-HRIS/src/App.jsx
```

### Check Backend Routes:
```bash
grep -A 5 "payroll" server/routes/index.js
```

### Check Database Tables:
```bash
cd server
npx sequelize-cli db:migrate:status
# Should show all payroll migrations as "up"
```

### Check Seeded Data:
```bash
psql -d your_database -c "SELECT * FROM \"PayrollComponents\" LIMIT 5;"
psql -d your_database -c "SELECT * FROM \"TaxSettings\" LIMIT 5;"
psql -d your_database -c "SELECT * FROM \"BPJSSettings\";"
```

---

## 📋 Checklist Before Reporting Error:

- [ ] Backend server running (http://localhost:3000)
- [ ] Frontend server running (http://localhost:5174)
- [ ] No compilation errors in terminal
- [ ] Database migrations executed
- [ ] Seeders executed
- [ ] Browser console checked (F12)
- [ ] Network tab checked for failed requests
- [ ] Backend logs checked for errors

---

## 🔧 Quick Fixes:

### Fix 1: Restart Everything
```bash
# Kill all
pkill -f node

# Restart backend
cd server && npm start &

# Restart frontend
cd ../client_Salmon-HRIS && npm run dev
```

### Fix 2: Clear Cache
```bash
# Clear frontend cache
cd client_Salmon-HRIS
rm -rf node_modules/.vite
npm run dev
```

### Fix 3: Reinstall Dependencies
```bash
cd client_Salmon-HRIS
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 What to Share for Help:

1. **Error Message** (screenshot or copy-paste)
2. **Browser Console Logs** (F12 → Console tab)
3. **Network Request Details** (F12 → Network tab, click failed request)
4. **Backend Terminal Output** (any error logs)
5. **Which page/action caused the error**

---

## 🎯 Expected Behavior:

### PayrollPeriodList Page:
- Shows table with columns: Period, Dates, Status, Actions
- "Create Period" button opens dialog
- Empty state shows message

### PayrollPeriodDetail Page:
- Shows period summary
- Shows employee payrolls table
- Action buttons based on status

### MyPayslips Page:
- Shows summary cards (Latest Salary, YTD Earnings, etc.)
- Shows payslip history
- Download button for paid payslips

### PayslipDetail Page:
- Shows employee info
- Shows earnings/deductions breakdown
- Shows net salary
- Print & Download buttons

---

**Please share the specific error message you're seeing, and I'll help fix it! 🔧**
