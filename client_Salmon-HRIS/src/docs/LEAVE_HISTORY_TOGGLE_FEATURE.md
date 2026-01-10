# Leave History Toggle Feature

## ✅ IMPLEMENTASI SELESAI

Saya telah berhasil membuat **riwayat pengajuan leave (cuti/izin)** yang bisa di-toggle show/hide seperti overtime history!

---

## 🎯 Fitur yang Diimplementasikan:

### Toggle Leave History
- ✅ Button toggle untuk show/hide riwayat cuti/izin
- ✅ Collapsible section dengan **background biru** (bg-blue-50)
- ✅ Auto-fetch saat pertama kali dibuka (jika belum ada data)
- ✅ Table dengan 5 kolom: Jenis, Tanggal, Durasi, Status, Aksi

---

## 💻 Implementation Details:

### 1. State Baru:
```javascript
const [showLeaveHistory, setShowLeaveHistory] = useState(false)
```

### 2. UI Structure:

**Before (Old):**
```
[+ Ajukan Cuti/Izin Button]
[Leave Form] (if shown)

Riwayat Pengajuan (Always Visible)
[Table with all leave requests]
```

**After (New):**
```
[+ Ajukan Cuti/Izin Button]
[Leave Form] (if shown)

[📋 Lihat Riwayat Pengajuan Cuti/Izin] (Toggle Button) ⭐
  ↓ (when clicked)
┌─────────────────────────────────────────┐
│ 🔵 Riwayat Pengajuan Cuti/Izin         │
├─────────────────────────────────────────┤
│ [Table with all leave requests]        │
│ - Jenis | Tanggal | Durasi | Status    │
│ - Button "Batalkan" for PENDING        │
└─────────────────────────────────────────┘
```

---

## 🎨 Visual Design:

### Toggle Button:
```jsx
<Button 
  nameProp={showLeaveHistory ? 
    "📋 Sembunyikan Riwayat Pengajuan Cuti/Izin" : 
    "📋 Lihat Riwayat Pengajuan Cuti/Izin"
  }
  onClick={() => {
    setShowLeaveHistory(!showLeaveHistory)
    if (!showLeaveHistory && leaveRequests.length === 0) fetchLeaveData()
  }}
  variant="secondary"
/>
```

### Section Styling:
- **Background**: Blue-50 (bg-blue-50)
- **Padding**: p-6
- **Border Radius**: rounded-lg
- **Margin Top**: mt-4

### Table Structure:
| Jenis | Tanggal | Durasi | Status | Aksi |
|-------|---------|--------|--------|------|
| Cuti Tahunan | 15/01 - 17/01 | 3 hari | PENDING | [Batalkan] |
| Sakit | 20/01 - 20/01 | 1 hari | APPROVED | - |

---

## 🔄 User Flow:

### Open History:
```
1. User melihat button "📋 Lihat Riwayat Pengajuan Cuti/Izin"
2. User klik button
3. ✅ setShowLeaveHistory(true)
4. ✅ Auto-fetch data (jika leaveRequests.length === 0)
5. ✅ Section expand dengan background biru
6. ✅ Table muncul dengan semua leave requests
7. ✅ Button "Batalkan" muncul untuk status PENDING
```

### Close History:
```
1. User klik button "📋 Sembunyikan Riwayat Pengajuan Cuti/Izin"
2. ✅ setShowLeaveHistory(false)
3. ✅ Section collapse
4. ✅ Data tetap di-cache (tidak fetch ulang)
```

---

## ✨ Key Features:

| Feature | Status | Description |
|---------|--------|-------------|
| Toggle Button | ✅ | Show/hide history section |
| Auto-fetch | ✅ | Fetch data saat pertama kali dibuka (jika kosong) |
| Collapsible | ✅ | Section bisa dibuka/ditutup |
| Background Color | ✅ | Blue-50 untuk membedakan dari overtime (green-50) |
| Loading State | ✅ | "Loading..." saat fetch data |
| Empty State | ✅ | "Belum ada riwayat pengajuan cuti/izin" |
| Cancel Button | ✅ | Tetap ada untuk status PENDING |
| Responsive | ✅ | Table scroll horizontal di mobile |

---

## 🎨 Color Scheme:

### Leave vs Overtime:
- **Leave History**: 🔵 Blue-50 background (bg-blue-50)
- **Overtime History**: 🟢 Green-50 background (bg-green-50)

### Status Colors (unchanged):
- ✅ **APPROVED**: Green (bg-green-200)
- ❌ **REJECTED**: Red (bg-red-200)
- ⚪ **CANCELLED**: Gray (bg-gray-200)
- 🟡 **PENDING**: Yellow (bg-yellow-200)

---

## 📊 Comparison: Leave vs Overtime

| Aspect | Leave History | Overtime History |
|--------|---------------|------------------|
| **Route** | /leave-requests/my-requests | /overtimes/my-history |
| **Filter** | All statuses | Approved only |
| **Background** | Blue-50 | Green-50 |
| **Auto-fetch** | If empty | If empty |
| **Cancel Button** | Yes (PENDING) | Yes (PENDING) |
| **Table Columns** | 5 (Jenis, Tanggal, Durasi, Status, Aksi) | 5 (Tanggal, Jam Req, Jam App, Alasan, Catatan) |

---

## 🎯 Benefits:

