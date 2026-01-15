# ⏰ FITUR OVERTIME (LEMBUR) - EMPLOYEE

> Panduan lengkap pengajuan lembur karyawan

---

## 🎯 Overview

Sistem Overtime memungkinkan karyawan untuk:
- 📝 Mengajukan permohonan lembur
- ⏱️ Mencatat jam lembur
- 💰 Tracking kompensasi lembur
- 📊 Melihat riwayat lembur

---

## 📋 Tentang Overtime

### Apa itu Overtime?

Overtime (lembur) adalah waktu kerja di luar jam kerja normal yang diajukan oleh karyawan dan memerlukan persetujuan Admin/Manager.

**Jam Kerja Normal:**
- 09:00 - 17:00 (8 jam)

**Overtime:**
- Sebelum 09:00 atau
- Setelah 17:00 atau
- Weekend/Holiday

---

### Jenis Overtime

**1. Weekday Overtime**
- Lembur di hari kerja normal (Mon-Fri)
- Biasanya rate: 1.5x gaji per jam

**2. Weekend Overtime**
- Lembur di akhir pekan (Sat-Sun)
- Biasanya rate: 2x gaji per jam

**3. Holiday Overtime**
- Lembur di hari libur nasional
- Biasanya rate: 3x gaji per jam

> 💡 **Note:** Rate overtime tergantung kebijakan perusahaan Anda.

---

## ✅ Cara Mengajukan Overtime

### Step-by-Step Guide

#### Step 1: Buka Halaman Overtime
1. Klik menu **"Overtime"** di sidebar
2. Anda akan melihat halaman Overtime Management

---

#### Step 2: Klik Request Overtime
1. Klik tombol **"+ Request Overtime"**
2. Form popup akan muncul

---

#### Step 3: Isi Form Overtime

```
┌─────────────────────────────────────┐
│  ⏰ Overtime Request Form           │
├─────────────────────────────────────┤
│                                     │
│  Overtime Date: *                  │
│  [DD/MM/YYYY]                      │
│                                     │
│  Requested Hours: *                │
│  [___] hours                       │
│  (Max: 4 hours per day)            │
│                                     │
│  Reason: *                         │
│  ┌─────────────────────────────┐  │
│  │ Jelaskan alasan lembur...   │  │
│  │                             │  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                     │
│  [ Cancel ]  [ Submit Request ]    │
└─────────────────────────────────────┘

* Required fields
```

---

#### Step 4: Field Validation

**Overtime Date:**
- Required: ✅
- Format: DD/MM/YYYY
- Date picker available
- Bisa past date (jika lupa submit)
- Bisa future date (planning ahead)

**Requested Hours:**
- Required: ✅
- Type: Number (decimal allowed)
- Range: 0.5 - 4 jam (biasanya)
- Examples: 1, 1.5, 2, 3, 4
- Validation: Max per day sesuai policy

**Reason:**
- Required: ✅
- Min length: 20 karakter
- Jelaskan pekerjaan yang memerlukan lembur
- Contoh: "Menyelesaikan laporan quarter 4 yang deadline besok"

---

#### Step 5: Submit Request
1. Pastikan semua field terisi
2. Klik **"Submit Request"**
3. Loading akan muncul
4. Tunggu konfirmasi

---

#### Step 6: Konfirmasi
- ✅ **Success:** "Overtime request submitted successfully!"
- ❌ **Error:** Pesan error akan muncul

---

## 📊 Status Overtime Request

### Status yang Mungkin Muncul

| Status | Icon | Arti | Action |
|--------|------|------|--------|
| **PENDING** | 🟡 | Menunggu approval | Tunggu admin review |
| **APPROVED** | ✅ | Disetujui | Lembur dikonfirmasi, akan masuk payroll |
| **REJECTED** | ❌ | Ditolak | Lembur tidak disetujui |

---

### Timeline Status

```
Submit Request
    ↓
🟡 PENDING (Waiting for admin review)
    ↓
Admin Review
    ├─ Approve → ✅ APPROVED
    │            └─ Masuk ke payroll calculation
    │
    └─ Reject  → ❌ REJECTED
                 └─ Tidak dihitung
```

