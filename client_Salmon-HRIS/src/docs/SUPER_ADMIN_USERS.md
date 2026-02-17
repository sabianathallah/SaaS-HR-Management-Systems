# 👥 Super Admin - User Management

## 📋 Overview
Halaman **User Management** di Super Admin Dashboard memungkinkan Super Admin untuk mengelola semua user di seluruh company dengan fitur lengkap CRUD dan filtering.

---

## 🎯 Fitur Utama

### 1. **Dashboard Statistics**
Menampilkan statistik user secara real-time:
- 📊 Total Users - Jumlah keseluruhan user
- ✅ Active Users - User yang aktif
- 👨‍💼 Admins - Total Company Admin + Super Admin
- 👤 Employees - Total employee

### 2. **Advanced Filtering**
3 jenis filter untuk mempermudah pencarian:

#### 🔍 Search Filter
- Cari berdasarkan nama, email, posisi, atau department
- Real-time search

#### 🎭 Role Filter
- ALL - Semua role
- SUPER_ADMIN - Super administrator
- COMPANY_ADMIN - Company administrator
- EMPLOYEE - Karyawan biasa

#### 📊 Status Filter
- ALL - Semua status
- ACTIVE - User aktif
- INACTIVE - User tidak aktif

### 3. **User Table**
Tabel lengkap dengan informasi:
- **User Info**: Nama, ID, avatar
- **Contact**: Email, nomor telepon
- **Position**: Jabatan, department
- **Role**: Badge dengan warna berbeda per role
- **Status**: Active/Inactive badge
- **Leave Quota**: Used/Total/Remaining
- **Actions**: Edit dan Toggle Status

### 4. **Edit User**
Modal edit dengan form lengkap:
- ✏️ Name (required)
- 📧 Email (required)
- 📱 Phone Number
- 💼 Position
- 🏢 Department
- 🎭 Role (dropdown)
- ✅ Active status (checkbox)

### 5. **Toggle User Status**
- Activate/Deactivate user dengan satu klik
- Konfirmasi sebelum mengubah status
- Tidak bisa delete, hanya deactivate (data tetap tersimpan)

---

## 🎨 UI/UX Features

### Color Coding

#### Role Badges
- 🟣 **SUPER_ADMIN**: Purple
- 🔵 **COMPANY_ADMIN**: Blue
- 🟢 **EMPLOYEE**: Green

#### Status Badges
- 🟢 **Active**: Green
- 🔴 **Inactive**: Red

### Responsive Design
- ✅ Desktop optimized
- ✅ Mobile friendly
- ✅ Tablet responsive

---

## 🔌 API Endpoints

### GET /users/admin
Mendapatkan semua user

**Response:**
```json
{
  "message": "Success fetch all users",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE",
      "phoneNumber": "+62-812-xxxx-xxxx",
      "position": "Software Engineer",
      "department": "IT",
      "isActive": true,
      "annualLeaveQuota": 12,
      "usedLeaveQuota": 3,
      "remainingLeaveQuota": 9
    }
  ]
}
```

