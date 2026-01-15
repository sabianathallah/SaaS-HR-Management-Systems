# 📋 FITUR ATTENDANCE (ABSENSI) - EMPLOYEE

> Panduan lengkap sistem absensi dengan foto selfie & GPS tracking

---

## 🎯 Overview

Sistem Attendance Salmon HRIS menggunakan teknologi modern untuk memastikan kehadiran karyawan:
- 📸 **Photo Verification** - Selfie saat clock-in/out
- 📍 **GPS Tracking** - Validasi lokasi kehadiran
- ⏱️ **Auto Calculate** - Hitung durasi kerja otomatis
- 🚨 **Smart Detection** - Deteksi terlambat otomatis

---

## 🏢 Jenis Shift Kerja

### 1. Office Shift (Kerja Kantor)
- **Lokasi:** Harus di kantor
- **GPS:** Wajib dalam radius kantor
- **Jam Kerja:** 09:00 - 17:00
- **Validasi:** Ketat (GPS + Photo)

### 2. WFH Shift (Work From Home)
- **Lokasi:** Di rumah / remote
- **GPS:** Tidak divalidasi (flexible)
- **Jam Kerja:** 09:00 - 17:00
- **Validasi:** Photo only

### 3. Flexible Shift
- **Lokasi:** Bebas
- **GPS:** Tidak divalidasi
- **Jam Kerja:** Flexible
- **Validasi:** Photo only

---

## ⏰ Jam Kerja Standar

| Waktu | Aktivitas | Keterangan |
|-------|-----------|------------|
| 09:00 | Batas Clock-In | Lewat dari ini = LATE |
| 09:00 - 17:00 | Jam Kerja Normal | 8 jam kerja |
| 17:00 | Waktu Clock-Out | Standar jam pulang |

---

## 📸 Clock In (Absen Masuk)

### Flow Proses Clock-In

```
1. Klik "Clock In"
   ↓
2. Izinkan Akses Kamera
   ↓
3. Izinkan Akses GPS
   ↓
4. Ambil Foto Selfie
   ↓
5. GPS Terdeteksi Otomatis
   ↓
6. Klik "Confirm Clock In"
   ↓
7. Upload Foto & Data GPS
   ↓
8. Validasi GPS (jika Office Shift)
   ↓
9. Status: "ON_PROGRESS"
   ✅ Berhasil Clock-In!
```

### Detail Langkah

#### Step 1: Klik Tombol Clock In
- Buka **Dashboard**
- Lihat card **"Today's Attendance"**
- Klik tombol hijau **"🟢 Clock In"**

#### Step 2: Izinkan Akses Kamera
- Browser akan meminta permission
- Klik **"Allow"** / **"Izinkan"**
- Kamera akan aktif otomatis

#### Step 3: Izinkan Akses GPS
- Browser akan meminta location permission
- Klik **"Allow"** / **"Izinkan"**
- GPS akan mulai mendeteksi lokasi Anda

#### Step 4: Ambil Foto Selfie
**Tips Foto yang Baik:**
- ✅ Wajah terlihat jelas
- ✅ Pencahayaan cukup
- ✅ Tidak blur
- ✅ Background jelas
- ❌ Jangan pakai foto orang lain
- ❌ Jangan terlalu gelap

**Cara Ambil Foto:**
1. Posisikan wajah di tengah kamera
2. Klik tombol **"📸 Capture Photo"**
3. Foto akan langsung terambil
4. Preview foto akan muncul

**Tidak Puas dengan Foto?**
- Klik **"Retake"** untuk ambil ulang
- Bisa diulang berkali-kali

#### Step 5: Konfirmasi GPS
Status GPS akan muncul:
- 📍 **GPS Detected:** Latitude & Longitude terdeteksi
- ⏳ **Detecting GPS:** Sedang mencari sinyal
- ❌ **GPS Error:** GPS tidak terdeteksi

**Jika GPS Error:**
- Refresh halaman
- Pastikan Location Services aktif
- Coba pindah ke tempat dengan sinyal lebih baik

#### Step 6: Confirm Clock In
- Pastikan foto & GPS sudah OK
- Klik tombol **"✅ Confirm Clock In"**
- Loading akan muncul
- Tunggu proses upload

#### Step 7: Hasil Clock In

**Berhasil:**
```
✅ Clock-in berhasil!
Status: ON_PROGRESS
Clock In: 08:45 AM
```

**Gagal:**
```
❌ Sudah clock-in hari ini
❌ Foto atau GPS tidak valid
❌ Koneksi internet bermasalah
```

---

## 🚪 Clock Out (Absen Pulang)

### Flow Proses Clock-Out