---

## 📋 Melihat Riwayat Overtime

### Overtime History Table

```
┌────────────────────────────────────────────────────────┐
│  ⏰ Overtime Request History                           │
├─────┬────────────┬──────┬────────────┬────────────────┤
│ ID  │ Date       │ Hours│ Reason     │ Status         │
├─────┼────────────┼──────┼────────────┼────────────────┤
│ #15 │ 14/01/2026 │ 3h   │ Report Q4  │ ✅ APPROVED   │
│ #14 │ 10/01/2026 │ 2h   │ Bug fixing │ 🟡 PENDING    │
│ #13 │ 05/01/2026 │ 4h   │ Deployment │ ✅ APPROVED   │
│ #12 │ 28/12/2025 │ 2h   │ Testing    │ ❌ REJECTED   │
└─────┴────────────┴──────┴────────────┴────────────────┘
```

**Columns:**
- **ID:** Nomor request
- **Date:** Tanggal lembur
- **Requested Hours:** Jam lembur yang diajukan
- **Approved Hours:** Jam yang disetujui (bisa beda)
- **Reason:** Alasan lembur
- **Status:** PENDING / APPROVED / REJECTED
- **Approved By:** Admin yang approve
- **Action:** View details

---

## 💰 Kompensasi Overtime

### Perhitungan Kompensasi

**Formula Dasar:**
```
Kompensasi = Requested Hours × Hourly Rate × Overtime Multiplier

Contoh:
Gaji Bulanan: Rp 10,000,000
Hari Kerja/Bulan: 22 hari
Jam Kerja/Hari: 8 jam

Hourly Rate = 10,000,000 / (22 × 8) = Rp 56,818 per jam

Weekday Overtime (3 jam):
= 3 × 56,818 × 1.5
= Rp 255,681

Weekend Overtime (3 jam):
= 3 × 56,818 × 2
= Rp 340,908
```

---

### Overtime Multiplier

| Jenis | Hari | Multiplier | Example |
|-------|------|------------|---------|
| **Weekday** | Mon-Fri | 1.5x | Rp 85,227/jam |
| **Weekend** | Sat-Sun | 2x | Rp 113,636/jam |
| **Holiday** | Libur Nasional | 3x | Rp 170,454/jam |

> 💡 **Note:** Multiplier bisa berbeda tergantung kebijakan perusahaan.

---

## 🔔 Notifikasi Overtime

### Notifikasi yang Diterima

**1. Request Submitted:**
```
📬 Overtime request submitted
Your overtime request for 3 hours on 14/01/2026 
has been submitted and is waiting for approval.
```

**2. Request Approved:**
```
✅ Overtime request approved
Your overtime request #15 for 3 hours has been 
approved by Admin.
Compensation: Rp 255,681
```

**3. Request Rejected:**
```
❌ Overtime request rejected
Your overtime request #14 has been rejected.
Reason: Not enough budget for overtime this month.
```

**4. Request Modified:**
```
⚠️ Overtime request modified
Your overtime request #15 has been approved with 
modification:
Requested: 4 hours
Approved: 3 hours
Please check the details.
```

---

## ⚠️ Validasi & Batasan

### Validasi Saat Submit

**1. Check Max Hours:**
```javascript
if (requestedHours > maxHoursPerDay) {
  Error: "Overtime hours cannot exceed 4 hours per day"
}
```

**2. Check Date:**
```javascript
if (overtimeDate > today + 30days) {
  Error: "Cannot request overtime more than 30 days in advance"
}
```

**3. Check Duplicate:**
```javascript
if (alreadyHasOvertimeOnDate) {
  Error: "You already have overtime request on this date"
}
```

**4. Check Reason Length:**
```javascript
if (reason.length < 20) {
  Error: "Reason must be at least 20 characters"
}
```

---

## 📊 Overtime Statistics

### Monthly Summary

Di halaman Overtime, Anda bisa lihat summary bulanan:

