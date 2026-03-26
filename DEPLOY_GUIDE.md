# 🚀 DEPLOYMENT GUIDE - Website Local

## 📋 LANGKAH MUDAH DEPLOYMENT

Saya sudah membuat script otomatis untuk memudahkan deployment!

---

## ⚡ QUICK START (3 Steps)

### Step 1: Install PostgreSQL

**Pilih salah satu:**

#### 🔷 Option A: Postgres.app (PALING MUDAH)
```bash
# 1. Download dari: https://postgresapp.com/
# 2. Drag ke Applications
# 3. Buka app
# 4. Klik "Initialize"
# 5. Done! ✅
```

#### 🔷 Option B: Official Installer
```bash
# 1. Visit: https://www.postgresql.org/download/macosx/
# 2. Download PostgreSQL 14
# 3. Install seperti app biasa
# 4. Ikuti wizard
# 5. Start dari System Preferences
```

#### 🔷 Option C: Homebrew
```bash
# Install Homebrew dulu (kalau belum punya)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14
```

---

### Step 2: Run Deployment Script

```bash
cd /Users/mac/Downloads/SaaS-HR-Management-Systems

# Run auto deployment
./deploy.sh
```

**Script akan otomatis:**
- ✅ Check PostgreSQL
- ✅ Create database (jika belum ada)
- ✅ Run migrations
- ✅ Seed initial data
- ✅ Verify everything ready

---

### Step 3: Start Services

```bash
# Start backend & frontend
./start.sh
```

**Script akan otomatis:**
- ✅ Start backend server (port 3000)
- ✅ Start frontend client (port 5173)
- ✅ Open browser
- ✅ Show login credentials

**Browser akan terbuka otomatis di:** http://localhost:5173

---

## 🎯 MANUAL START (Alternative)

Jika prefer manual:

```bash
# Terminal 1 - Backend
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/server
npm run dev

# Terminal 2 - Frontend (Cmd+T untuk new tab)
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/client_Salmon-HRIS
npm run dev

# Browser
open http://localhost:5173
```

---

## 🔑 LOGIN CREDENTIALS

### Admin (Company Administrator)
```
Email:    admin@company.com
Password: admin123
Access:   Full admin dashboard
```

### Employee (Regular User)
```
Email:    budi@company.com
Password: password123
Access:   Employee dashboard
```

### Super Admin (Platform Owner)
```
Email:    superadmin@hrsystem.com
Password: superadmin123
Access:   All companies management
```

---

## 🛑 STOP SERVICES

```bash
# Stop semua services
./stop.sh
```

Or manually:
```bash
# Kill backend
kill $(lsof -ti:3000)

# Kill frontend
kill $(lsof -ti:5173)
```

---

## 📊 VERIFY DEPLOYMENT

### Check Backend:
```bash
# Test endpoint
curl http://localhost:3000/test-ip

# Should return JSON with IP info
```

### Check Frontend:
```bash
# Check if running
lsof -ti:5173

# Should return process ID
```

### Check Database:
```bash
# Connect to database
psql -U postgres -d Project_HR_Management_Systems_db -c "\dt"

# Should show 20+ tables
```

---

## 🎨 WHAT YOU'LL SEE

### 1. Login Page (http://localhost:5173)
```
┌─────────────────────────────────────┐
│         🏢 SALMON HRIS              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Email    [________________]   │ │
│  │ Password [________________]   │ │
│  │                               │ │
│  │        [  LOGIN  ]            │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Admin Dashboard
```
┌─────────────────────────────────────────────┐
│  📊 Dashboard                                │
│  ├─ 👥 Total Employees: 150                 │
│  ├─ ✅ Present Today: 142                   │
│  ├─ 🏖️ On Leave: 5                          │
│  └─ ⏰ Overtime Requests: 3                 │
│                                              │
│  📈 [Attendance Chart]                       │
│  📊 [Leave Statistics]                       │
└─────────────────────────────────────────────┘
```

### 3. Employee Dashboard
```
┌─────────────────────────────────────────────┐
│  👤 Welcome, Budi Santoso                   │
│                                              │
│  📅 Attendance                               │
│  ├─ Status: Not Clocked In                  │
│  └─ [🕐 Clock In]                           │
│                                              │
│  🏖️ Leave Balance                           │
│  ├─ Annual: 12 days                         │
│  └─ Sick: 7 days                            │
│                                              │
│  📋 Recent Activity                          │
│  └─ Last attendance: March 11, 2026         │
└─────────────────────────────────────────────┘
```

---

## 🔍 TROUBLESHOOTING

### Problem: PostgreSQL not found
```bash
# Check installation
which psql

# If not found, install using one of the methods above
```

### Problem: Database connection error
```bash
# Check PostgreSQL is running
ps aux | grep postgres

# Check credentials in server/.env
cat server/.env | grep DB_

# Test connection
psql -U postgres -c '\q'
```

### Problem: Port already in use
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

### Problem: Frontend shows blank page
```bash
# Check console for errors
# Press: Cmd+Option+I in browser

# Check if backend is running
curl http://localhost:3000/test-ip

# Check frontend env
cat client_Salmon-HRIS/.env
```

---

## 📁 USEFUL SCRIPTS

### Created for you:
- **`deploy.sh`** - Auto setup database & dependencies
- **`start.sh`** - Start backend & frontend
- **`stop.sh`** - Stop all services

### Usage:
```bash
# First time setup
./deploy.sh

# Start services
./start.sh

# Stop services
./stop.sh
```

---

## 🎯 SUCCESS CHECKLIST

After deployment, verify:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173
- [ ] Can login successfully
- [ ] Can see dashboard
- [ ] Can navigate pages
- [ ] API calls return 200 OK
- [ ] Data saves to database

---

## 📞 NEXT STEPS

1. **Install PostgreSQL** (choose method above)
2. **Run:** `./deploy.sh`
3. **Run:** `./start.sh`
4. **Open:** http://localhost:5173
5. **Login & Test!** 🎉

---

## 🚀 PRODUCTION DEPLOYMENT (Later)

Setelah local deployment berhasil, untuk production:

### Backend Options:
- **Railway.app** (Recommended - easiest)
- **Heroku** (Classic, reliable)
- **DigitalOcean App Platform**
- **AWS EC2** (most control)

### Frontend Options:
- **Vercel** (Recommended for React)
- **Netlify** (Great for SPA)
- **Cloudflare Pages**
- **AWS S3 + CloudFront**

### Database Options:
- **Railway PostgreSQL** (same as backend)
- **Heroku Postgres**
- **Supabase** (PostgreSQL + extras)
- **AWS RDS**

**I can help with production deployment after local works!**

---

**Need Help?** Just ask! 😊