```
1. Klik "Clock Out"
   ↓
2. Ambil Foto Selfie (lagi)
   ↓
3. GPS Terdeteksi Otomatis
   ↓
4. Klik "Confirm Clock Out"
   ↓
5. Sistem Hitung Durasi Kerja
   ↓
6. Sistem Tentukan Status Final
   ↓
7. Status: "ON_TIME" atau "LATE"
   ✅ Berhasil Clock-Out!
```

### Perbedaan dengan Clock-In
- ✅ Harus sudah clock-in sebelumnya
- ✅ Menggunakan endpoint berbeda (PUT)
- ✅ Sistem akan hitung durasi kerja
- ✅ Status final ditentukan (ON_TIME/LATE)

### Perhitungan Otomatis

Setelah clock-out, sistem akan hitung:

**1. Work Duration (Durasi Kerja)**
```
Clock In:  08:45 AM
Clock Out: 17:30 PM
Duration:  8.75 jam
```

**2. Final Status**
```
Clock In sebelum 09:00 → ON_TIME ✅
Clock In setelah 09:00  → LATE ⏰
```

**Contoh:**
- Clock-in 08:30, clock-out 17:00 → **ON_TIME** (8.5 jam)
- Clock-in 09:15, clock-out 18:00 → **LATE** (8.75 jam)

---

## 📊 Status Attendance

### Status yang Mungkin Muncul

| Status | Icon | Arti | Kapan Muncul |
|--------|------|------|--------------|
| **ON_PROGRESS** | 🟡 | Sedang bekerja | Setelah clock-in, belum clock-out |
| **ON_TIME** | ✅ | Hadir tepat waktu | Clock-in ≤ 09:00 |
| **LATE** | ⏰ | Terlambat | Clock-in > 09:00 |
| **ABSENT** | ❌ | Tidak hadir | Tidak clock-in sampai sore |
| **LEAVE** | 🏖️ | Cuti | Cuti approved |
| **HOLIDAY** | 🎉 | Libur | Hari libur nasional |

### Status Timeline Harian

```
Scenario 1: Tepat Waktu
08:30 → Clock In  → Status: ON_PROGRESS 🟡
17:00 → Clock Out → Status: ON_TIME ✅

Scenario 2: Terlambat
09:30 → Clock In  → Status: ON_PROGRESS 🟡
17:30 → Clock Out → Status: LATE ⏰

Scenario 3: Tidak Hadir
Tidak clock-in sama sekali
18:00 → Auto Set → Status: ABSENT ❌
```

---

## 📍 GPS & Geo-Fencing

### Apa itu Geo-Fencing?

Geo-fencing adalah teknologi yang memvalidasi apakah Anda berada di lokasi kantor atau tidak, berdasarkan koordinat GPS.

### Cara Kerja

1. **Admin set lokasi kantor:**
   - Latitude: -6.200000
   - Longitude: 106.816666
   - Radius: 50 meter

2. **Saat Anda clock-in:**
   - GPS Anda terdeteksi: -6.200050, 106.816700
   - Sistem hitung jarak dari kantor
   - Jarak: 25.5 meter

3. **Validasi:**
   - 25.5m < 50m → **VALID** ✅
   - Anda dalam radius kantor

### Status Validasi GPS

| Status | Arti | Dampak |
|--------|------|--------|
| **valid** ✅ | Dalam radius kantor | Approved otomatis |
| **outside_radius** ⚠️ | Di luar radius | Ditandai untuk review admin |
| **gps_error** ❌ | GPS error | Admin akan review |
| **not_checked** ℹ️ | WFH/Flexible | Tidak perlu validasi |

### Untuk Shift WFH/Flexible

Jika shift Anda adalah **WFH** atau **Flexible**:
- ✅ GPS tidak divalidasi
- ✅ Bisa clock-in dari mana saja
- ✅ Status: `not_checked`
- ✅ Tidak ada penalty

### Tips GPS Accuracy

Untuk GPS yang akurat:
- ✅ Aktifkan **High Accuracy Mode** di settings
- ✅ Di luar ruangan lebih baik dari dalam ruangan
- ✅ Hindari area dengan banyak gedung tinggi
- ✅ Pastikan tidak ada penghalang sinyal
- ❌ Jangan gunakan VPN atau GPS faker

---

## 🤖 Auto Set Absent

### Apa itu Auto Set Absent?

Sistem otomatis yang menandai karyawan sebagai **ABSENT** jika tidak clock-in sampai jam tertentu.

### Kapan Dijalankan?

Sistem cron job berjalan:
- **Jam 18:00** - Set absent untuk yang belum clock-in
- **Jam 23:00** - Final check, set absent lagi

### Cara Kerja

```
Jam 18:00 - Sistem Cek:
├─ Budi: Sudah clock-in ✅ → Skip
├─ Andi: Belum clock-in ❌ → Set ABSENT
└─ Siti: Cuti approved 🏖️ → Skip (sudah ada status LEAVE)
```

### Dampak bagi Karyawan

