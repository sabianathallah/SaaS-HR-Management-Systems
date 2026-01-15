# 📚 DOKUMENTASI SISTEM HR MANAGEMENT - SALMON HRIS

> **SaaS HR Management System** - Sistem Manajemen Sumber Daya Manusia berbasis cloud yang modern dan komprehensif.

---

## 📖 Daftar Dokumentasi

### 👥 Untuk Karyawan (Employee)
📁 [**EMPLOYEE/**](./EMPLOYEE/)
- [Panduan Penggunaan Employee](./EMPLOYEE/01-PANDUAN-EMPLOYEE.md)
- [Fitur Attendance (Absensi)](./EMPLOYEE/02-FITUR-ATTENDANCE.md)
- [Fitur Leave Request (Cuti)](./EMPLOYEE/03-FITUR-LEAVE.md)
- [Fitur Overtime (Lembur)](./EMPLOYEE/04-FITUR-OVERTIME.md)
- [Fitur Notifikasi](./EMPLOYEE/05-FITUR-NOTIFIKASI.md)
- [FAQ - Pertanyaan Umum](./EMPLOYEE/06-FAQ.md)

### 👨‍💼 Untuk Admin
📁 [**ADMIN/**](./ADMIN/)
- [Panduan Admin](./ADMIN/01-PANDUAN-ADMIN.md)
- [Dashboard & Analytics](./ADMIN/02-DASHBOARD-ANALYTICS.md)
- [Manajemen Karyawan](./ADMIN/03-MANAJEMEN-KARYAWAN.md)
- [Manajemen Attendance](./ADMIN/04-MANAJEMEN-ATTENDANCE.md)
- [Manajemen Leave Request](./ADMIN/05-MANAJEMEN-LEAVE.md)
- [Manajemen Overtime](./ADMIN/06-MANAJEMEN-OVERTIME.md)
- [Manajemen Shift](./ADMIN/07-MANAJEMEN-SHIFT.md)
- [Manajemen Organisasi](./ADMIN/08-MANAJEMEN-ORGANISASI.md)
- [Laporan & Export](./ADMIN/09-LAPORAN-EXPORT.md)
- [Sistem Notifikasi](./ADMIN/10-SISTEM-NOTIFIKASI.md)
- [Sistem Audit Log](./ADMIN/11-AUDIT-LOG.md)
- [Settings & Konfigurasi](./ADMIN/12-SETTINGS.md)

---

## 🚀 Quick Start

### Akses Sistem
- **URL Aplikasi:** `http://localhost:5173` (Development)
- **Login Page:** `/login`

### Role & Akses
| Role | Dashboard | Fitur Utama |
|------|-----------|-------------|
| **Employee** | `/employee` | Attendance, Leave Request, Overtime, Profile, Notifications |
| **Admin** | `/admin` | Full Access - Dashboard, Employee Management, Reports, Settings |

---

## 🎯 Fitur Utama Sistem

### ✅ Attendance Management (Manajemen Absensi)
- ✨ Clock In/Out dengan foto selfie
- 📍 GPS & Geo-fencing validation
- ⏱️ Auto calculate work duration
- 🚨 Auto detect late/on-time
- 🤖 Auto set absent untuk yang tidak hadir
- 📊 Attendance statistics & history

### 🏖️ Leave Request Management (Manajemen Cuti)
- 📝 Submit leave request dengan attachment
- ✅ Approval workflow (Pending → Approved/Rejected)
- 📊 Leave balance tracking
- 📄 Multiple leave types (Annual, Sick, Permission)
- 📧 Email notifications

### ⏰ Overtime Management (Manajemen Lembur)
- 📝 Submit overtime request
- ✅ Admin approval required
- ⏱️ Track overtime hours
- 💰 Calculate overtime compensation
- 📊 Monthly overtime reports

### 🔄 Shift Management
- 🗓️ Multiple shift types (Office, WFH, Flexible)
- ⏰ Customizable work hours
- 👥 Assign shifts to employees
- 📅 Shift scheduling

### 📊 Reports & Analytics
- 📈 Attendance reports (Daily, Weekly, Monthly)
- 📉 Leave reports
- ⏰ Overtime reports
- 📥 Export to Excel/CSV
- 📧 Email report delivery

### 🔔 Notification System
- 📬 Real-time notifications
- ✉️ Email notifications
- 🔴 Unread badge counter
- 📋 Notification history

### 🔍 Audit Log System
- 📝 Track all user activities
- 🕒 Timestamp for every action
- 👤 User accountability
- 🔒 Security & compliance

---

## 🏗️ Arsitektur Sistem

### Frontend (Client)
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **State Management:** React Hooks (useState, useEffect)
- **UI Library:** Tailwind CSS
- **Charts:** Chart.js + react-chartjs-2
- **Notifications:** React Toastify
- **HTTP Client:** Axios

### Backend (Server)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt
- **File Upload:** Multer + Sharp (image processing)
- **Email:** Nodemailer
- **Cron Jobs:** node-cron
- **Testing:** Jest + Supertest

---

## 📁 Struktur Project

```
SaaS-HR-Management-Systems/
├── client_Salmon-HRIS/          # Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── views/               # Pages/Views
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── EmployeePage.jsx # Employee dashboard
│   │   │   └── Login.jsx       # Login page
│   │   ├── layouts/            # Layout components
│   │   ├── constant/           # Constants & configs
│   │   ├── store/              # State management
│   │   └── App.jsx             # Main app component
│   └── package.json
│
├── server/                      # Backend Application
│   ├── controllers/            # Request handlers
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── middlewares/            # Authentication, etc.
│   ├── helpers/                # Utility functions
│   ├── scheduler/              # Cron jobs
│   ├── migrations/             # Database migrations
│   ├── seeders/                # Database seeders
│   ├── uploads/                # Uploaded files
│   └── app.js                  # Main app file
│
├── schema/                     # Database schemas & diagrams
├── references/                 # UI references
└── DOKUMENTASI/               # 📚 Documentation (YOU ARE HERE)
    ├── EMPLOYEE/              # Employee documentation
    └── ADMIN/                 # Admin documentation
```

---

## 🔐 Authentication & Security

### Login Flow
1. User memasukkan email & password
2. Backend validasi credentials
3. JWT token digenerate jika valid
4. Token disimpan di localStorage
5. Token digunakan untuk setiap API request
6. Auto redirect berdasarkan role:
   - Employee → `/employee`
   - Admin → `/admin/dashboard`

### Security Features
- 🔒 JWT-based authentication
- 🔑 Password hashing dengan bcrypt
- 🚫 Role-based access control (RBAC)
- 🛡️ Protected routes
- 📝 Audit logging untuk tracking activities
- ⏰ Token expiration handling
- 🔄 Auto logout saat token expired

---

## 🗄️ Database Schema

### Core Tables
- **Users** - Data karyawan & admin
- **Attendances** - Record absensi harian
- **LeaveRequests** - Pengajuan cuti
- **Overtimes** - Pengajuan lembur
- **Shifts** - Shift kerja
- **WorkSchedules** - Jadwal kerja
- **OfficeLocations** - Lokasi kantor untuk geo-fencing
- **Holidays** - Hari libur nasional
- **Notifications** - Notifikasi untuk user
- **AuditLogs** - Log aktivitas user

### Relations
- User **1:N** Attendances
- User **1:N** LeaveRequests
- User **1:N** Overtimes
- User **N:1** Shift (belongs to)
- Attendance **N:1** User
- Attendance **N:1** Shift
- Attendance **N:1** OfficeLocation

---

## 📞 Support & Contact

Untuk pertanyaan atau bantuan, silakan hubungi:
- **Email:** support@salmonhris.com
- **Phone:** +62 xxx xxxx xxxx

---

## 📝 Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Jan 2026 | Initial Release - Core Features |

---

**Last Updated:** January 15, 2026  
**Maintained by:** Salmon HRIS Team
