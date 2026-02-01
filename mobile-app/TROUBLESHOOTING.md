# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. ❌ "Cannot find module 'babel-preset-expo'"

**Problem:** Babel preset tidak terinstall atau versi tidak cocok

**Solution:**
```bash
npm install babel-preset-expo --legacy-peer-deps
```

Make sure `babel-preset-expo` version matches your Expo SDK:
- Expo SDK 54 → babel-preset-expo ~54.0.10
- Expo SDK 50 → babel-preset-expo ~12.0.0

---

### 2. ❌ Dependency Version Mismatch

**Problem:** Package versions tidak sesuai dengan Expo SDK

**Solution:**
```bash
# Check dependencies
npx expo-doctor

# Auto-fix (may fail with conflicts)
npx expo install --fix

# Manual fix with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Note:** Gunakan `--legacy-peer-deps` jika ada konflik peer dependencies

---

### 3. ❌ Error Akses dari HP / Expo Go

**Possible Causes:**
1. ❌ HP dan komputer tidak di WiFi yang sama
2. ❌ Firewall memblokir Expo DevTools
3. ❌ Expo Go app versi lama
4. ❌ Metro bundler tidak jalan

**Solutions:**

#### A. Pastikan Same Network
```bash
# Check IP komputer
ifconfig | grep "inet "

# Pastikan HP terhubung ke WiFi yang sama
# IP HP harus di subnet yang sama (contoh: 192.168.1.x)
```

#### B. Update Expo Go App
- iOS: Update dari App Store
- Android: Update dari Play Store
- **Minimal version:** Expo Go 2.32.0+ untuk SDK 54

#### C. Restart Expo Dev Server
```bash
# Stop server yang sedang jalan (Ctrl+C)
# Clear cache and restart
npm start -- --clear

# Atau dengan tunnel (lambat tapi works across networks)
npm start -- --tunnel
```

#### D. Check Firewall
```bash
# macOS - Allow port 8081 dan 19000-19006
# Temporary disable firewall untuk test:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Enable kembali setelah test:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

### 4. ❌ Missing Assets (icon.png, splash.png)

**Problem:** `app.json` merujuk ke file assets yang tidak ada

**Solution:**

#### Option A: Remove Asset References (Quick Fix)
Sudah dilakukan - `app.json` sudah diupdate tanpa icon & splash

#### Option B: Add Assets (Proper Solution)
```bash
# Download atau buat assets di:
# - ./assets/icon.png (1024x1024 px)
# - ./assets/splash.png (1242x2436 px untuk iPhone)
# - ./assets/adaptive-icon.png (1024x1024 px untuk Android)

# Kemudian update app.json:
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

### 5. ❌ Camera Not Working

**Problem:** Camera permission denied atau API error

**Solutions:**

#### A. Check Permissions
```javascript
// Sudah implemented di CameraScreen.js
const [permission, requestPermission] = useCameraPermissions();

if (!permission?.granted) {
  await requestPermission();
}
```

#### B. Expo Go Limitations
- Expo Go tidak support semua fitur camera di production
- **Solution:** Build development client
```bash
npx expo run:android
# atau
npx expo run:ios
```

#### C. Device Compatibility
- Test di real device (emulator ada limitasi)
- iOS: Need physical device untuk camera testing
- Android: Some emulators support camera (AVD with webcam)

---

### 6. ❌ GPS/Location Not Working

**Problem:** Location permission denied atau tidak akurat

**Solutions:**

#### A. Check Permissions in app.json
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Required for attendance"
    }
  },
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ]
  }
}
```

#### B. Enable Location on Device
- iOS: Settings → Privacy → Location Services → Expo Go → While Using
- Android: Settings → Location → Enable

#### C. Test Outdoors
- GPS may not work well indoors
- Wait 10-30 seconds for GPS lock

---

### 7. ❌ Backend API Connection Failed

**Problem:** Cannot connect to `http://localhost:3000`

**Solutions:**

#### A. Backend Not Running
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start mobile app
cd mobile-app
npm start
```

#### B. Update API Base URL
```bash
# Edit .env file
# Ganti localhost dengan IP komputer
API_BASE_URL=http://192.168.1.10:3000/api

# Restart expo
npm start -- --clear
```

#### C. Find Computer IP
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig

# Contoh: 192.168.1.10
# Update .env dengan IP tersebut
```