Jika Anda ditandai **ABSENT**:
- ❌ Dihitung sebagai tidak hadir
- ❌ Bisa mempengaruhi performance review
- ❌ Bisa mempengaruhi gaji (tergantung kebijakan)

**Cara Menghindari:**
- ✅ Selalu clock-in sebelum jam 18:00
- ✅ Ajukan cuti jika berhalangan
- ✅ Komunikasi dengan atasan jika ada kendala

---

## 📋 Melihat Riwayat Attendance

### Halaman Attendance History

**Akses:**
1. Klik menu **"Attendance"** di sidebar
2. Anda akan lihat tabel riwayat

**Informasi yang Ditampilkan:**
- 📅 **Tanggal** - Tanggal kehadiran
- ⏰ **Clock In** - Jam masuk
- ⏰ **Clock Out** - Jam pulang
- 📊 **Status** - ON_TIME / LATE / ABSENT / dll
- ⏱️ **Duration** - Lama bekerja (jam)
- 📍 **Location** - Validasi GPS

**Fitur Tambahan:**
- 🔍 **Filter by Date Range** - Pilih periode
- 📊 **View Statistics** - Lihat grafik
- 📥 **Export** - Download data (coming soon)

---

## 📊 Statistics & Analytics

### Melihat Statistik Kehadiran

**Cara Akses:**
1. Di halaman **Attendance**
2. Klik tombol **"📊 View Statistics"**
3. Pilih periode:
   - **Monthly** - Per bulan
   - **Weekly** - Per minggu
4. Pilih **Month & Year**
5. Klik **"Generate Report"**

### Data yang Ditampilkan

**Summary Cards:**
- 📅 **Total Days** - Total hari kerja
- ✅ **Present** - Hadir
- ⏰ **Late** - Terlambat
- ❌ **Absent** - Tidak hadir
- 🏖️ **Leave** - Cuti

**Chart:**
- 📈 Line/Bar chart kehadiran per hari
- 🎨 Warna berbeda per status
- 📊 Visual yang mudah dipahami

**Average Work Duration:**
- ⏱️ Rata-rata jam kerja per hari
- 💯 Persentase kehadiran

---

## ✅ Best Practices

### DO (Lakukan)
- ✅ Clock-in setiap hari sebelum jam 09:00
- ✅ Pastikan GPS & kamera aktif
- ✅ Ambil foto dengan pencahayaan baik
- ✅ Tunggu GPS terdeteksi sebelum confirm
- ✅ Clock-out saat pulang kerja
- ✅ Check attendance history secara berkala
- ✅ Laporkan jika ada kesalahan data

### DON'T (Jangan)
- ❌ Jangan lupa clock-out
- ❌ Jangan titip absen ke teman
- ❌ Jangan pakai foto orang lain
- ❌ Jangan manipulasi GPS
- ❌ Jangan clock-in dari rumah (untuk office shift)
- ❌ Jangan menggunakan VPN yang mengubah lokasi

---

## 🆘 Troubleshooting

### Problem: "Already clocked in today"

**Penyebab:**
- Anda sudah clock-in hari ini
- Sistem mendeteksi duplikasi

**Solusi:**
1. Cek di Dashboard, apakah sudah ada record hari ini
2. Jika belum clock-out, lakukan clock-out
3. Jika ada kesalahan, hubungi Admin

---

### Problem: "No clock-in record found"

**Penyebab:**
- Belum clock-in tapi langsung clock-out
- Data clock-in hilang

**Solusi:**
1. Lakukan clock-in terlebih dahulu
2. Jika sudah clock-in tapi muncul error, hubungi Admin

---

### Problem: GPS tidak terdeteksi

**Solusi:**
1. **Check Permission:**
   - Chrome → Settings → Privacy → Location → Allow
   - Refresh halaman

2. **Enable Location Services:**
   - Windows: Settings → Privacy → Location → On
   - Mac: System Preferences → Security & Privacy → Location Services

3. **Coba di Luar Ruangan:**
   - Sinyal GPS lebih baik

4. **Last Resort:**
   - Hubungi Admin
   - Admin bisa manual adjust

---

### Problem: Foto tidak terupload

**Solusi:**
1. Check internet connection
2. Pastikan ukuran foto tidak terlalu besar
3. Ambil foto ulang
4. Refresh halaman
5. Clear browser cache

---

### Problem: Status "Outside Radius"

**Arti:**
- Anda clock-in dari luar area kantor
- GPS terdeteksi tapi di luar radius

**Solusi:**
1. Jika memang di kantor:
   - GPS mungkin tidak akurat
   - Coba pindah posisi
   - Clock-in ulang
2. Jika dari rumah (WFH):
   - Hubungi Admin untuk change shift ke WFH
3. Admin akan review dan approve manual

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
- 📧 Email: hr@company.com
- 📱 Phone: +62 xxx xxxx xxxx
- 💬 Chat Admin di sistem

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
