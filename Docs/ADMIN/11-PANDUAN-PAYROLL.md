# 💰 Panduan Sistem Payroll - Admin & Finance

## Daftar Isi
- [Pengenalan](#pengenalan)
- [Persiapan Awal](#persiapan-awal)
- [Proses Payroll Bulanan](#proses-payroll-bulanan)
- [Pengaturan Komponen Gaji](#pengaturan-komponen-gaji)
- [Pengaturan BPJS & Pajak](#pengaturan-bpjs--pajak)
- [Pengelolaan Adjustment](#pengelolaan-adjustment)
- [Monitoring & Reporting](#monitoring--reporting)
- [Troubleshooting](#troubleshooting)

---

## Pengenalan

Sistem Payroll terintegrasi dengan **Midtrans Iris** untuk melakukan disbursement (transfer gaji) otomatis ke rekening karyawan.

### Fitur Utama
✅ Perhitungan gaji otomatis (pro-rata, overtime, tunjangan)  
✅ Perhitungan BPJS & PPh21 otomatis  
✅ Transfer gaji otomatis via Midtrans  
✅ Generate slip gaji otomatis  
✅ Manual adjustment (bonus, potongan, backpay)  
✅ Audit trail lengkap  

### Role & Permission
- **Admin/HR**: Full access (create, edit, approve)
- **Finance**: Approve & process payment
- **Employee**: View own payslips only

---

## Persiapan Awal

### 1. Setup Data Karyawan

Sebelum run payroll, pastikan data karyawan sudah lengkap:

#### a. Base Salary
Setiap karyawan harus punya gaji pokok.

**Steps:**
1. Menu: **Settings > Payroll > Employees**
2. Pilih karyawan
3. Klik **Edit Base Salary**
4. Input gaji pokok baru
5. Save

#### b. Bank Account Info
Karyawan harus punya data rekening untuk transfer.

**Required fields:**
- Bank Name (e.g., "BCA", "Mandiri")
- Account Number
- Account Holder Name

**Steps:**
1. Menu: **Users > Employee List**
2. Edit employee
3. Tab **Payroll Info**
4. Isi data bank
5. Save

#### c. Tax Info (Optional but recommended)
- Marital Status (single/married)
- Number of Dependents (0-3)
- Tax ID (NPWP) - optional

---

### 2. Setup Payroll Components

#### a. Tunjangan (Allowances)
Buat komponen tunjangan yang akan digunakan.

**Default Components:**
- ✅ Tunjangan Transport
- ✅ Tunjangan Makan
- ✅ Tunjangan Komunikasi
- ✅ Tunjangan Kesehatan
- ✅ Tunjangan Jabatan

**Add New Component:**
1. Menu: **Settings > Payroll > Components**
2. Klik **+ Add Component**
3. Fill form:
   - Code: `ALLOW_XXX`
   - Name: Display name
   - Type: **Earning**
   - Calculation Type: **Fixed**
   - Default Amount: Amount in IDR
4. Save

#### b. Assign Components to Employees
1. Menu: **Settings > Payroll > Employees**
2. Pilih employee
3. Tab **Salary Components**
4. Klik **+ Assign Component**
5. Pilih component & amount
6. Set effective date
7. Save

---

### 3. Setup Tax & BPJS Settings

#### Tax Settings
Default sudah diset untuk tahun 2026. Jika perlu update:

1. Menu: **Settings > Payroll > Tax Settings**
2. Edit PTKP amounts atau Tax Brackets
3. Save

#### BPJS Settings
Default rates sudah sesuai peraturan. Jika ada perubahan:

1. Menu: **Settings > Payroll > BPJS Settings**
2. Edit percentages
3. Save

---

## Proses Payroll Bulanan

### Timeline
```
Tanggal 1-19  : Periode attendance & overtime
Tanggal 20    : Cut-off data
Tanggal 20-23 : HR generate & review payroll
Tanggal 23-24 : Finance approve
Tanggal 24-25 : Finance process payment
Tanggal 25    : Transfer ke rekening karyawan
```

---

### Step 1: Create Payroll Period

**When:** Awal bulan atau H-5 sebelum cutoff

**Steps:**
1. Menu: **Payroll > Periods**
2. Klik **+ Create Period**
3. Fill form:
   ```
   Period Name: January 2026
   Period Start: 2025-12-21 (tanggal 21 bulan sebelumnya)
   Period End: 2026-01-20 (tanggal 20 bulan ini)
   Cutoff Date: 2026-01-20
   Payment Date: 2026-01-25
   Notes: (optional)
   ```
4. Klik **Create**

**Status:** Draft

---

### Step 2: Generate Payrolls

**When:** Tanggal 20 setelah cutoff

**Steps:**
1. Menu: **Payroll > Periods**
2. Pilih period yang baru dibuat
3. Klik **Generate Payrolls**
4. Sistem akan:
   - Hitung gaji semua karyawan aktif
   - Hitung pro-rata jika ada yang join/resign
   - Hitung overtime dari data approved
   - Hitung tunjangan & bonus
   - Hitung BPJS & PPh21
   - Create payroll records

**Duration:** ~1-2 menit untuk 50 karyawan

**Result:**
```
✅ Generated 50 payrolls successfully
Total Gross: Rp 250,000,000
Total Deductions: Rp 50,000,000
Total Net: Rp 200,000,000
```

**Status berubah:** Draft → **Pending Review**

---

### Step 3: Review & Adjust Payrolls

**When:** Tanggal 20-23

**Steps:**
1. Menu: **Payroll > Periods > [Select Period]**
2. View list semua payrolls
3. Check detail per employee:
   - Gaji pokok
   - Overtime hours & pay
   - Tunjangan
   - BPJS & Tax
   - Net salary

#### Add Manual Adjustment (jika perlu)

**Use Cases:**
- Bonus kinerja
- THR
- Potongan keterlambatan
- Backpay (koreksi bulan lalu)
- Cicilan pinjaman

**Steps:**
1. Klik employee name
2. Tab **Adjustments**
3. Klik **+ Add Adjustment**
4. Fill form:
   ```
   Type: Earning / Deduction
   Reason: "Bonus Kinerja Q1"
   Amount: 2000000
   Description: Detail explanation
   Is Backpay: No (atau Yes jika koreksi)
   Reference Month: (jika backpay)
   ```
5. Save

**Note:** Adjustment akan otomatis update total gross/net salary

---

### Step 4: Submit for Approval

**When:** Setelah semua review selesai

**Steps:**
1. Menu: **Payroll > Periods > [Select Period]**
2. Klik **Submit for Approval**
3. Confirm

**Status berubah:** Pending Review → **Approved** (auto-approve untuk sekarang)

---

### Step 5: Approve Payroll (Finance)

**When:** Tanggal 23-24

**Steps:**
1. Menu: **Payroll > Periods**
2. Filter status: **Pending Review**
3. Review summary:
   - Total employees
   - Total amount
   - Check for anomalies
4. Klik **Approve**
5. Add notes (optional)
6. Confirm

**Status:** Approved

---

### Step 6: Process Payment (Finance)

**When:** Tanggal 24-25 (sesuai payment date)

**⚠️ IMPORTANT:** Pastikan saldo cukup di akun Midtrans!

**Steps:**
1. Menu: **Payroll > Periods > [Select Period]**
2. Tab **Payment**
3. Review:
   - Total payout amount
   - Number of employees
   - Bank account list
4. Klik **Process Payment**
5. Sistem akan:
   - Create batch disbursement di Midtrans
   - Get batch ID
   - Send transfer requests
6. Confirm

**Status berubah:** Approved → **Processing**

**What happens:**
- Midtrans creates beneficiaries (rekening karyawan)
- Midtrans executes batch transfer
- Usually takes 1-24 hours
- Webhook callback updates status automatically

---

### Step 7: Monitor Payment Status

**Real-time Updates:**

Sistem akan otomatis update status via webhook dari Midtrans:

| Status | Meaning |
|--------|---------|
| Processing | Transfer sedang diproses |
| Paid | ✅ Berhasil transfer |
| Failed | ❌ Gagal transfer |

**Check Status:**
1. Menu: **Payroll > Periods > [Select Period]**
2. Tab **Payment Status**
3. View individual status per employee

**If Payment Failed:**
1. Check error message
2. Common issues:
   - Invalid bank account
   - Insufficient balance
   - Bank system down
3. Fix issue
4. Retry payment (manual atau contact support)

---

### Step 8: Generate Payslips

**When:** After payment completed

**Steps:**
1. Menu: **Payroll > Periods > [Select Period]**
2. Klik **Generate Payslips**
3. Sistem akan create PDF/HTML slip gaji untuk semua karyawan
4. Employees dapat download dari app mereka

**Auto-notification:**
- Email (jika enabled)
- In-app notification
- "Gaji Anda untuk periode January 2026 sudah ditransfer!"

---

## Pengaturan Komponen Gaji

### Tunjangan Tetap (Fixed Allowance)

**Example:** Tunjangan Transport Rp 500,000/bulan

**Setup:**
1. Create component (one-time)
2. Assign to employees
3. Will auto-calculate every month

### Tunjangan Variabel (Variable Allowance)

**Example:** Bonus berdasarkan performa

**Setup:**
1. Add via **Manual Adjustment** setiap bulan
2. Atau create component dengan default 0, update amount per employee

### Potongan Tetap (Fixed Deduction)

**Example:** Cicilan pinjaman Rp 500,000/bulan selama 12 bulan

**Setup:**
1. Create component type: **Deduction**
2. Assign to employee
3. Set **End Date** (e.g., 12 months from now)
4. Will auto-stop after end date

---

## Pengaturan BPJS & Pajak

### BPJS Calculation

**Automatic Components:**
1. **BPJS Kesehatan**
   - Employee: 1% (max base: 12 juta)
   - Company: 4%

2. **BPJS Ketenagakerjaan**
   - JKK: 0.24% (company)
   - JKM: 0.30% (company)
   - JHT: 2% (employee) + 3.7% (company)
   - JP: 1% (employee) + 2% (company, max base: 9.077 juta)

**Update Rates:**
If government changes rates:
1. Menu: **Settings > Payroll > BPJS Settings**
2. Edit percentages
3. Save
4. Will apply to next payroll generation

---

### PPh21 Tax Calculation

**Automatic based on:**
- Employee's marital status
- Number of dependents
- Gross salary

**PTKP Mapping:**
- Single, 0 tanggungan = TK0 (54 juta/tahun)
- Single, 1 tanggungan = TK1 (58.5 juta/tahun)
- Married, 0 tanggungan = K0 (58.5 juta/tahun)
- Married, 1 tanggungan = K1 (63 juta/tahun)
- dst.

**Progressive Tax Brackets:**
| Income/Year | Rate |
|-------------|------|
| 0 - 60 jt | 5% |
| 60 - 250 jt | 15% |
| 250 - 500 jt | 25% |
| 500 jt - 5 M | 30% |
| > 5 M | 35% |

---

## Pengelolaan Adjustment

### Bonus

**Steps:**
1. Select employee payroll
2. Add adjustment
3. Type: **Earning**
4. Reason: "Bonus Kinerja Q1 2026"
5. Amount: 2,000,000
6. Save

### Potongan Khusus

**Steps:**
1. Select employee payroll
2. Add adjustment
3. Type: **Deduction**
4. Reason: "Potongan Keterlambatan"
5. Amount: 100,000
6. Save

### Backpay (Koreksi Bulan Lalu)

**Example:** Lupa kasih bonus bulan lalu, dibayar bulan ini

**Steps:**
1. Select current month payroll
2. Add adjustment
3. Type: **Earning**
4. Reason: "Backpay - Bonus December"
5. Amount: 1,500,000
6. **Is Backpay:** ✅ Yes
7. **Reference Month:** December 2025
8. Save

---

## Monitoring & Reporting

### Dashboard Metrics

**Payroll Summary:**
- Total employees paid
- Total gross salary
- Total net salary
- Average salary
- Tax collected
- BPJS collected

### Reports

**Available Reports:**
1. **Monthly Payroll Report**
   - Summary per period
   - Export to Excel/PDF

2. **Employee Salary Report**
   - Individual salary breakdown
   - Year-to-date totals

3. **Tax Report**
   - Total PPh21 per month
   - Per employee tax report
   - For SPT submission

4. **BPJS Report**
   - BPJS contribution summary
   - For BPJS monthly reporting

5. **Component Report**
   - Allowance breakdown
   - Deduction breakdown

**Export:**
- Excel (for accounting)
- PDF (for archive)
- CSV (for data analysis)

---

## Troubleshooting

### ❌ Error: "Employee has no base salary"

**Solution:**
1. Go to employee profile
2. Set base salary
3. Re-generate payroll

---

### ❌ Payment Failed: "Invalid bank account"

**Solution:**
1. Verify employee's bank account number
2. Update correct account
3. Retry payment or contact employee

---

### ❌ "BPJS calculation seems wrong"

**Check:**
1. Settings > BPJS Settings
2. Verify percentages
3. Check max salary base limits
4. Re-calculate if needed

---

### ❌ "Tax is too high/low"

**Check:**
1. Employee's marital status
2. Number of dependents
3. PTKP amount for their status
4. Gross salary calculation
5. Tax brackets settings

---

### ⚠️ Employee Resign Mid-Month

**Automatic Handling:**
- System calculates pro-rata until leave date
- Only pays for days worked
- Example: Resign tanggal 15, hanya dapat 15/30 gaji

**Manual Steps:**
1. Update employee's **Leave Date** di profile
2. Re-generate payroll
3. System will auto pro-rate

---

### ⚠️ New Employee Join Mid-Month

**Automatic Handling:**
- System calculates pro-rata from join date
- Example: Join tanggal 10, dapat 20/30 gaji (dari tgl 10-30)

**Manual Steps:**
1. Ensure **Join Date** is set correctly
2. Generate payroll
3. System will auto pro-rate

---

## Best Practices

### ✅ DO's:
1. **Backup data** before processing payment
2. **Double-check** total amounts before approve
3. **Verify** bank accounts regularly
4. **Keep audit trail** - don't delete payroll records
5. **Generate payslips** immediately after payment
6. **Archive reports** monthly

### ❌ DON'Ts:
1. Don't process payment without approval
2. Don't edit approved payrolls (use adjustment instead)
3. Don't delete payroll history
4. Don't share Midtrans credentials
5. Don't process without sufficient balance

---

## FAQ

**Q: Bisa batalkan payroll yang sudah di-process?**  
A: Tidak. Once payment processed, tidak bisa cancel. Jika ada error, harus manual adjustment di periode berikutnya.

**Q: Berapa lama transfer sampai ke karyawan?**  
A: Biasanya 1-24 jam kerja, tergantung bank dan Midtrans.

**Q: Bisa ubah payment date?**  
A: Bisa, selama status masih draft atau pending review.

**Q: Karyawan tidak terima gaji, apa yang harus dilakukan?**  
A: Check payment status, verify bank account, check Midtrans dashboard, contact support jika masih issue.

**Q: Bisa generate payroll untuk 1 karyawan saja?**  
A: Saat ini belum support. Harus generate untuk semua, atau manual adjustment.

---

## Support

Jika ada pertanyaan atau issue:
- Contact: HR Department
- Email: hr@company.com
- Phone: 021-XXXXXXX

**Emergency (Payment Issues):**
- Contact: Finance Department
- On-call: 24/7 during payment period

---

**Last Updated:** February 4, 2026  
**Version:** 1.0