---

### 8. ❌ Network Request Failed

**Problem:** Axios request timeout atau failed

**Solutions:**

#### A. Check Backend Server
```bash
# Test backend dengan curl
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

#### B. CORS Issues
Backend (`server/app.js`) sudah setup CORS:
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

#### C. Timeout Issues
Update axios timeout di `services/api.js`:
```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increase to 30 seconds
});
```

---

### 9. ❌ Build Errors

**Problem:** Native build failed

**Solutions:**

#### A. Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Remove all generated files
rm -rf node_modules package-lock.json
rm -rf .expo .expo-shared
rm -rf ios/build android/build android/.gradle

# Reinstall
npm install --legacy-peer-deps

# Clear Metro bundler cache
npm start -- --clear
```

#### B. EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

---

### 10. ❌ "Expo Go app version is too old"

**Problem:** Expo Go tidak support SDK version

**Solutions:**

#### A. Update Expo Go
- Update ke versi terbaru dari App/Play Store
- **Minimum:** Expo Go 2.32.0

#### B. Downgrade Expo SDK (Not Recommended)
```bash
# Edit package.json
"expo": "~50.0.0"  # Older version

# Reinstall
npm install --legacy-peer-deps
```

#### C. Use Development Build (Recommended)
```bash
# Create development build
npx expo run:android
npx expo run:ios
```

---

## 🚀 Quick Fixes Checklist

Sebelum report issue, coba checklist ini:

- [ ] Restart Expo dev server (`npm start`)
- [ ] Clear cache (`npm start -- --clear`)
- [ ] HP dan laptop di WiFi yang sama
- [ ] Update Expo Go app di HP
- [ ] Backend server sudah jalan
- [ ] `.env` file exists dengan API_BASE_URL yang benar
- [ ] Check IP komputer (`ifconfig`)
- [ ] Update IP di `.env` jika perlu
- [ ] Try tunnel mode (`npm start -- --tunnel`)

---

## 📱 Testing Checklist

Before deployment, test these:

### Authentication
- [ ] Login dengan credentials yang benar
- [ ] Login dengan credentials salah (show error)
- [ ] Auto-login setelah restart app
- [ ] Logout (clear token & redirect)

### Camera
- [ ] Camera permission request
- [ ] Take photo (front camera)
- [ ] Take photo (back camera)
- [ ] Photo preview before submit

### GPS/Location
- [ ] Location permission request
- [ ] Get current location
- [ ] Show lat/long in UI
- [ ] Submit dengan location data

### API Integration
- [ ] Dashboard data load
- [ ] Attendance history load
- [ ] Leave request submit
- [ ] Overtime request submit
- [ ] Notifications load
- [ ] Profile update

### Navigation
- [ ] Tab navigation works
- [ ] Stack navigation (detail screens)
- [ ] Back button works
- [ ] Deep linking (if implemented)

---

## 🆘 Still Having Issues?

1. **Check Logs:**
```bash
# Expo logs
npm start

# Backend logs
cd server && npm start

# Detailed logs
npm start -- --verbose
```

2. **Debug Mode:**
- Shake device → Toggle Debug Remote JS
- Open Chrome DevTools
- Check console for errors

3. **Common Error Patterns:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Cannot find module" | Missing dependency | `npm install` |
| "Network request failed" | Backend not running | Start backend server |
| "Permission denied" | Missing permissions | Check app.json |
| "Expo Go incompatible" | SDK version mismatch | Update Expo Go |
| "Metro bundler error" | Cache issue | `npm start -- --clear` |

4. **Get Help:**
- Check Expo documentation: https://docs.expo.dev
- Expo Discord: https://chat.expo.dev
- Stack Overflow: Tag `expo` + `react-native`

---

## 📚 Useful Commands Reference

```bash
# Start with clear cache
npm start -- --clear

# Start with tunnel (for different networks)
npm start -- --tunnel

# Check project health
npx expo-doctor

# Upgrade dependencies
npx expo install --check
npx expo install --fix

# Install with legacy peer deps (if conflicts)
npm install --legacy-peer-deps

# Build for production
eas build --platform android
eas build --platform ios

# Run on device directly
npx expo run:android
npx expo run:ios
```

---

**Last Updated:** February 1, 2026
**Expo SDK:** 54.0.0
**Status:** Production Ready ✅
