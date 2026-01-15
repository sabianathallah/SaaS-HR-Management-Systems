# 🏖️ FITUR LEAVE REQUEST (CUTI) - EMPLOYEE

> Panduan lengkap pengajuan cuti karyawan

---

## 🎯 Overview

Sistem Leave Request memungkinkan karyawan untuk:
- 📝 Mengajukan permohonan cuti
- 📊 Memantau saldo cuti
- 📋 Melihat riwayat cuti
- 📧 Menerima notifikasi approval

---

## 📊 Saldo Cuti (Leave Balance)

### Quota System

Setiap karyawan memiliki:
- **Annual Leave Quota:** 12 hari per tahun (default)
- **Used Leave Quota:** Jumlah cuti yang sudah digunakan
- **Remaining Leave Quota:** Sisa cuti yang bisa diambil

**Formula:**
```
Remaining = Annual Quota - Used Quota
Remaining = 12 - 3 = 9 hari
```

### Cara Melihat Saldo Cuti

1. Klik menu **"Leave"** di sidebar
2. Di bagian atas halaman, Anda akan lihat card:

```
┌─────────────────────────────────────┐
│  📊 Your Leave Balance              │
├─────────────────────────────────────┤
│  Annual Quota:     12 days          │
│  Used:             3 days           │
│  Remaining:        9 days           │
└─────────────────────────────────────┘
```

---

## 📝 Jenis-Jenis Cuti

### 1. Annual Leave (Cuti Tahunan)

**Keterangan:**
- Cuti reguler untuk keperluan pribadi
- Menggunakan quota tahunan
- Perlu approval admin
- Bisa diajukan untuk liburan, acara keluarga, dll

**Syarat:**
- Saldo cuti masih ada
- Diajukan minimal 3 hari sebelumnya
- Attachment tidak wajib

---

### 2. Sick Leave (Cuti Sakit)

**Keterangan:**
- Cuti karena sakit
- Menggunakan quota tahunan
- Perlu surat dokter (recommended)
- Bisa diajukan mendadak

**Syarat:**
- Saldo cuti masih ada (atau bisa minus untuk emergency)
- Upload surat dokter jika lebih dari 2 hari
- Attachment sangat direkomendasikan

---

### 3. Permission (Izin)

**Keterangan:**
- Izin singkat (tidak deduct quota)
- Untuk keperluan mendesak
- Durasi biasanya < 1 hari

**Syarat:**
- Tidak menggunakan quota (free)
- Harus ada alasan jelas
- Approval lebih cepat

---

## ✅ Cara Mengajukan Cuti

### Step-by-Step Guide

#### Step 1: Buka Halaman Leave
1. Klik menu **"Leave"** di sidebar
2. Anda akan melihat halaman Leave Management

#### Step 2: Klik Request Leave
1. Klik tombol **"+ Request Leave"**
2. Form popup akan muncul

#### Step 3: Isi Form Cuti

```
┌─────────────────────────────────────┐
│  📝 Leave Request Form              │
├─────────────────────────────────────┤
│  Leave Type: [Annual Leave ▼]      │
│                                     │
│  Start Date: [DD/MM/YYYY]          │
│                                     │
│  End Date:   [DD/MM/YYYY]          │
│                                     │
│  Reason:                           │
│  ┌─────────────────────────────┐  │
│  │ Jelaskan alasan cuti...     │  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                     │
│  Attachment: [Choose File]         │
│                                     │
│  [ Cancel ]  [ Submit Request ]    │
└─────────────────────────────────────┘
```

**Field Explanation:**

**Leave Type:**
- Pilih jenis cuti: Annual Leave / Sick Leave / Permission
- Dropdown selection

**Start Date:**
- Tanggal mulai cuti
- Format: DD/MM/YYYY
- Date picker available

**End Date:**
- Tanggal selesai cuti
- Harus >= Start Date
- Otomatis calculate jumlah hari

