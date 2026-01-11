# 🚀 Admin Page - Quick Start Guide

## 📁 File Structure

```
client_Salmon-HRIS/
└── src/
    ├── views/
    │   └── AdminPage.jsx                    # Main admin page
    └── components/
        └── admin/
            ├── index.js                     # Centralized exports
            ├── AdminDashboard.jsx           # Dashboard overview
            ├── EmployeeManagement.jsx       # Employee CRUD
            ├── AttendanceManagement.jsx     # Attendance tracking
            ├── LeaveManagement.jsx          # Leave approval
            ├── ShiftScheduleManagement.jsx  # Shift management
            ├── OvertimeManagement.jsx       # Overtime approval
            ├── OfficeLocationManagement.jsx # Location settings
            ├── ReportAnalytics.jsx          # Reports & export
            └── AuditLogViewer.jsx           # Audit logs
```

---

## ⚡ Quick Setup

### 1. Update Router
Di file `App.jsx` atau router config Anda, tambahkan route:

```jsx
import AdminPage from './views/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

// Dalam router:
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### 2. Environment Variables
Pastikan `.env` sudah diset:

```env
VITE_BASE_URL=http://localhost:3000
```

### 3. Required Components
Pastikan komponen berikut sudah ada di `src/components/`:
- ✅ `FormInput.jsx`
- ✅ `FormSelect.jsx`
- ✅ `FormTextarea.jsx`
- ✅ `Modal.jsx`
- ✅ `ProtectedRoute.jsx`

---

## 🎯 How to Use

### Login sebagai Admin
1. Login dengan akun admin
2. Browser akan auto-redirect ke `/admin`
3. Atau klik menu "Admin Panel" jika tersedia

### Navigation
- Gunakan tab navigation di bagian atas
- Klik icon atau label untuk switch antar modul
- State akan preserved dalam session

---

## 📊 Features per Module

### 1️⃣ Dashboard
- View statistics at a glance
- Monitor today's attendance
- Check pending approvals
- Quick action buttons

### 2️⃣ Employee Management
- **Search**: Cari by name, email, atau position
- **Filter**: Active/Inactive status
- **Add**: Klik "Add Employee" button
- **Edit**: Klik "Edit" pada row employee
- **Deactivate**: Klik "Deactivate" untuk non-aktifkan
- **Export**: Download CSV dari filtered data

### 3️⃣ Attendance Management
- **Filter Date**: Set date range
- **Filter Employee**: Pilih specific employee atau all
- **Filter Status**: Filter by ON_TIME, LATE, ABSENT, etc.
- **Manual Entry**: Klik "Manual Attendance" untuk input manual
- **Edit**: Klik "Edit" pada row attendance
- **Export**: Download Excel report

### 4️⃣ Leave Management
- **View Requests**: See all leave requests
- **Filter Status**: PENDING/APPROVED/REJECTED
- **Approve/Reject**: Klik action buttons
- **View Details**: Klik "View" untuk detail lengkap
- **Adjust Quota**: Klik "Adjust Quota" untuk update balance

### 5️⃣ Shift & Schedule
- **Create Shift**: Define nama, start time, end time
- **Edit Shift**: Update shift yang sudah ada
- **Delete Shift**: Hapus shift (jika tidak ada employee assigned)
- **Assign**: Assign shift ke employee
- **Remove**: Remove shift dari employee

### 6️⃣ Overtime Management
- **View Requests**: See all overtime submissions
- **Approve**: Approve dengan atau tanpa note
- **Reject**: Reject dengan reason
- **Filter**: By status

### 7️⃣ Office Locations
- **View**: List semua office locations
- 🚧 CRUD features coming soon

### 8️⃣ Reports & Analytics
- **Set Filters**: Date range & employee
- **Export Excel**: Download XLSX format
- **Export CSV**: Download CSV format
- Auto-generate filename dengan timestamp

### 9️⃣ Audit Logs
- **View Activities**: All system activities
- **Track Changes**: Who did what and when
- **Statistics**: Count by action type
- Auto-refresh capability

---

## 🔑 Access Control

### Required Role
```javascript
user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
```

### Auto-Redirect
- ❌ No token → Redirect to `/login`
- ❌ Not admin → Redirect to `/employee`
- ✅ Admin → Access granted

### Token Storage
```javascript
localStorage.getItem('access_token')
localStorage.getItem('user') // JSON string
```

---

## 🎨 UI/UX Guidelines

### Color Coding
- 🔵 **Blue**: Info, primary actions
- 🟢 **Green**: Success, approve, on-time
- 🟡 **Yellow**: Warning, pending, late
- 🔴 **Red**: Danger, reject, absent
- 🟣 **Purple**: Admin-specific actions
- ⚫ **Gray**: Neutral, disabled

### Badge Status
```jsx
// Attendance Status
ON_TIME  → Green badge
LATE     → Yellow badge
ABSENT   → Red badge
LEAVE    → Blue badge
HOLIDAY  → Purple badge

