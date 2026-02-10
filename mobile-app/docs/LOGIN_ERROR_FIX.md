# 🚨 LOGIN ERROR - QUICK FIX

## ❌ Problem
Login tidak bisa connect ke backend server.

## ✅ Solution (2 menit)

### 1️⃣ Jalankan Diagnostic Tool
```bash
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/mobile-app
./check-network.sh
```

Tool ini akan:
- ✅ Cek IP address Mac Anda
- ✅ Update app.json otomatis (jika perlu)
- ✅ Test backend server
- ✅ Verify network connection

### 2️⃣ Restart Expo App
Setelah tool selesai:
```bash
# Stop Expo (Ctrl+C)
npm start
```

### 3️⃣ Test Login
Gunakan credentials ini:
- **Email:** budi@company.com
- **Password:** password123

---

## 🎯 What Was Fixed?

### Root Cause:
IP address di `app.json` tidak sesuai dengan IP Mac Anda.

**Before:** `http://172.20.10.2:3000` ❌  
**After:** `http://192.168.100.145:3000` ✅

### Files Changed:
- ✅ `mobile-app/app.json` - Updated API URL

---

## 🔍 Manual Check (Optional)

Jika ingin cek manual:

### 1. Cek IP Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 2. Update app.json:
```json
"extra": {
  "apiUrl": "http://YOUR_IP_HERE:3000"
}
```

### 3. Test backend:
```bash
curl http://localhost:3000/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@company.com","password":"password123"}'
```

---

## 📱 Important Notes

### ⚠️ Pastikan:
1. **Backend server** sudah running (port 3000)
2. **Mac dan Phone** di WiFi yang **SAMA**
3. **Expo app** sudah **RESTART** setelah update
4. **Firewall** tidak block port 3000

### 🆘 Still Not Working?

Lihat file lengkap: **TROUBLESHOOTING_LOGIN.md**

Atau contact developer dengan info:
- Console logs dari Expo DevTools
- Output dari `./check-network.sh`
- Error message yang muncul

---

## 📚 Documentation Files

1. **LOGIN_ERROR_FIX.md** (ini file) - Quick fix guide
2. **TROUBLESHOOTING_LOGIN.md** - Detailed troubleshooting
3. **check-network.sh** - Diagnostic tool

---

**Happy Coding! 🚀**
