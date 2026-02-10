# Leave Screen Fixes - Mobile App

## Tanggal: 10 Februari 2026

### Masalah yang Diperbaiki

#### 1. **Jenis Cuti Tidak Ada Penjelasan**
**Masalah:** Dropdown jenis cuti tidak memiliki keterangan seperti di Employee Page web

**Solusi:**
- ✅ Menambahkan emoji dan label lengkap pada Picker items:
  - 🏖️ Cuti Tahunan (Annual Leave)
  - 🤒 Sakit (Sick Leave)
  - 📝 Izin (Permission)
- ✅ Menambahkan help text di bawah picker yang menjelaskan:
  - **Cuti Tahunan**: "Jenis ini akan mengurangi kuota cuti tahunan Anda"
  - **Sakit**: "Jenis ini tidak mengurangi kuota cuti (untuk kondisi sakit)"
  - **Izin**: "Jenis ini tidak mengurangi kuota cuti (untuk keperluan pribadi)"

**File yang Diubah:**
- `src/screens/LeaveScreen.js` - Picker items dan help text

---

#### 2. **Cuti Tahunan Menampilkan 0**
**Masalah:** 
- Balance card menampilkan `annualLeave`, `sickLeave`, `permission` yang tidak sesuai dengan response API
- API mengembalikan `remainingLeaveQuota`, `usedLeaveQuota`, `annualLeaveQuota`, `pendingLeaveDays`, `availableAfterPending`
- Sick leave dan permission tidak memiliki kuota (unlimited), sehingga tidak ada di response

**Solusi:**
- ✅ Mengubah tampilan balance card menjadi:
  - **Sisa Cuti**: Menampilkan `remainingLeaveQuota` dengan subtitle "dari {annualLeaveQuota}"
  - **Terpakai**: Menampilkan `usedLeaveQuota` dengan subtitle "hari cuti"
  - **Pending**: Menampilkan `pendingLeaveDays` dengan subtitle "menunggu"
- ✅ Menambahkan pending info box yang muncul jika ada pending requests:
  - Menampilkan `availableAfterPending` (sisa cuti setelah pending dikurangi)
  - Styling dengan background kuning dan border oranye

**File yang Diubah:**
- `src/screens/LeaveScreen.js` - Balance card structure dan data mapping

---

### Perubahan Code

#### Leave Screen Updates

**Picker Section (Lines ~187-203):**
```javascript
<Picker.Item label="🏖️ Cuti Tahunan (Annual Leave)" value="ANNUAL_LEAVE" />
<Picker.Item label="🤒 Sakit (Sick Leave)" value="SICK_LEAVE" />
<Picker.Item label="📝 Izin (Permission)" value="PERMISSION" />
```

**Help Text:**
```javascript
<Text style={styles.helpText}>
  {leaveForm.leaveType === 'ANNUAL_LEAVE' && 'Jenis ini akan mengurangi kuota cuti tahunan Anda'}
  {leaveForm.leaveType === 'SICK_LEAVE' && 'Jenis ini tidak mengurangi kuota cuti (untuk kondisi sakit)'}
  {leaveForm.leaveType === 'PERMISSION' && 'Jenis ini tidak mengurangi kuota cuti (untuk keperluan pribadi)'}
</Text>
```

**Balance Card (Lines ~156-177):**
```javascript
<View style={styles.balanceItem}>
  <Text style={styles.balanceValue}>{leaveBalance.remainingLeaveQuota || 0}</Text>
  <Text style={styles.balanceLabel}>Sisa Cuti</Text>
  <Text style={styles.balanceSubLabel}>dari {leaveBalance.annualLeaveQuota || 12}</Text>
</View>
<View style={styles.balanceItem}>
  <Text style={styles.balanceValue}>{leaveBalance.usedLeaveQuota || 0}</Text>
  <Text style={styles.balanceLabel}>Terpakai</Text>
  <Text style={styles.balanceSubLabel}>hari cuti</Text>
</View>
<View style={styles.balanceItem}>
  <Text style={styles.balanceValue}>{leaveBalance.pendingLeaveDays || 0}</Text>
  <Text style={styles.balanceLabel}>Pending</Text>
  <Text style={styles.balanceSubLabel}>menunggu</Text>
</View>
```

