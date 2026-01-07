# HR Management System - Client

Frontend aplikasi HR Management System menggunakan React + Vite + Tailwind CSS.

## 🚀 Features

### Employee Features
- ✅ Login/Logout
- ✅ Dashboard dengan quick actions
- ✅ Check In/Out dengan GPS & Photo
- ✅ Leave Request Management
- ✅ Overtime Request
- ✅ View Attendance History

### Admin Features
- ✅ Dashboard dengan statistik
- ✅ User Management (CRUD)
- ✅ Attendance Management
- ✅ Leave Request Approval
- ✅ Overtime Request Approval
- ✅ Reports & Export to Excel

## 📦 Tech Stack

- **React 19** - UI Library
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **React Query** - Server State Management
- **Axios** - HTTP Client
- **React Hook Form** - Form Management
- **date-fns** - Date Utility
- **Lucide React** - Icons

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

Edit `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── components/         # Reusable components
│   ├── Layout.jsx     # Main layout with sidebar
│   └── ProtectedRoute.jsx
├── config/            # Configuration files
│   └── api.js        # Axios configuration
├── services/          # API services
│   ├── authService.js
│   ├── attendanceService.js
│   ├── leaveService.js
│   ├── overtimeService.js
│   ├── userService.js
│   └── reportService.js
├── store/            # Zustand stores
│   └── authStore.js
├── views/            # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Attendance.jsx
│   ├── Leave.jsx
│   ├── Overtime.jsx
│   └── admin/        # Admin pages
│       ├── AdminAttendance.jsx
│       ├── AdminLeave.jsx
│       ├── AdminOvertime.jsx
│       ├── AdminUsers.jsx
│       └── AdminReports.jsx
├── App.jsx           # Main app with routing
└── main.jsx         # Entry point
```

## 🔐 Default Login

### Admin
- Email: `admin@mail.com`
- Password: `password123`

### Employee
- Email: `employee@mail.com`
- Password: `password123`

## 🌟 Key Features Detail

### Attendance System
- GPS-based check-in/out
- Camera/selfie photo capture
- Photo upload from file
- Real-time location tracking
- Attendance history

### Leave Management
- Multiple leave types (Annual, Sick, Personal, Emergency)
- Date range selection
- Status tracking (Pending, Approved, Rejected)
- Cancel pending requests

### Overtime Management
- Time-based overtime request
- Hour calculation
- Approval workflow
- Status tracking

### Admin Panel
- Comprehensive user management
- Attendance monitoring
- Request approval system
- Report generation & export
- Dashboard analytics

## 🎨 UI/UX Features

- Responsive design (Mobile-first)
- Dark mode support (via Tailwind)
- Loading states
- Error handling
- Toast notifications
- Modal dialogs
- Table pagination
- Search & filters

## 🔒 Security Features

- JWT token authentication
- Protected routes
- Role-based access control
- Auto logout on token expiry
- Secure API communication

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🐛 Development

```bash
# Run with hot reload
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## 📝 Notes

- Pastikan backend server berjalan di `http://localhost:3000`
- Gunakan browser modern (Chrome, Firefox, Safari, Edge)
- Enable camera & location permission untuk attendance
- Data disimpan di localStorage untuk persistence

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
