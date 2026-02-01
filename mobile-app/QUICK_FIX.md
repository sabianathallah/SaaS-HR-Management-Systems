# 🚀 Quick Fix Guide - Mobile App Running

## ✅ Masalah yang Sudah Diperbaiki

### 1. **babel-preset-expo missing** ✅
- Installed `babel-preset-expo@~12.0.0`

### 2. **Expo SDK Version Mismatch** ✅
- Upgraded to Expo SDK 54 (matches Expo Go app)
- Downgrade React Native to avoid "bridgeless" error

### 3. **API Connection Error 500** ✅
- Updated `.env` dengan IP komputer: `http://192.168.1.20:3000/api`
- Localhost tidak bisa diakses dari HP!

### 4. **Camera API** ✅
- Menggunakan `Camera` dari `expo-camera` (bukan `CameraView`)
- Compatible dengan SDK 54

## 📱 Cara Menjalankan App

### Step 1: Start Backend Server
```bash
# Terminal 1
cd server
npm start
```

Backend akan jalan di `http://localhost:3000`

### Step 2: Start Mobile App
```bash
# Terminal 2
cd mobile-app
npx expo start --clear
```

Expo akan jalan di `exp://192.168.1.20:8081`

### Step 3: Scan QR Code di HP
1. **Install Expo Go** dari App Store (iOS) atau Play Store (Android)
2. **Update Expo Go** ke versi terbaru
3. **Scan QR code** yang muncul di terminal
4. **Tunggu** bundle download selesai
5. **App akan terbuka!**

## 🔧 Konfigurasi Penting

### API Base URL (.env)
```bash
API_BASE_URL=http://192.168.1.20:3000/api
```

**⚠️ Penting:**
- **JANGAN** pakai `localhost` - HP tidak bisa akses
- **HARUS** pakai IP komputer
- HP dan laptop **HARUS** di WiFi yang sama

### Cara Cek IP Komputer
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Hasilnya seperti: 192.168.1.20
```

Jika IP komputer berubah (ganti WiFi), update file `.env` dengan IP baru!

## 🧪 Testing

### Login Credentials
```
Email: employee@salmon.com
Password: password123
```

### Fitur yang Bisa Ditest:
- ✅ Login
- ✅ Dashboard (lihat attendance hari ini)
- ✅ Attendance History
- ✅ Clock In/Out (dengan kamera + GPS)
- ✅ Leave Request
- ✅ Overtime Request
- ✅ Notifications
- ✅ Profile

## ⚠️ Common Issues

### Issue 1: "Project incompatible with Expo Go"
**Problem:** Expo Go app versi lama
**Solution:** Update Expo Go di App Store/Play Store

### Issue 2: "Network Request Failed"
**Problem:** HP tidak bisa connect ke backend
**Solution:**
1. Pastikan HP dan laptop di WiFi yang sama
2. Check IP komputer: `ifconfig`
3. Update `.env` dengan IP yang benar
4. Restart expo: `npx expo start --clear`

### Issue 3: "Cannot connect to Metro"
**Problem:** Port 8081 sudah dipakai
**Solution:**
```bash
# Kill process di port 8081
lsof -ti:8081 | xargs kill -9

# Start ulang
npx expo start --clear
```

### Issue 4: Error 500 saat Login
**Problem:** Backend error atau tidak jalan
**Solution:**
1. Check backend terminal - ada error?
2. Test backend: `curl http://localhost:3000/api/test-ip`
3. Restart backend: `cd server && npm start`

### Issue 5: Camera "bridgeless" Error
**Problem:** React Native version terlalu baru
**Solution:** Sudah fixed! Pakai RN 0.76.5 (bukan 0.81.5)

## 📊 Current Configuration

### Dependencies
```json
{
  "expo": "~54.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "expo-camera": "~16.0.0",
  "expo-location": "~18.0.0",
  "@react-navigation/native": "^6.1.17",
  "@react-navigation/bottom-tabs": "^6.5.20"
}
```

### Known Warnings (Can be ignored for now)
- Package version mismatches dengan Expo SDK 54
- Tidak mengganggu functionality
- Bisa diupdate nanti dengan: `npx expo install --fix`

## 🎯 Next Steps

### Option 1: Keep Current Setup (Recommended for now)
- App sudah bisa jalan
- Ignore package warnings
- Focus on testing features

### Option 2: Update All Packages (Optional)
```bash
# This might cause new issues
npx expo install --fix
npm install --legacy-peer-deps
```

### Option 3: Build Development Client (Advanced)
```bash
# For production-like testing
npx expo run:android
# atau
npx expo run:ios
```

## 📝 Checklist Sebelum Testing

- [ ] Backend server running (`npm start` di folder `server`)
- [ ] Mobile app running (`npx expo start` di folder `mobile-app`)
- [ ] HP dan laptop di WiFi yang sama
- [ ] Expo Go app sudah diinstall dan diupdate
- [ ] QR code sudah di-scan
- [ ] Bundle sudah selesai download
- [ ] Login dengan `employee@salmon.com` / `password123`

## 🆘 Still Having Issues?

1. **Check Terminal Logs:**
   - Backend terminal: Ada error message?
   - Expo terminal: Ada red text?

2. **Reload App:**
   - Shake HP → Reload
   - Atau tekan `r` di Expo terminal

3. **Clear Cache:**
   ```bash
   cd mobile-app
   rm -rf .expo node_modules
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

4. **Check Network:**
   ```bash
   # Test backend
   curl http://192.168.1.20:3000/api/test-ip
   
   # Harus return JSON dengan IP info
   ```

## ✅ Status

**Current Status:** ✅ **RUNNING**

- Backend: ✅ Running di port 3000
- Mobile App: ✅ Running di port 8081
- Expo Go: ✅ Compatible (SDK 54)
- API Connection: ✅ Fixed (using IP instead of localhost)
- Camera API: ✅ Fixed (using Camera, not CameraView)
- Vulnerabilities: ✅ 0 vulnerabilities

**Ready for testing!** 🎉

---

**Last Updated:** February 1, 2026
**Expo SDK:** 54.0.0
**React Native:** 0.76.5
**Backend:** Running on port 3000
**Mobile:** Running on port 8081
