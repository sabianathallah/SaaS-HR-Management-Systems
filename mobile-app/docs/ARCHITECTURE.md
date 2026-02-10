# 🎨 Mobile App Network Architecture

## 📊 Auto-Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP START                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Check app.json extra.apiUrl                     │
│                                                              │
│  if (Constants.expoConfig?.extra?.apiUrl)                   │
│    return custom URL                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Not set
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Detect Platform                            │
│                                                              │
│  Platform.OS === 'ios' / 'android'                          │
│  Constants.isDevice === true / false                        │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ iOS Sim      │  │ Android Emu  │  │ Physical     │
│              │  │              │  │ Device       │
│ localhost    │  │ 10.0.2.2     │  │ Auto-detect  │
│ :3000        │  │ :3000        │  │ from Expo    │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  API_BASE_URL Set                            │
│                                                              │
│  Example: http://192.168.1.100:3000                         │
│  Logged to console for debugging                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Axios Instance Created                         │
│                                                              │
│  baseURL: API_BASE_URL                                      │
│  timeout: 30000ms                                           │
│  headers: { Authorization: Bearer token }                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Requests                               │
│                                                              │
│  /login, /profile, /attendances, etc.                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Tunnel Mode Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                              │
│  ┌────────────────────┐       ┌────────────────────┐       │
│  │   Backend Server   │       │   Expo Dev Server  │       │
│  │   localhost:3000   │◄──────┤   localhost:8081   │       │
│  └────────────────────┘       └────────────────────┘       │
│                                        │                     │
└────────────────────────────────────────┼─────────────────────┘
                                         │
                                         │ Tunnel
                                         ▼
                         ┌───────────────────────────┐
                         │   EXPO TUNNEL SERVER      │
                         │   (Cloud Infrastructure)  │
                         │                           │
                         │   Public URL:             │
                         │   exp://abc123.tunnel.dev │
                         └───────────────────────────┘
                                         │
                                         │ Internet
                                         ▼
                         ┌───────────────────────────┐
                         │     YOUR PHONE            │
                         │                           │
                         │   📱 Expo Go App          │
                         │   Any WiFi/Mobile Data    │
                         │   Any Location            │
                         └───────────────────────────┘
```

**Benefits:**
- ✅ No IP configuration
- ✅ Works across different networks
- ✅ Can share with team
- ⚠️  Slightly slower

---

## 🏠 LAN Mode Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK (WiFi)                      │
│                                                              │
│   ┌─────────────────────────┐                               │
│   │    YOUR COMPUTER        │                               │
│   │                         │                               │
│   │  Backend: :3000         │                               │
│   │  Expo Dev: :8081        │                               │
│   │  IP: 192.168.1.100      │                               │
│   └─────────────────────────┘                               │
│              │                                               │
│              │ Direct Connection                             │
│              ▼                                               │
│   ┌─────────────────────────┐                               │
│   │     YOUR PHONE          │                               │
│   │                         │                               │
│   │  📱 Expo Go App         │                               │
│   │  Connects to:           │                               │
│   │  http://192.168.1.100   │                               │
│   └─────────────────────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Fast, direct connection
- ✅ No internet required
- ⚠️  Must be on same WiFi
- ⚠️  IP changes if WiFi changes

---

## 🔄 Network Change Handling

### Before Fix (Manual)

```
WiFi A (192.168.1.100)
    │
    ├─ app.json: "apiUrl": "http://192.168.1.100:3000"
    ├─ App works ✅
    │
    ▼ Switch WiFi
    │
WiFi B (192.168.0.50)
    │
    ├─ app.json still: "http://192.168.1.100:3000" ❌
    ├─ App ERROR: Network Error ❌
    ├─ Developer: Edit app.json manually 😤
    ├─ Developer: Restart Expo
    └─ App works again ✅
```

### After Fix (Auto)

```
WiFi A
    │
    ├─ Auto-detect: 192.168.1.100:3000
    ├─ App works ✅
    │
    ▼ Switch WiFi
    │
WiFi B
    │
    ├─ With TUNNEL: No change needed
    ├─ App still works ✅ ✨
    │
    OR
    │
    ├─ With LAN: Restart app
    ├─ Auto-detect: 192.168.0.50:3000
    └─ App works ✅
```

---

## 📱 Platform-Specific URLs

```
┌─────────────────────────────────────────────────────────────┐
│                     PLATFORM DETECTION                       │
└─────────────────────────────────────────────────────────────┘