// Request Status
PENDING  → Yellow badge
APPROVED → Green badge
REJECTED → Red badge
```

### Icons
- ➕ Add/Create
- ✏️ Edit
- 🗑️ Delete
- 👁️ View
- ✅ Approve
- ❌ Reject
- 📥 Download/Export
- 🔍 Search

---

## 🔧 Common Issues & Solutions

### Issue: "Access token not found"
**Solution**: Login ulang atau check localStorage

### Issue: "403 Forbidden"
**Solution**: Pastikan user memiliki role ADMIN

### Issue: "Network Error"
**Solution**: 
1. Check apakah server running
2. Check VITE_BASE_URL di .env
3. Check CORS settings di server

### Issue: Modal tidak tertutup
**Solution**: Klik button Cancel/Close, bukan click outside

### Issue: Data tidak muncul setelah create/update
**Solution**: Component akan auto-refresh, tunggu beberapa detik

---

## 📱 Keyboard Shortcuts (Future Enhancement)

```
Ctrl/Cmd + K  → Quick search
Ctrl/Cmd + N  → New entry (context-dependent)
Ctrl/Cmd + E  → Export current view
Esc           → Close modal/cancel action
```

---

## 🔄 Data Refresh

### Auto-refresh triggers:
- ✅ After successful create
- ✅ After successful update
- ✅ After successful delete
- ✅ On tab/modal close

### Manual refresh:
```javascript
// Press F5 atau reload page
// Or implement refresh button per component
```

---

## 📊 Export Formats

### CSV Export
```
Format: UTF-8
Delimiter: Comma (,)
Headers: Included
Encoding: UTF-8 with BOM
```

### Excel Export
```
Format: XLSX
Sheets: Single sheet
Styling: Headers bold
Auto-width: Enabled
```

---

## 🛡️ Security Best Practices

1. **Never log sensitive data**
   ```javascript
   // ❌ Don't do this
   console.log('Password:', password)
   
   // ✅ Do this
   console.log('Login attempt for user:', email)
   ```

2. **Always validate on backend**
   - Frontend validation adalah UX enhancement
   - Backend validation adalah security requirement

3. **Token expiry**
   - Handle 401 responses
   - Auto-redirect to login
   - Clear local storage

4. **XSS Prevention**
   - React sudah auto-escape
   - Jangan gunakan dangerouslySetInnerHTML tanpa sanitize

---

## 🚀 Performance Tips

1. **Large Lists**
   ```javascript
   // Implement pagination atau virtual scrolling
   // Jangan render 1000+ rows sekaligus
   ```

2. **API Calls**
   ```javascript
   // Use debounce untuk search
   // Implement caching jika perlu
   // Cancel previous requests
   ```

3. **Images**
   ```javascript
   // Lazy load images
   // Use thumbnails
   // Compress before upload
   ```

---

## 📚 Additional Resources

### Documentation
- `ADMIN_PAGE_DOCUMENTATION.md` - Complete feature docs
- `ADDITIONAL_ENDPOINTS.md` - Unused endpoints & suggestions
- Server docs di `/server/docs (md)/`

### API Documentation
```
Base URL: http://localhost:3000
API Docs: /server/docs (md)/API_ENDPOINTS_COMPLETE.md
Admin Endpoints: /server/docs (md)/ADMIN_ENDPOINTS.md
```

---

## ✅ Testing Checklist

Before deployment, test:

- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Create employee
- [ ] Edit employee
- [ ] Deactivate employee
- [ ] Create manual attendance
- [ ] Edit attendance record
- [ ] Export attendance to Excel
- [ ] Approve leave request
- [ ] Reject leave request
- [ ] Adjust leave quota
- [ ] Create shift
- [ ] Assign shift to employee
- [ ] Approve overtime
- [ ] Export reports
- [ ] View audit logs
- [ ] Logout

---

## 🎓 Next Steps

1. **Customize** sesuai kebutuhan bisnis
2. **Add features** dari ADDITIONAL_ENDPOINTS.md
3. **Improve UX** dengan charts & animations
4. **Mobile optimize** untuk responsive design
5. **Add tests** untuk stability

---

## 💬 Support

Jika ada pertanyaan atau issues:
1. Check dokumentasi lengkap
2. Check server logs
3. Check browser console
4. Review error messages

---

## 🎉 Happy Coding!

You're all set! AdminPage sudah siap digunakan dengan semua core features HRIS. 

**Remember**: Ini adalah foundation yang solid. Anda bisa build on top of ini sesuai kebutuhan spesifik perusahaan Anda.

**Pro Tip**: Start dengan testing di development environment dulu sebelum deploy to production! 🚀