### PUT /users/admin/:id
Update user data

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.new@example.com",
  "phoneNumber": "+62-812-xxxx-xxxx",
  "position": "Senior Software Engineer",
  "department": "IT",
  "role": "COMPANY_ADMIN",
  "isActive": true
}
```

### PATCH /users/admin/:id/status
Toggle user active status

**Request Body:**
```json
{
  "isActive": false
}
```

---

## 📱 How to Use

### 1. Access User Management
```
Login sebagai Super Admin → Dashboard → Click "Manage Users"
atau
Navigate to: /super-admin/users
```

### 2. Search Users
```
1. Masukkan keyword di search box
2. Pilih role filter (optional)
3. Pilih status filter (optional)
4. Hasil akan otomatis terfilter
```

### 3. Edit User
```
1. Click tombol "✏️ Edit" pada user yang ingin diedit
2. Modal akan terbuka dengan form
3. Edit data yang diperlukan
4. Click "Update User"
5. Toast notification akan muncul
```

### 4. Deactivate/Activate User
```
1. Click tombol "🚫 Deactivate" atau "✅ Activate"
2. Konfirmasi action
3. Status user akan berubah
4. Toast notification akan muncul
```

---

## 🔒 Security & Permissions

### Role-Based Access
- ✅ **SUPER_ADMIN**: Full access - dapat melihat dan edit semua user
- ❌ **COMPANY_ADMIN**: Tidak bisa akses halaman ini
- ❌ **EMPLOYEE**: Tidak bisa akses halaman ini

### Data Protection
- Password tidak pernah ditampilkan
- Email validation
- Konfirmasi sebelum status change
- Audit trail (coming soon)

---

## 🎯 Use Cases

### 1. Monitor All Users
Super Admin dapat melihat overview semua user dari berbagai company dalam satu dashboard.

### 2. Quick Status Change
Butuh deactivate user yang resign? Tinggal klik button tanpa perlu ke halaman detail.

### 3. Bulk Filtering
Mau lihat semua Admin? Filter by role "COMPANY_ADMIN". Mau lihat inactive users? Filter by status "INACTIVE".

### 4. User Data Management
Edit informasi user seperti role, position, department langsung dari satu halaman.

---

## 💡 Tips & Best Practices

### 1. Search Optimization
Gunakan search untuk mencari user specific, lalu combine dengan filter untuk hasil lebih akurat.

### 2. Status Management
- Jangan delete user, gunakan deactivate
- Inactive user datanya tetap tersimpan untuk audit trail
- Bisa activate kembali kapan saja

### 3. Role Assignment
- Hati-hati saat mengubah role user
- SUPER_ADMIN hanya untuk system administrator
- COMPANY_ADMIN untuk HR/Admin company
- EMPLOYEE untuk karyawan biasa

### 4. Data Validation
- Email harus unique
- Name dan email adalah required
- Role harus valid (SUPER_ADMIN/COMPANY_ADMIN/EMPLOYEE)

---

## 🐛 Troubleshooting

### Problem: Users tidak muncul
**Solution:** 
- Check token authentication
- Verify API endpoint `/users/admin` working
- Check browser console untuk error

### Problem: Edit tidak berfungsi
**Solution:**
- Verify user ID valid
- Check form validation
- Verify API endpoint `/users/admin/:id` working

### Problem: Filter tidak jalan
**Solution:**
- Clear search term dan coba lagi
- Reload page
- Check data user memiliki field yang difilter

---

## 📊 Statistics & Monitoring

### Real-time Stats
Dashboard menampilkan:
- Total users count
- Active/Inactive breakdown
- Admin vs Employee ratio
- Leave quota monitoring

### Data Refresh
- Auto-refresh setelah edit
- Manual refresh dengan reload page
- Real-time filtering tanpa API call

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Bulk actions (activate/deactivate multiple users)
- [ ] Export to CSV/Excel
- [ ] Advanced filtering (by company, join date, etc.)
- [ ] User activity logs
- [ ] Password reset capability
- [ ] User creation from Super Admin
- [ ] Pagination for large datasets
- [ ] Sorting by column
- [ ] User import from CSV

---

## 📝 Component Structure

```
UsersPage.jsx
├── State Management
│   ├── users (all users)
│   ├── filteredUsers (after filtering)
│   ├── loading state
│   ├── modal state
│   └── form data
│
├── API Calls
│   ├── fetchUsers() - GET all users
│   ├── handleUpdateUser() - PUT update
│   └── handleToggleStatus() - PATCH status
│
├── Filters
│   ├── Search (name, email, position, dept)
│   ├── Role filter (ALL/SUPER_ADMIN/COMPANY_ADMIN/EMPLOYEE)
│   └── Status filter (ALL/ACTIVE/INACTIVE)
│
├── UI Components
│   ├── Stats Cards (4 cards)
│   ├── Filter Section
│   ├── Users Table
│   └── Edit Modal
│
└── Helper Functions
    ├── filterUsers() - Apply all filters
    └── getRoleBadgeColor() - Badge styling
```

---

## 🔗 Related Documentation
- [Super Admin Dashboard](./SUPER_ADMIN_DASHBOARD.md)
- [Companies Management](./SUPER_ADMIN_COMPANIES.md)
- [User Admin API Endpoints](../../../server/docs%20(md)/USER_MANAGEMENT_ADMIN.md)
- [Multi-Tenant Architecture](../../../Docs/MULTI_TENANT_GUIDE.md)

---

## ✅ Checklist

Fitur yang sudah diimplementasi:
- [x] User list dengan semua data
- [x] Real-time statistics
- [x] Search functionality
- [x] Role filter
- [x] Status filter
- [x] Edit user modal
- [x] Toggle user status
- [x] Role-based badge coloring
- [x] Leave quota display
- [x] Responsive design
- [x] Toast notifications
- [x] Confirmation dialogs
- [x] Loading states
- [x] Error handling

---

**Created:** February 16, 2026  
**Last Updated:** February 16, 2026  
**Status:** ✅ Production Ready
