# 🚀 Quick Start Guide - Mobile App

## Fitur Baru yang Ditambahkan

### 1. **Payslip Screen** 💰
Akses payslip dan rincian gaji Anda.

### 2. **Overtime Screen** ⏰  
Request dan track overtime dengan mudah.

---

## Cara Menjalankan

```bash
# 1. Masuk ke folder mobile-app
cd mobile-app

# 2. Install dependencies (jika belum)
npm install

# 3. Start Expo
npm start

# 4. Scan QR code dengan Expo Go app
```

---

## Navigasi Baru

Sekarang ada **6 tabs** di bottom navigation:

1. 🏠 **Dashboard** - Ringkasan hari ini
2. 📅 **Attendance** - Absensi & riwayat
3. 📝 **Leave** - Cuti & izin
4. ⏰ **Overtime** - Request overtime ⭐ NEW
5. 💰 **Payslip** - Lihat payslip ⭐ NEW
6. 👤 **Profile** - Profil & settings

---

## Testing Cepat

### Test Payslip:
1. Login sebagai employee
2. Tap tab **"Payslip"** (icon 💰)
3. Lihat list payslip yang tersedia
4. Tap **"Detail"** untuk melihat breakdown lengkap
5. Cek summary card di atas

### Test Overtime:
1. Tap tab **"Overtime"** (icon ⏰)
2. Tap **"➕ Request Overtime"**
3. Isi form (tanggal: YYYY-MM-DD, jam: angka desimal, alasan)
4. Submit dan lihat hasilnya
5. Coba fitur **"Lihat Riwayat"**

---

## 📦 File-File Penting

```
mobile-app/
├── App.js (✅ Updated - tambah 2 tabs baru)
├── src/
│   ├── screens/
│   │   ├── PayslipScreen.js (⭐ NEW)
│   │   ├── OvertimeScreen.js (⭐ NEW)
│   │   └── [screen lainnya...]
│   ├── services/
│   │   └── index.js (✅ Updated - tambah payrollService)
│   ├── config/
│   │   └── api.js (✅ Updated - tambah payroll endpoints)
│   └── utils/
│       └── helpers.js (✅ Updated - tambah currency formatter)
├── MOBILE_APP_UPDATE.md (📖 Dokumentasi lengkap)
└── SUMMARY_UPDATE.md (📋 Summary semua perubahan)
```

---

## ✅ Checklist Sebelum Testing

- [ ] Backend server sedang running
- [ ] IP address di `src/config/api.js` sudah benar
- [ ] Sudah login sebagai employee yang punya data payslip/overtime
- [ ] Expo Go app sudah terinstall di HP
- [ ] HP dan laptop dalam network yang sama

---

## 🐛 Troubleshooting

### Jika error "Network request failed":
- Pastikan backend server running (`npm start` di folder server)
- Check IP address di `src/config/api.js`
- Pastikan HP dan laptop di network yang sama

### Jika blank screen:
- Shake HP → reload
- Atau close app dan buka lagi
- Check console untuk error messages

### Jika error saat build:
```bash
# Clear cache dan restart
expo start -c
```

---

## 📚 Dokumentasi Lengkap

Lihat file-file berikut untuk info lebih detail:
- **MOBILE_APP_UPDATE.md** - Dokumentasi lengkap semua fitur
- **SUMMARY_UPDATE.md** - Summary perubahan dan testing checklist

---

## 💡 Tips

1. **Pull to Refresh**: Swipe ke bawah untuk refresh data
2. **Form Validation**: Semua form sudah ada validation
3. **Error Messages**: Perhatikan Alert untuk error/success messages
4. **Date Format**: Selalu gunakan format YYYY-MM-DD

---

**Happy Testing!** 🎉

Jika ada pertanyaan atau issue, silakan tanya!