iOS Simulator
├─ Platform.OS: 'ios'
├─ Constants.isDevice: false
└─ URL: http://localhost:3000
    (Simulator can access Mac's localhost)

Android Emulator  
├─ Platform.OS: 'android'
├─ Constants.isDevice: false
└─ URL: http://10.0.2.2:3000
    (10.0.2.2 is emulator's special alias for host machine)

Physical iOS Device
├─ Platform.OS: 'ios'
├─ Constants.isDevice: true
└─ URL: http://[AUTO-DETECTED-IP]:3000
    (Extracted from Expo manifest hostUri)

Physical Android Device
├─ Platform.OS: 'android'
├─ Constants.isDevice: true
└─ URL: http://[AUTO-DETECTED-IP]:3000
    (Extracted from Expo manifest hostUri)
```

---

## 🔧 Configuration Priority

```
Priority 1: Custom URL (Highest)
    │
    ├─ app.json: extra.apiUrl
    ├─ Use case: Production, ngrok, custom domain
    └─ Example: "https://api.company.com"
    
Priority 2: Platform Detection
    │
    ├─ iOS Simulator → localhost
    └─ Android Emulator → 10.0.2.2
    
Priority 3: Auto-Detection
    │
    ├─ Physical Device
    ├─ Extract from Expo manifest
    └─ Example: 192.168.1.100
    
Priority 4: Fallback (Lowest)
    │
    └─ localhost:3000
```

---

## 🚀 Deployment Modes

### Development
```
Developer Machine
    │
    ├─ npm run start:tunnel
    ├─ QR Code generated
    └─ Scan → Works anywhere
```

### Testing (Same Office)
```
Office WiFi Network
    │
    ├─ npm run start:lan
    ├─ Faster performance
    └─ Team tests on same network
```

### Production
```
app.json
    │
    ├─ "apiUrl": "https://api.company.com"
    ├─ Build with EAS
    └─ Distribute to stores
```

---

## 📊 Request Flow

```
Mobile App Component
    │
    │ import { authService } from './services'
    ▼
Service Layer (services/index.js)
    │
    │ authService.login(email, password)
    ▼
Axios Instance (services/api.js)
    │
    │ api.post(config.API_ENDPOINTS.LOGIN, data)
    │ baseURL: API_BASE_URL
    │ headers: { Authorization: Bearer token }
    ▼
API Configuration (config/api.js)
    │
    │ API_BASE_URL = getApiUrl()
    │ API_ENDPOINTS = { LOGIN: '/login', ... }
    ▼
Backend Server
    │
    │ Express.js @ :3000
    │ Route: POST /login
    ▼
Response
    │
    │ { success: true, data: {...}, token: '...' }
    ▼
Interceptor (services/api.js)
    │
    │ Save token to AsyncStorage
    │ Handle errors (401, 403)
    ▼
Component
    │
    │ Update UI
    └─ Navigate to Dashboard
```

---

## 🎯 Decision Tree

```
Need to start mobile app?
    │
    ├─ YES → Which mode?
    │
    ├─── Testing daily?
    │    └─→ npm run start:tunnel
    │        (Recommended - most flexible)
    │
    ├─── Same network, need speed?
    │    └─→ npm run start:lan
    │        (Faster, but fixed network)
    │
    ├─── Having cache issues?
    │    └─→ npm run start:clear
    │        (Clear and restart)
    │
    └─── Production build?
         └─→ Set apiUrl in app.json
             Then: eas build
```

---

## 🔍 Debugging Flow

```
App not connecting?
    │
    ├─ Check console logs
    │   └─ Look for: "🔧 API_BASE_URL: ..."
    │
    ├─ Backend running?
    │   └─ curl http://localhost:3000
    │
    ├─ Firewall blocking?
    │   └─ sudo lsof -i :3000
    │
    ├─ Try tunnel mode
    │   └─ npm run start:tunnel
    │
    └─ Clear cache
        └─ npm run start:clear
```

---

## 📈 Performance Comparison

```
Response Time (Average)

Localhost/Emulator
████░░░░░░ 50ms
(Fastest - same machine)

LAN Mode  
██████░░░░ 100ms
(Fast - local network)

Tunnel Mode
████████░░ 500ms
(Slower - goes through cloud)

Production
██████████ 200ms
(Depends on server location)
```

---

## ✅ Quality Checks

```
Startup Checklist:

1. Backend Started?
   □ cd server && npm start
   
2. Mobile Dependencies?
   □ cd mobile-app && npm install
   
3. Choose Mode
   □ Tunnel (recommended)
   □ LAN (faster)
   
4. Start App
   □ npm run start:tunnel
   
5. Scan QR Code
   □ Expo Go app
   
6. Check Console
   □ API_BASE_URL logged correctly?
   
7. Test Login
   □ budi@company.com / password123
   
8. Verify API Calls
   □ Dashboard loads?
   □ No network errors?
```

---

**Last Updated:** 2026-02-10
**Version:** 1.0.0
**Status:** ✅ Production Ready
