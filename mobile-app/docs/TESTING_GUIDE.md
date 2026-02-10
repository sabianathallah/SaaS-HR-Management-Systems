# 🧪 Testing Guide - Network Auto Configuration

## 🎯 Test Scenarios

### Scenario 1: Development dengan Tunnel Mode

**Steps:**
```bash
cd mobile-app
npm run start:tunnel
```

**Expected:**
- QR code muncul
- Console show: `🔧 API_BASE_URL: http://...`
- Scan dengan Expo Go
- App connect tanpa error

**Verify:**
- Login berhasil
- API calls berhasil
- Tidak ada "Network Error"

---

### Scenario 2: Ganti WiFi Test

**Initial Setup:**
```bash
# WiFi A
npm run start:tunnel
# Login sukses
```

**Ganti WiFi:**
```bash
# Disconnect WiFi A
# Connect ke WiFi B
# Buka app lagi
```

**Expected:**
- ✅ App masih jalan
- ✅ API masih connect
- ✅ Tidak perlu restart
- ✅ Tidak perlu konfigurasi

---

### Scenario 3: Platform Specific

#### iOS Simulator
```bash
npm run start
# Press 'i'
```

**Expected console log:**
```
📱 iOS Simulator detected
🔧 API_BASE_URL: http://localhost:3000
```

#### Android Emulator
```bash
npm run start
# Press 'a'
```

**Expected console log:**
```
🤖 Android Emulator detected
🔧 API_BASE_URL: http://10.0.2.2:3000
```

#### Physical Device
```bash
npm run start:tunnel
# Scan QR
```

**Expected console log:**
```
📡 Physical device - auto-detected from Expo
🔧 API_BASE_URL: http://192.168.x.x:3000
```

---

### Scenario 4: Custom URL (ngrok)

**Setup:**
1. Start ngrok:
```bash
cd server
npm start
# In another terminal:
ngrok http 3000
```

2. Edit `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://abc123.ngrok.io"
    }
  }
}
```

3. Start app:
```bash
npm run start:clear
```

**Expected console log:**
```
📍 Using custom API URL from app.json
🔧 API_BASE_URL: https://abc123.ngrok.io
🔧 Custom URL: https://abc123.ngrok.io
```

---

## 🔍 Debugging Tests

### Test 1: Check API Configuration

**File:** `src/config/api.js`

Add temporary log in your component:
```javascript
import config from './config/api';

console.log('Current API URL:', config.API_BASE_URL);
```

**Run:**
```bash
npm run start:tunnel
```

**Check console output**

---

### Test 2: Test API Connection

**Add in `App.js`:**
```javascript
useEffect(() => {
  const testConnection = async () => {
    try {
      const response = await fetch(config.API_BASE_URL + '/api/profile', {
        headers: { 'Authorization': 'Bearer test' }
      });
      console.log('API Test:', response.status);
    } catch (error) {
      console.log('API Error:', error.message);
    }
  };
  testConnection();
}, []);
```

---

### Test 3: Network Change Simulation

**Steps:**
1. Connect WiFi A
2. Start app dengan tunnel
3. Login
4. Disconnect WiFi A
5. Connect WiFi B
6. Refresh app
7. Check masih bisa API call

---

## 📊 Test Checklist

### Basic Functionality
- [ ] App starts without errors
- [ ] API URL auto-detected correctly
- [ ] Login successful
- [ ] Dashboard loads
- [ ] Attendance works
- [ ] Leave requests work
- [ ] Notifications work

### Platform Testing
- [ ] iOS Simulator uses localhost
- [ ] Android Emulator uses 10.0.2.2
- [ ] Physical device auto-detects IP
- [ ] Tunnel mode works
- [ ] LAN mode works

### Network Scenarios
- [ ] Works on WiFi A
- [ ] Works on WiFi B (after switch)
- [ ] Works on mobile data (with tunnel)
- [ ] Works in different locations
- [ ] No manual config needed

### Error Handling
- [ ] Backend offline shows error
- [ ] Network error shows proper message
- [ ] Invalid token redirects to login
- [ ] Retry mechanism works

---

## 🐛 Common Issues & Solutions

### Issue: "Network Error" on start

**Debug:**
```bash
# Check backend
curl http://localhost:3000

# Check Expo
npm run start:clear
```

**Solution:**
```bash
# Use tunnel
npm run start:tunnel
```

---

### Issue: API URL shows "undefined"

**Debug:**
```javascript
// Add in api.js
console.log('Constants:', Constants.expoConfig);
console.log('Platform:', Platform.OS);
```

**Solution:**
```bash
# Clear cache
npm run start:clear
```

---

### Issue: Tunnel mode slow

**Debug:**
```bash
# Check internet speed
# Check Expo status
```

**Solution:**
```bash
# Use LAN mode instead
npm run start:lan
```

---

## 📈 Performance Testing

### Measure API Response Time

**Add in service:**
```javascript
const startTime = Date.now();
const response = await api.get(endpoint);
console.log('API Time:', Date.now() - startTime, 'ms');
```

**Compare:**
- Tunnel mode: ~500-1000ms
- LAN mode: ~50-200ms
- Custom URL (ngrok): ~300-800ms

---

## ✅ Acceptance Criteria

App passes if:

1. **Zero Configuration**
   - No manual IP setting needed
   - Auto-detect works

2. **Network Flexibility**
   - WiFi switch doesn't break app
   - Tunnel mode always works

3. **Platform Support**
   - iOS Simulator ✅
   - Android Emulator ✅
   - Physical iOS device ✅
   - Physical Android device ✅

4. **Error Handling**
   - Shows proper error messages
   - Logs debug info
   - Doesn't crash

---

## 🎓 Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [iOS/Android, Simulator/Device]

Test Case: [SCENARIO NAME]
Status: [PASS/FAIL]
Notes: [OBSERVATIONS]

API URL Detected: [URL]
Network Mode: [Tunnel/LAN/Custom]
Backend Status: [Running/Stopped]

Issues Found:
- [ISSUE 1]
- [ISSUE 2]

Screenshot: [ATTACH IF NEEDED]
```

---

## 🚀 Quick Test Run

**Full test in 5 minutes:**

```bash
# 1. Start backend
cd server && npm start &

# 2. Start mobile with tunnel
cd ../mobile-app
npm run start:tunnel

# 3. Scan QR code
# 4. Login: budi@company.com / password123
# 5. Test features:
#    - Dashboard ✓
#    - Clock In ✓
#    - Leave Request ✓
#    - Notifications ✓

# 6. Switch WiFi
# 7. Refresh app
# 8. Test again ✓

# PASS if all work without reconfiguration!
```

---

Happy Testing! 🧪✨