**Pending Info Box:**
```javascript
{leaveBalance.pendingLeaveDays > 0 && (
  <View style={styles.pendingInfo}>
    <Text style={styles.pendingInfoText}>
      💡 Sisa tersedia setelah pending: {leaveBalance.availableAfterPending || 0} hari
    </Text>
  </View>
)}
```

**New Styles Added:**
```javascript
helpText: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
  marginBottom: 8,
  fontStyle: 'italic',
},
balanceSubLabel: {
  fontSize: 10,
  color: '#999',
  textAlign: 'center',
  marginTop: 2,
},
pendingInfo: {
  marginTop: 16,
  padding: 12,
  backgroundColor: '#fef3c7',
  borderRadius: 8,
  borderLeftWidth: 3,
  borderLeftColor: '#f59e0b',
},
pendingInfoText: {
  fontSize: 12,
  color: '#92400e',
  textAlign: 'center',
},
```

---

### API Response Mapping

**Endpoint:** `GET /api/leave-request/my-balance`

**Response:**
```json
{
  "message": "My leave balance",
  "data": {
    "annualLeaveQuota": 12,
    "usedLeaveQuota": 2,
    "remainingLeaveQuota": 10,
    "pendingLeaveDays": 3,
    "availableAfterPending": 7
  }
}
```

**Mapping:**
- `annualLeaveQuota` → Kuota total cuti tahunan (default: 12 hari)
- `usedLeaveQuota` → Jumlah cuti yang sudah terpakai
- `remainingLeaveQuota` → Sisa cuti yang tersedia
- `pendingLeaveDays` → Total hari cuti yang sedang pending approval
- `availableAfterPending` → Sisa cuti setelah dikurangi pending (remainingLeaveQuota - pendingLeaveDays)

---

### Testing Checklist

- [ ] Dropdown jenis cuti menampilkan emoji dan label lengkap
- [ ] Help text muncul sesuai jenis cuti yang dipilih
- [ ] Balance card menampilkan angka yang benar dari API
- [ ] Sisa cuti menampilkan "dari 12" (atau sesuai quota)
- [ ] Pending info box muncul jika ada pending requests
- [ ] Pending info box menghitung dengan benar (available after pending)
- [ ] Styling konsisten dengan design system (teal #4DB8B8)

---

### Catatan Tambahan

**Perbedaan Web vs Mobile:**

| Aspek | Web (EmployeePage.jsx) | Mobile (LeaveScreen.js) |
|-------|------------------------|-------------------------|
| Jenis Cuti Dropdown | Select dengan emoji | Picker dengan emoji |
| Help Text | `<p className="text-xs">` | `<Text style={styles.helpText}>` |
| Balance Display | 3 cards (Annual, Sick, Permission) | 3 cards (Sisa, Terpakai, Pending) |
| Sick/Permission Quota | Tidak ditampilkan (unlimited) | Tidak ditampilkan (unlimited) |
| Pending Info | Tidak ada | Ada dengan warning box |

**Kenapa Sick Leave & Permission tidak punya kuota?**
- Sistem mengikuti kebijakan HR standar Indonesia
- Cuti sakit: Tidak terbatas (dengan surat dokter)
- Izin: Tidak terbatas (approval dari atasan)
- Hanya Annual Leave yang memiliki kuota terbatas (12 hari/tahun)

---

### Files Changed
1. `/mobile-app/src/screens/LeaveScreen.js` - Main fixes
2. `/mobile-app/LEAVE_FIXES.md` - Documentation (this file)

### Related Files (Reference)
- `/client_Salmon-HRIS/src/views/EmployeePage.jsx` - Web version reference
- `/server/controllers/leaveRequestController.js` - API endpoint
- `/mobile-app/src/utils/helpers.js` - Helper functions

---

**Status:** ✅ Completed
**Tested:** Pending user verification