```
┌─────────────────────────────────────┐
│  📊 Overtime Summary - January 2026 │
├─────────────────────────────────────┤
│  Total Requests:     8              │
│  Approved:           6 (75%)        │
│  Pending:            1 (12.5%)      │
│  Rejected:           1 (12.5%)      │
│                                     │
│  Total Hours:        18 hours       │
│  Approved Hours:     15 hours       │
│                                     │
│  Estimated Comp.:    Rp 1,278,405   │
└─────────────────────────────────────┘
```

---

### View by Period

**Filter Options:**
- 📅 This Month
- 📅 Last Month
- 📅 Last 3 Months
- 📅 Custom Date Range

---

## ✅ Best Practices

### DO (Lakukan)
- ✅ Submit overtime request sesegera mungkin
- ✅ Berikan alasan yang jelas dan detail
- ✅ Catat waktu mulai & selesai lembur
- ✅ Koordinasi dengan atasan sebelum lembur
- ✅ Monitor approval status
- ✅ Keep evidence of work (email, commit, dll)

### DON'T (Jangan)
- ❌ Lembur tanpa approval
- ❌ Bohong tentang jam lembur
- ❌ Submit overtime untuk pekerjaan normal
- ❌ Tidak komunikasi dengan team
- ❌ Lupa submit overtime request
- ❌ Request overtime untuk hal pribadi

---

## 💡 Tips Overtime

### Agar Request Diapprove

1. **Alasan Jelas:**
   - Bad: "Lembur"
   - Good: "Menyelesaikan bug critical di production yang reported oleh client ABC, estimated 3 jam untuk investigation & fixing"

2. **Planning Ahead:**
   - Submit request sebelum lembur (jika possible)
   - Emergency overtime: submit segera setelah lembur

3. **Reasonable Hours:**
   - Jangan request 8 jam overtime
   - Keep it realistic (1-4 jam)

4. **Koordinasi:**
   - Inform atasan sebelum lembur
   - Get verbal approval dulu

---

## ❓ FAQ Overtime

### Q: Bisa request overtime untuk kemarin?

**A:** Ya, bisa. Tapi lebih baik submit sesegera mungkin setelah lembur. Jangan terlalu lama (max 7 hari).

---

### Q: Berapa maksimal jam lembur per bulan?

**A:** Tergantung kebijakan perusahaan. Biasanya max 40-50 jam per bulan. Check dengan HRD.

---

### Q: Overtime weekend rate berbeda?

**A:** Ya, biasanya weekend rate 2x, weekday 1.5x. Check kebijakan perusahaan Anda.

---

### Q: Bisa cancel overtime request?

**A:** Jika masih PENDING, hubungi Admin untuk cancel. Jika sudah APPROVED, sulit untuk cancel.

---

### Q: Overtime dibayar kapan?

**A:** Biasanya masuk di payroll bulan berikutnya. Approved overtime bulan Januari akan dibayar di gaji Februari.

---

### Q: Admin approve hanya 2 jam, tapi request 3 jam?

**A:** Admin bisa modify jam yang diapprove. Anda akan dapat notifikasi. Bisa diskusi dengan Admin jika tidak setuju.

---

### Q: Lembur tapi tidak submit request, gimana?

**A:** Tidak akan dihitung dan dibayar. Overtime HARUS ada approval tertulis via sistem.

---

## 🆘 Troubleshooting

### Problem: Request tidak bisa submit

**Solusi:**
1. Pastikan semua field terisi
2. Check jam tidak melebihi maksimal
3. Check alasan minimal 20 karakter
4. Refresh halaman
5. Logout & login kembali

---

### Problem: "Already have overtime on this date"

**Solusi:**
- Anda sudah ada request untuk tanggal tersebut
- Check di history
- Jika ingin tambah jam, edit request yang ada (hubungi Admin)

---

### Problem: Overtime tidak muncul di payroll

**Solusi:**
1. Check status = APPROVED (bukan PENDING)
2. Check bulan approval (masuk payroll bulan berikutnya)
3. Hubungi Finance/HRD

---

## 📞 Butuh Bantuan?

Hubungi:
- 📧 Email: hr@company.com
- 📱 Phone: +62 xxx xxxx xxxx

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
