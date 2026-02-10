# 🔧 Solusi Ganti Jaringan - API Auto Configuration

## 🎯 Masalah yang Dipecahkan

Sebelumnya, setiap kali ganti WiFi/jaringan, harus manual ubah IP di `app.json`:
```json
"extra": {
  "apiUrl": "http://192.168.100.145:3000"  // ❌ Hardcoded IP - ribet!
}
```

## ✅ Solusi Baru: Auto-Detection

Aplikasi sekarang **otomatis detect** API URL berdasarkan platform dan mode:

### 📱 iOS Simulator
```
http://localhost:3000
```

### 🤖 Android Emulator
```
http://10.0.2.2:3000
```

### 📲 Physical Device (HP Asli)
```
Auto-detect dari Expo manifest
Contoh: http://192.168.1.100:3000
```

## 🚀 Cara Pakai (RECOMMENDED)

### Option 1: Tunnel Mode ⭐ PALING DIREKOMENDASIKAN

**Keuntungan:**
- ✅ Tidak tergantung IP lokal
- ✅ Tidak perlu satu WiFi yang sama
- ✅ Bisa akses dari internet mana aja
- ✅ Tidak perlu restart saat ganti jaringan

**Cara:**
```bash
cd mobile-app
npx expo start --tunnel
```

Scan QR code, dan selesai! Ganti WiFi kapanpun juga tetap jalan.

---

### Option 2: LAN Mode (Same WiFi Required)

**Keuntungan:**
- ✅ Lebih cepat dari tunnel
- ✅ Auto-detect IP
- ❌ Harus satu WiFi sama dengan komputer

**Cara:**
```bash
cd mobile-app
npx expo start --lan
```

**Jika ganti WiFi:**
```bash
# Cukup restart Expo
npx expo start --lan --clear
```

Aplikasi akan otomatis detect IP baru!

---

### Option 3: Custom URL (ngrok, Production, etc.)

**Untuk production atau ngrok:**

1. Edit `app.json`:
```json
"extra": {
  "apiUrl": "https://your-api.ngrok.io"
}
```

2. Restart Expo:
```bash
npx expo start --clear
```

---

## 🧪 Testing

### Cek API URL yang Terdeteksi

Saat app start, lihat console log:
```
🔧 ========== API CONFIGURATION ==========
🔧 API_BASE_URL: http://192.168.1.100:3000
🔧 Platform: ios
🔧 Is Device: true
🔧 Expo Host: 192.168.1.100:8081
🔧 Custom URL: Not set
🔧 ========================================
```

### Test Login

1. Pastikan backend running:
```bash
cd server
npm start
```

2. Open app dan login:
```
Email: budi@company.com
Password: password123
```

3. Lihat API calls di Expo console

---

## 🐛 Troubleshooting

### ❌ Error: "Network Error"

**Penyebab:** Backend tidak jalan atau port salah

**Solusi:**
```bash
# 1. Cek backend running
cd server
npm start

# 2. Cek port (default: 3000)
curl http://localhost:3000/api/profile

# 3. Restart Expo dengan tunnel
cd mobile-app
npx expo start --tunnel --clear
```

---

### ❌ Error: "Cannot connect to API"

**Penyebab:** IP tidak bisa diakses

**Solusi:**

**Option A - Pakai Tunnel:**
```bash
npx expo start --tunnel
```

**Option B - Cek Firewall:**
```bash
# Allow port 3000 di firewall
# macOS:
sudo lsof -i :3000
```

---

### ❌ Error: "API URL undefined"

**Penyebab:** Expo constants tidak load

**Solusi:**
```bash
# Clear cache dan restart
npx expo start --clear
```

---

## 📝 Developer Notes

### Cara Kerja Auto-Detection

File: `src/config/api.js`

```javascript
const getApiUrl = () => {
  // 1. Custom URL dari app.json (priority tertinggi)
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // 2. iOS Simulator
  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return 'http://localhost:3000';
  }
  
  // 3. Android Emulator
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:3000';
  }
  
  // 4. Physical Device - Auto dari Expo manifest
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':').shift();
    return `http://${host}:3000`;
  }
  
  // Fallback
  return 'http://localhost:3000';
};
```

---

## 🎓 Tips & Best Practices

### Development (Saat Coding)

```bash
# Pakai tunnel biar fleksibel
npx expo start --tunnel
```

### Testing di Physical Device (Same WiFi)

```bash
# Pakai LAN mode (lebih cepat)
npx expo start --lan
```

### Production/Demo

Edit `app.json`:
```json
"extra": {
  "apiUrl": "https://api.yourcompany.com"
}
```

---

## 🆚 Comparison

| Mode | Speed | Ganti WiFi | Same Network | Internet Required |
|------|-------|------------|--------------|-------------------|
| **Tunnel** | 🐌 Slow | ✅ Bebas | ❌ No | ✅ Yes |
| **LAN** | 🚀 Fast | ❌ Harus restart | ✅ Yes | ❌ No |
| **Custom** | Depends | Depends | Depends | Depends |

---

## 🎯 Kesimpulan

### Untuk Kamu (Developer)

**Pakai Tunnel Mode:**
```bash
npx expo start --tunnel
```

**Keuntungan:**
- Ganti WiFi sesukanya
- Gak perlu restart
- Gak perlu ubah config
- Work di Starbucks, rumah, kampus, dimana aja

### Untuk Testing

**Pakai LAN Mode:**
```bash
npx expo start --lan
```

**Lebih cepat, tapi harus satu WiFi**

---

## 📞 Support

Jika masih ada issue:

1. Cek backend running: `curl http://localhost:3000`
2. Clear Expo cache: `npx expo start --clear`
3. Try tunnel mode: `npx expo start --tunnel`
4. Cek firewall settings

Happy coding! 🚀