**Reason:**
- Jelaskan alasan cuti Anda
- Minimal 10 karakter
- Bersifat wajib
- Contoh: "Liburan keluarga ke Bali"

**Attachment:**
- Upload dokumen pendukung (optional)
- Untuk Sick Leave: Upload surat dokter
- Supported formats: PDF, JPG, PNG
- Max size: 5MB

#### Step 4: Submit Request
1. Pastikan semua field sudah terisi
2. Klik tombol **"Submit Request"**
3. Loading akan muncul
4. Tunggu konfirmasi

#### Step 5: Konfirmasi
- ✅ **Success:** "Leave request submitted successfully!"
- ❌ **Error:** Pesan error akan muncul

---

## 📋 Melihat Riwayat Cuti

### Leave Request List

Di halaman Leave, Anda akan melihat tabel riwayat:

```
┌────────────────────────────────────────────────────────────┐
│  📋 Leave Request History                                  │
├─────┬────────────┬────────────┬──────────┬────────────────┤
│ ID  │ Start Date │ End Date   │ Days     │ Status         │
├─────┼────────────┼────────────┼──────────┼────────────────┤
│ #12 │ 01/02/2026 │ 03/02/2026 │ 3 days   │ ✅ APPROVED   │
│ #11 │ 15/01/2026 │ 16/01/2026 │ 2 days   │ 🟡 PENDING    │
│ #10 │ 20/12/2025 │ 27/12/2025 │ 8 days   │ ✅ APPROVED   │
│ #09 │ 10/11/2025 │ 11/11/2025 │ 2 days   │ ❌ REJECTED   │
└─────┴────────────┴────────────┴──────────┴────────────────┘
```

**Columns:**
- **ID:** Nomor request
- **Leave Type:** Jenis cuti
- **Start Date:** Tanggal mulai
- **End Date:** Tanggal selesai
- **Days:** Total hari (auto calculate)
- **Reason:** Alasan cuti
- **Status:** PENDING / APPROVED / REJECTED
- **Action:** View details

---

## 🔔 Status & Notifikasi

### Status Leave Request

| Status | Icon | Arti | Action |
|--------|------|------|--------|
| **PENDING** | 🟡 | Menunggu approval | Tunggu admin review |
| **APPROVED** | ✅ | Disetujui | Cuti bisa diambil |
| **REJECTED** | ❌ | Ditolak | Cuti tidak disetujui |

---

### Timeline Status

```
Submit Request
    ↓
🟡 PENDING (Waiting for admin review)
    ↓
Admin Review
    ├─ Approve → ✅ APPROVED
    └─ Reject  → ❌ REJECTED
```

---

### Notifikasi yang Diterima

**1. Request Submitted:**
```
📬 Leave request submitted
Your leave request #12 has been submitted 
and is waiting for approval.
```

**2. Request Approved:**
```
✅ Leave request approved
Your leave request #12 for 3 days has been 
approved by Admin.
```

**3. Request Rejected:**
```
❌ Leave request rejected
Your leave request #12 has been rejected.
Reason: Insufficient leave balance.
```

---

## 📊 Perhitungan Hari Cuti

### Auto Calculate Days

Sistem otomatis menghitung jumlah hari:

**Contoh 1:**
```
Start Date: 01/02/2026 (Monday)
End Date:   05/02/2026 (Friday)
Days:       5 days (Mon-Fri)
```

**Contoh 2:**
```
Start Date: 15/02/2026 (Monday)
End Date:   15/02/2026 (Monday)
Days:       1 day
```

**Exclude Weekends:** (Optional, tergantung konfigurasi)
- Sabtu & Minggu bisa dikecualikan
- Hanya hari kerja yang dihitung

---

## ⚠️ Validasi & Batasan

### Validasi Saat Submit

**1. Check Saldo Cuti:**
```javascript
if (requestedDays > remainingQuota) {
  Error: "Insufficient leave balance"
}
```

**2. Check Tanggal:**
```javascript
if (endDate < startDate) {
  Error: "End date must be after start date"
}

if (startDate < today) {
  Error: "Cannot request leave for past dates"
}
```