1. ✅ **Cleaner UI**: History tersembunyi secara default
2. ✅ **Better UX**: User bisa pilih kapan mau lihat history
3. ✅ **Performance**: Data di-cache, tidak fetch berulang
4. ✅ **Consistency**: Sama seperti overtime history (user familiar)
5. ✅ **Organized**: Memisahkan form input dengan history
6. ✅ **Visual Clarity**: Blue background untuk leave, green untuk overtime

---

## 📱 Responsive Design:

### Mobile (< 768px):
- ✅ Button full width
- ✅ Table horizontal scroll
- ✅ Touch-friendly toggle
- ✅ Readable text

### Desktop (>= 768px):
- ✅ Button normal width
- ✅ Full table width
- ✅ Hover effects
- ✅ Proper spacing

---

## 🧪 Testing:

### Test 1: Open History (First Time)
```
1. Page loads
2. Click "📋 Lihat Riwayat Pengajuan Cuti/Izin"
✅ Section expands
✅ Auto-fetch data (if leaveRequests.length === 0)
✅ Table displays
```

### Test 2: Open History (Already Loaded)
```
1. History already fetched before
2. Click toggle button
✅ Section expands
✅ No fetch (data from cache)
✅ Table displays immediately
```

### Test 3: Close History
```
1. History is open
2. Click "📋 Sembunyikan Riwayat Pengajuan Cuti/Izin"
✅ Section collapses
✅ Data remains in state (cached)
```

### Test 4: Cancel Leave from History
```
1. Open history
2. Find PENDING leave
3. Click "Batalkan"
✅ Confirmation dialog
✅ Cancel successful
✅ Table refreshed
```

### Test 5: Empty State
```
1. No leave requests yet
2. Open history
✅ Message: "Belum ada riwayat pengajuan cuti/izin"
```

---

## 🎨 Visual Layout:

```
┌─────────────────────────────────────────────────┐
│  Cuti & Izin Section                            │
├─────────────────────────────────────────────────┤
│  📊 Leave Balance Info                          │
│  (Sisa: 10 hari, Terpakai: 2 hari)             │
│                                                  │
│  [+ Ajukan Cuti/Izin]  ← Request Button        │
│                                                  │
│  ╔═══════════════════════════════════════════╗  │
│  ║ Leave Form (if shown)                     ║  │
│  ║ - Jenis Cuti                              ║  │
│  ║ - Tanggal Mulai & Selesai                 ║  │
│  ║ - Alasan                                   ║  │
│  ╚═══════════════════════════════════════════╝  │
│                                                  │
│  [📋 Lihat Riwayat Pengajuan Cuti/Izin] ⭐     │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ 🔵 Riwayat Pengajuan Cuti/Izin          │    │
│  ├─────────────────────────────────────────┤    │
│  │ Jenis | Tanggal | Durasi | Status | Aksi│    │
│  │ Cuti  | 15-17/01| 3 hari | PENDING |[X] │    │
│  │ Sakit | 20/01   | 1 hari | APPROVED|   │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Overtime Section...                            │
└─────────────────────────────────────────────────┘
```

---

## 📝 Code Changes:

### State Added:
```javascript
const [showLeaveHistory, setShowLeaveHistory] = useState(false)
```

### UI Updated:
```javascript
// Toggle Button
<Button 
  nameProp={showLeaveHistory ? "Sembunyikan" : "Lihat"}
  onClick={() => setShowLeaveHistory(!showLeaveHistory)}
  variant="secondary"
/>

// Collapsible Section
{showLeaveHistory && (
  <div className="mt-4 bg-blue-50 rounded-lg p-6">
    {/* Table here */}
  </div>
)}
```

---

## 🔍 Smart Features:

### 1. **Conditional Fetch**
```javascript
onClick={() => {
  setShowLeaveHistory(!showLeaveHistory)
  if (!showLeaveHistory && leaveRequests.length === 0) fetchLeaveData()
}}
```
- Hanya fetch jika history dibuka DAN data masih kosong
- Hemat API calls
- Data di-cache setelah fetch pertama

### 2. **Dynamic Button Text**
```javascript
nameProp={showLeaveHistory ? 
  "📋 Sembunyikan Riwayat Pengajuan Cuti/Izin" : 
  "📋 Lihat Riwayat Pengajuan Cuti/Izin"
}
```
- Text berubah sesuai state
- User tahu section terbuka/tertutup

### 3. **Consistent Styling**
- Same pattern dengan overtime history
- User experience familiar
- Mudah dipelajari

---

## ✅ Implementation Complete!

### Summary:
- ✅ **State**: Added `showLeaveHistory`
- ✅ **Toggle Button**: Show/hide functionality
- ✅ **Collapsible Section**: Blue-50 background
- ✅ **Auto-fetch**: Smart data loading
- ✅ **Table**: All leave requests with actions
- ✅ **Responsive**: Mobile & desktop friendly
- ✅ **Consistent**: Same pattern as overtime

### Files Modified:
```
✅ /client_Salmon-HRIS/src/views/EmployeePage.jsx
   - Added showLeaveHistory state
   - Added toggle button for leave history
   - Made leave history section collapsible
   - Added blue-50 background for distinction
   - Added auto-fetch logic
```

---

## 🎉 Result:

**Leave history sekarang bisa di-toggle (open/close) seperti overtime history!**

- 📋 Button toggle dengan icon
- 🔵 Background biru untuk distinction
- ⚡ Auto-fetch saat pertama kali dibuka
- 💾 Data di-cache untuk performa
- 📱 Responsive di semua device
- ✨ Consistent UX dengan overtime

**READY TO USE!** 🚀
