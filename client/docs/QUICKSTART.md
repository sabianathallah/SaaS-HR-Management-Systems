# 🚀 QUICK START GUIDE

## ⚡ Setup Cepat (5 Menit)

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: **http://localhost:5173/**

### 3. Login
Buka browser dan akses: http://localhost:5173/

**Admin Login:**
- Email: `admin@mail.com`
- Password: `password123`

**Employee Login:**
- Email: `employee@mail.com`
- Password: `password123`

---

## 📋 Catatan Penting

### Backend Server
Pastikan backend server sudah berjalan di `http://localhost:3000`

```bash
# Di terminal lain
cd ../server
npm start
```

### Browser Permissions
Untuk attendance features:
- ✅ Allow **Camera** access
- ✅ Allow **Location** access

---

## 🎯 Test Flow

### Sebagai Employee:
1. Login dengan `employee@mail.com`
2. Klik "Check In/Out" di dashboard
3. Allow camera & location permission
4. Test check-in dengan GPS & photo
5. Test check-out
6. Buat leave request
7. Buat overtime request

### Sebagai Admin:
1. Login dengan `admin@mail.com`
2. View dashboard statistics
3. Kelola users (Create, Edit, Delete)
4. Review & approve leave requests
5. Review & approve overtime requests
6. Export reports

---

## 🔧 Commands

```bash
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📁 Struktur Penting

```
client/
├── src/
│   ├── views/              # Pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Attendance.jsx
│   │   ├── Leave.jsx
│   │   ├── Overtime.jsx
│   │   └── admin/         # Admin pages
│   ├── components/        # Reusable components
│   ├── services/          # API calls
│   ├── store/            # State management
│   └── utils/            # Helper functions
├── .env                  # Environment config
└── package.json
```

---

## 🐛 Quick Fixes

### Cannot connect to API
```bash
# Check .env file
cat .env
# Should show: VITE_API_URL=http://localhost:3000

# Restart dev server
npm run dev
```

### Camera not working
- Gunakan HTTPS atau localhost
- Check browser permissions
- Try Chrome/Firefox

### GPS not working
- Allow location permission
- Refresh page
- Try different browser

---

## ✅ Checklist Sebelum Production

- [ ] Test all features
- [ ] Update environment variables
- [ ] Build production bundle
- [ ] Test production build
- [ ] Configure HTTPS
- [ ] Setup error tracking
- [ ] Add analytics (optional)
- [ ] Security audit
- [ ] Performance optimization

---

## 📞 Support

Jika ada masalah, check:
1. Console browser (F12)
2. Network tab untuk API errors
3. Terminal untuk build errors

---

**Selamat Menggunakan! 🎉**
