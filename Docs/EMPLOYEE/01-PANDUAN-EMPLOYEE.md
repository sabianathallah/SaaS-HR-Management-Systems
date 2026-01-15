# 👥 PANDUAN PENGGUNAAN SISTEM - EMPLOYEE

> Panduan lengkap untuk karyawan menggunakan Salmon HRIS

---

## 🚀 Mulai Menggunakan Sistem

### 1. Login ke Sistem

1. Buka browser dan akses: `http://localhost:5173/login`
2. Masukkan **Email** dan **Password** yang diberikan oleh HRD
3. Klik tombol **"Login"**
4. Sistem akan otomatis mengarahkan Anda ke **Employee Dashboard**

**Contoh Login:**
```
Email: budi@company.com
Password: password123
```

> 💡 **Tips:** Jika lupa password, hubungi Admin/HRD untuk reset password.

---

## 📱 Tampilan Dashboard Employee

Setelah login, Anda akan melihat halaman **Employee Dashboard** dengan menu:

### Menu Navigasi (Sidebar Kiri)
- 🏠 **Dashboard** - Halaman utama, absensi hari ini
- 📋 **Attendance** - Riwayat absensi lengkap
- 🏖️ **Leave** - Pengajuan cuti & saldo cuti
- ⏰ **Overtime** - Pengajuan lembur
- 🔔 **Notifications** - Pemberitahuan sistem
- 👤 **Profile** - Profil & pengaturan akun

### Header (Kanan Atas)
- 👤 **Nama Anda** - Menampilkan nama & email
- 🔔 **Notifikasi** - Badge jumlah notifikasi belum dibaca
- 🚪 **Logout** - Keluar dari sistem

---

## ✅ Fitur Utama Dashboard

### 1. Status Absensi Hari Ini

**Card "Today's Attendance"** menampilkan:
- ✅ **Status:** Belum Clock-In / On Progress / Sudah Selesai
- ⏰ **Clock In:** Waktu masuk kerja
- ⏰ **Clock Out:** Waktu pulang kerja (jika sudah)
- 📊 **Status Kehadiran:** On Time / Late / On Progress
- ⏱️ **Durasi Kerja:** Total jam kerja (jika sudah clock-out)

### 2. Tombol Aksi
- 🟢 **Clock In** - Untuk absen masuk
- 🔴 **Clock Out** - Untuk absen pulang

### 3. Notifikasi Terbaru
Card **"Recent Notifications"** menampilkan 5 notifikasi terbaru:
- Approval cuti
- Approval lembur
- Pengingat sistem
- Dll.

---

## 📸 Cara Melakukan Absensi

### Clock In (Absen Masuk)

**Langkah-langkah:**

1. **Klik tombol "Clock In"** di Dashboard
2. **Izinkan akses kamera** ketika browser meminta
3. **Izinkan akses lokasi GPS** ketika browser meminta
4. **Ambil foto selfie:**
   - Pastikan wajah Anda terlihat jelas
   - Pencahayaan yang baik
   - Klik tombol "📸 Capture Photo"
5. **Foto akan otomatis terambil** dan GPS akan terdeteksi
6. **Klik "✅ Confirm Clock In"**
7. **Tunggu proses** upload foto & validasi GPS
8. **Selesai!** Status Anda akan berubah menjadi "ON_PROGRESS"

**Validasi GPS:**
- ✅ **Valid** - Anda berada dalam radius kantor
- ⚠️ **Outside Radius** - Anda di luar radius kantor (akan ditandai untuk review admin)
- ❌ **GPS Error** - GPS tidak terdeteksi

> 💡 **Tips:** 
> - Pastikan GPS smartphone/laptop Anda aktif
> - Untuk shift WFH, tidak perlu validasi GPS
> - Foto akan disimpan sebagai bukti kehadiran

---

### Clock Out (Absen Pulang)

**Langkah-langkah:**

1. **Klik tombol "Clock Out"** di Dashboard
2. **Ambil foto selfie lagi** (sama seperti clock-in)
3. **GPS akan terdeteksi otomatis**
4. **Klik "✅ Confirm Clock Out"**
5. **Selesai!** Sistem akan menghitung:
   - ⏱️ Durasi kerja Anda
   - 📊 Status akhir (On Time / Late)
   - 💾 Menyimpan semua data

**Status Akhir:**
- ✅ **ON_TIME** - Clock-in sebelum/tepat jam 09:00
- ⏰ **LATE** - Clock-in setelah jam 09:00

---

## 🏖️ Cara Mengajukan Cuti

1. Klik menu **"Leave"** di sidebar
2. Klik tombol **"+ Request Leave"**
3. Isi form pengajuan:
   - **Tipe Cuti:** Annual Leave / Sick Leave / Permission
   - **Tanggal Mulai:** Kapan cuti dimulai
   - **Tanggal Selesai:** Kapan cuti berakhir
   - **Alasan:** Jelaskan alasan cuti Anda
   - **Attachment:** Upload dokumen pendukung (opsional, untuk sick leave wajib)
4. Klik **"Submit Request"**
5. Tunggu persetujuan dari Admin

**Status Leave Request:**
- 🟡 **PENDING** - Menunggu approval
- ✅ **APPROVED** - Disetujui
- ❌ **REJECTED** - Ditolak