**3. Check Overlapping:**
```javascript
if (hasOverlappingLeave) {
  Error: "You already have approved leave in this period"
}
```

---

## 📥 Upload Attachment

### Cara Upload Dokumen

**Step 1: Choose File**
1. Klik tombol **"Choose File"**
2. Pilih file dari komputer Anda
3. File akan ter-preview

**Step 2: Preview**
- Nama file akan muncul
- Ukuran file ditampilkan
- Bisa replace jika salah

**Step 3: Submit**
- File akan otomatis ter-upload saat submit request

---

### Supported Formats

| Format | Extension | Max Size | Usage |
|--------|-----------|----------|-------|
| PDF | `.pdf` | 5 MB | Surat dokter, dokumen |
| Image | `.jpg`, `.jpeg` | 5 MB | Scan dokumen |
| Image | `.png` | 5 MB | Screenshot, scan |

---

### Tips Upload

- ✅ Scan dokumen dengan jelas
- ✅ Pastikan file tidak blur
- ✅ Compress jika terlalu besar
- ✅ Gunakan PDF untuk dokumen penting
- ❌ Jangan upload file corrupt

---

## ❓ FAQ Leave Request

### Q: Berapa lama proses approval?

**A:** Biasanya < 24 jam kerja. Jika urgent, hubungi Admin langsung.

---

### Q: Bisa cancel leave request yang sudah submit?

**A:** Jika masih PENDING, hubungi Admin untuk cancel. Jika sudah APPROVED, perlu pengajuan cancel terpisah.

---

### Q: Quota cuti hangus jika tidak dipakai?

**A:** Tergantung kebijakan perusahaan. Biasanya hangus di akhir tahun atau bisa carry over.

---

### Q: Bisa ajukan cuti untuk besok?

**A:** Untuk Annual Leave, sebaiknya minimal 3 hari sebelumnya. Untuk Sick Leave atau emergency, bisa mendadak.

---

### Q: Saldo cuti saya minus, kenapa?

**A:** Emergency sick leave bisa membuat saldo minus. Akan dipotong dari quota tahun depan atau dari gaji.

---

### Q: Attachment wajib atau tidak?

**A:** 
- Annual Leave: Optional
- Sick Leave > 2 hari: Wajib (surat dokter)
- Permission: Optional

---

## ✅ Best Practices

### DO (Lakukan)
- ✅ Ajukan cuti jauh-jauh hari
- ✅ Berikan alasan yang jelas
- ✅ Upload surat dokter untuk sick leave
- ✅ Check saldo cuti sebelum request
- ✅ Koordinasi dengan team sebelum cuti
- ✅ Monitor status approval

### DON'T (Jangan)
- ❌ Ajukan cuti mendadak tanpa alasan
- ❌ Bohong tentang alasan cuti
- ❌ Request cuti saat saldo habis
- ❌ Lupa upload dokumen penting
- ❌ Tidak check email/notifikasi

---

## 🆘 Troubleshooting

### Problem: "Insufficient leave balance"

**Solusi:**
1. Check saldo cuti Anda
2. Kurangi jumlah hari cuti
3. Atau gunakan "Permission" yang tidak deduct quota
4. Hubungi HRD untuk tambah quota (jika ada kebijakan)

---

### Problem: Request tidak bisa submit

**Solusi:**
1. Pastikan semua field terisi
2. Check tanggal (end >= start)
3. Check internet connection
4. Refresh halaman
5. Logout & login kembali

---

### Problem: Attachment tidak terupload

**Solusi:**
1. Check ukuran file (max 5MB)
2. Check format file (PDF, JPG, PNG)
3. Compress file jika terlalu besar
4. Try different browser
5. Hubungi Admin jika tetap error

---

## 📞 Butuh Bantuan?

Hubungi:
- 📧 Email: hr@company.com
- 📱 Phone: +62 xxx xxxx xxxx

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
