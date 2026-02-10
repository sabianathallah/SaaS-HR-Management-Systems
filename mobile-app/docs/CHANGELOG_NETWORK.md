# 📱 Mobile App - Network Auto-Configuration Update

## 🎯 Problem Solved

**Before:**
- Manual IP configuration di `app.json`
- Harus edit file setiap ganti WiFi
- Error "Network Error" saat pindah jaringan
- Developer frustasi 😤

**After:**
- ✅ Auto-detect IP address
- ✅ Tunnel mode support
- ✅ Ganti WiFi tanpa konfigurasi
- ✅ Developer happy 🎉

---

## 📝 Changes Made

### 1. Smart API Configuration
**File:** `src/config/api.js`

- Auto-detect platform (iOS/Android, Simulator/Emulator/Device)
- Extract IP from Expo manifest
- Prioritize custom URL if set
- Fallback mechanism

### 2. Updated app.json
**File:** `app.json`

- Removed hardcoded IP
- Clean configuration
- Support custom URL via `extra.apiUrl` (optional)

### 3. Documentation
**Files:**
- `NETWORK_SOLUTION.md` - Comprehensive solution guide
- `README.md` - Updated quick start
- `.env.example` - Environment variable template

### 4. NPM Scripts
**File:** `package.json`

New scripts:
```json
{
  "start:tunnel": "expo start --tunnel",  // Recommended
  "start:lan": "expo start --lan",        // Fast mode
  "start:clear": "expo start --clear"     // Fix cache
}
```

### 5. Quick Start Script
**File:** `quick-start.sh`

Interactive bash script untuk mudah start app

---

## 🚀 Usage

### Option 1: Tunnel Mode (Recommended) ⭐

```bash
cd mobile-app
npm run start:tunnel
# atau
./quick-start.sh
```

**Perfect untuk:**
- Development sehari-hari
- Ganti-ganti WiFi
- Testing di berbagai lokasi
- Tidak mau ribet

### Option 2: LAN Mode (Fast)

```bash
cd mobile-app
npm run start:lan
```

**Perfect untuk:**
- Testing cepat
- Sudah di WiFi yang sama
- Performance testing

### Option 3: Custom URL

Edit `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-ngrok-url.ngrok.io"
    }
  }
}
```

Then:
```bash
npm run start:clear
```

---

## 🧪 Testing

1. Start backend:
```bash
cd server
npm start
```

2. Start mobile app dengan tunnel:
```bash
cd mobile-app
npm run start:tunnel
```

3. Scan QR di Expo Go

4. Login:
```
Email: budi@company.com
Password: password123
```

5. Cek console untuk API URL yang terdetect

---

## 📊 Technical Details

### Auto-Detection Logic

```javascript
Priority:
1. Custom URL from app.json (manual override)
2. iOS Simulator → localhost:3000
3. Android Emulator → 10.0.2.2:3000
4. Physical Device → Extract from Expo manifest
5. Fallback → localhost:3000
```

### How Tunnel Works

Expo tunnel creates a public URL:
```
expo-tunnel://some-hash.exp.direct:80
↓
http://your-computer-ip:3000
```

Benefits:
- No IP configuration needed
- Works across different networks
- Public URL (can share for demo)

Tradeoffs:
- Slightly slower
- Requires internet connection
- Uses Expo infrastructure

---

## 🐛 Troubleshooting

### "Network Error"
```bash
# Solution 1: Use tunnel
npm run start:tunnel

# Solution 2: Check backend
cd server && npm start

# Solution 3: Clear cache
npm run start:clear
```

### "Cannot connect"
```bash
# Check firewall
sudo lsof -i :3000

# Try different port
# Edit server to use different port
# Update API config accordingly
```

### "API URL undefined"
```bash
# Clear Expo cache
npm run start:clear
```

---

## 📚 Files Modified

```
mobile-app/
├── src/
│   └── config/
│       └── api.js ✏️ (Updated - Auto-detection)
├── app.json ✏️ (Updated - Removed hardcoded IP)
├── package.json ✏️ (Updated - New scripts)
├── NETWORK_SOLUTION.md ✨ (New - Full guide)
├── README.md ✏️ (Updated - Quick start)
├── .env.example ✨ (New - Environment template)
└── quick-start.sh ✨ (New - Interactive script)
```

---

## ✅ Verification Checklist

- [x] Auto-detect iOS Simulator
- [x] Auto-detect Android Emulator
- [x] Auto-detect Physical Device
- [x] Support tunnel mode
- [x] Support LAN mode
- [x] Support custom URL
- [x] Console logging for debugging
- [x] Documentation complete
- [x] Scripts added to package.json
- [x] Quick start script created

---

## 🎓 Best Practices

### For Development
```bash
# Use tunnel mode - most flexible
npm run start:tunnel
```

### For Testing Performance
```bash
# Use LAN mode - faster
npm run start:lan
```

### For Production/Demo
```bash
# Set production URL in app.json
# Then build with EAS
eas build --platform android
```

---

## 🔮 Future Improvements

Possible enhancements:
- [ ] Add .env support
- [ ] Multiple environment configs (dev/staging/prod)
- [ ] Auto-retry on network change
- [ ] Offline mode support
- [ ] Network quality indicator

---

## 📞 Support

Jika ada masalah:

1. Baca [NETWORK_SOLUTION.md](./NETWORK_SOLUTION.md)
2. Try tunnel mode: `npm run start:tunnel`
3. Clear cache: `npm run start:clear`
4. Check backend is running
5. Check firewall settings

---

## 🎉 Summary

**Problem:** Harus ganti IP manual setiap pindah WiFi
**Solution:** Auto-detect + Tunnel mode
**Result:** Zero configuration networking! 🚀

Happy coding! ✨