> 💡 **Tips:**
> - Saldo cuti Anda terlihat di bagian atas halaman Leave
> - Untuk Sick Leave, upload surat dokter jika ada
> - Ajukan cuti minimal 3 hari sebelumnya

---

## ⏰ Cara Mengajukan Lembur

1. Klik menu **"Overtime"** di sidebar
2. Klik tombol **"+ Request Overtime"**
3. Isi form pengajuan:
   - **Tanggal Lembur:** Kapan Anda lembur
   - **Jumlah Jam:** Berapa jam lembur
   - **Alasan:** Jelaskan pekerjaan yang memerlukan lembur
4. Klik **"Submit Request"**
5. Tunggu persetujuan dari Admin

**Status Overtime:**
- 🟡 **PENDING** - Menunggu approval
- ✅ **APPROVED** - Disetujui
- ❌ **REJECTED** - Ditolak

---

## 🔔 Notifikasi

Anda akan menerima notifikasi untuk:
- ✅ Cuti Anda disetujui
- ❌ Cuti Anda ditolak
- ✅ Lembur Anda disetujui
- ❌ Lembur Anda ditolak
- 📅 Pengingat absensi
- 🎉 Pengumuman perusahaan

**Cara Melihat Notifikasi:**
1. Klik icon 🔔 di header (badge merah menunjukkan jumlah unread)
2. Atau klik menu **"Notifications"** untuk melihat semua

**Menandai sebagai Dibaca:**
- Klik notifikasi untuk membuka detail
- Otomatis ditandai sebagai "Read"

---

## 👤 Mengelola Profile

### Melihat Profile
1. Klik menu **"Profile"** di sidebar
2. Anda akan melihat informasi:
   - 👤 Nama
   - 📧 Email
   - 🏢 Department
   - 💼 Position
   - 👥 Role
   - 📅 Join Date

### Mengubah Nama
1. Klik tombol **"Edit Profile"**
2. Ubah nama Anda
3. Klik **"Update Profile"**

### Mengubah Password
1. Klik tombol **"Change Password"**
2. Masukkan:
   - Password Lama
   - Password Baru
   - Konfirmasi Password Baru
3. Klik **"Update Password"**

> ⚠️ **Penting:** Password minimal 6 karakter

---

## 📊 Melihat Riwayat Absensi

1. Klik menu **"Attendance"** di sidebar
2. Anda akan melihat:
   - 📅 **Kalender Absensi** - Visual status harian
   - 📋 **Tabel Riwayat** - Detail per hari
   - 📊 **Statistics** - Ringkasan bulanan

### Fitur Statistics
- Klik tombol **"View Statistics"**
- Pilih periode: Monthly / Weekly
- Pilih bulan & tahun
- Lihat grafik:
  - 📈 Total kehadiran
  - ⏰ Jumlah terlambat
  - ❌ Jumlah absent
  - 🏖️ Jumlah cuti

### Detail Attendance
- Klik baris di tabel untuk melihat detail
- Anda bisa lihat:
  - Foto clock-in & clock-out
  - Koordinat GPS
  - Jarak dari kantor
  - Status validasi lokasi

---

## ❓ Tips & Best Practices

### ✅ DO (Lakukan)
- ✅ Clock-in sebelum jam 09:00 untuk status "On Time"
- ✅ Pastikan GPS & kamera aktif saat absensi
- ✅ Ambil foto dengan pencahayaan yang baik
- ✅ Ajukan cuti minimal 3 hari sebelumnya
- ✅ Check notifikasi secara berkala
- ✅ Ganti password secara berkala

### ❌ DON'T (Jangan)
- ❌ Jangan lupa clock-out saat pulang
- ❌ Jangan share password ke orang lain
- ❌ Jangan menitipkan absen ke teman
- ❌ Jangan menggunakan foto orang lain
- ❌ Jangan manipulasi lokasi GPS

---

## 🆘 Troubleshooting

### Masalah: Kamera tidak muncul
**Solusi:**
1. Pastikan browser memiliki akses ke kamera
2. Chrome: Settings → Privacy → Camera → Allow
3. Refresh halaman dan coba lagi

### Masalah: GPS tidak terdeteksi
**Solusi:**
1. Pastikan Location Services aktif di device Anda
2. Browser memiliki permission untuk akses lokasi
3. Jika masih error, hubungi Admin

### Masalah: Foto tidak terupload
**Solusi:**
1. Cek koneksi internet Anda
2. Pastikan ukuran foto tidak terlalu besar
3. Coba ambil foto ulang
4. Refresh halaman jika perlu

### Masalah: Lupa password
**Solusi:**
1. Hubungi Admin/HRD
2. Minta reset password
3. Admin akan memberikan password baru

### Masalah: Notifikasi tidak muncul
**Solusi:**
1. Refresh halaman
2. Logout dan login kembali
3. Clear browser cache jika perlu

---

## 📞 Butuh Bantuan?

Jika Anda mengalami masalah atau ada pertanyaan:

1. **Cek FAQ** - [FAQ Employee](./06-FAQ.md)
2. **Hubungi Admin/HRD:**
   - Email: hr@company.com
   - Phone: +62 xxx xxxx xxxx
3. **Jam Operasional Support:**
   - Senin - Jumat: 08:00 - 17:00 WIB

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
