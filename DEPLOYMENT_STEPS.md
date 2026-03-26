# 🚀 DEPLOYMENT STEPS - Website (Backend + Frontend)

**Generated:** March 12, 2026  
**Target:** Local Development Deployment

---

## ⚠️ CURRENT SITUATION

**Detected:**
- ❌ PostgreSQL not installed
- ❌ Docker not available
- ❌ Homebrew not available
- ✅ Node.js available (npm works)
- ✅ Code complete
- ✅ Dependencies installed

**Solution:** Install PostgreSQL first, then deploy!

---

## 📋 DEPLOYMENT CHECKLIST

### Phase 1: Database Setup
- [ ] Install PostgreSQL
- [ ] Start PostgreSQL service
- [ ] Create database
- [ ] Run migrations
- [ ] Seed initial data

### Phase 2: Backend Setup
- [ ] Verify .env configuration
- [ ] Test database connection
- [ ] Start backend server
- [ ] Test API endpoints

### Phase 3: Frontend Setup
- [ ] Verify .env configuration
- [ ] Start frontend dev server
- [ ] Test in browser
- [ ] Test login flow

### Phase 4: Integration Test
- [ ] Login as different roles
- [ ] Test CRUD operations
- [ ] Verify data persistence
- [ ] Check notifications

---

## 🛠️ STEP-BY-STEP DEPLOYMENT

### STEP 1: Install PostgreSQL

#### Option A: Using Homebrew (Recommended)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify
psql --version
```

#### Option B: Download Installer
```
1. Visit: https://www.postgresql.org/download/macosx/
2. Download PostgreSQL 14 or 15
3. Run installer
4. Follow installation wizard
5. Start PostgreSQL from Applications or System Preferences
```

#### Option C: Using Postgres.app (Easiest for Mac)
```
1. Visit: https://postgresapp.com/
2. Download Postgres.app
3. Move to Applications
4. Open Postgres.app
5. Click "Initialize" to create database server
6. PostgreSQL will run automatically
```

**WAIT HERE!** Install PostgreSQL dulu, baru lanjut ke step berikutnya.

---

### STEP 2: Create Database

```bash
# After PostgreSQL is installed and running:

# Connect to PostgreSQL
psql -U postgres

# Or if using Postgres.app:
psql -h localhost

# In PostgreSQL prompt, run:
CREATE DATABASE "Project_HR_Management_Systems_db";

# List databases to verify
\l

# Exit
\q
```

**Expected Output:**
```
CREATE DATABASE
```

---

### STEP 3: Run Database Migrations

```bash
# Navigate to server directory
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/server

# Run all migrations
npx sequelize-cli db:migrate

# Expected output:
# Sequelize CLI [Node: xx.x.x, CLI: x.x.x, ORM: x.x.x]
# 
# Loaded configuration file "config/config.js".
# Using environment "development".
# == 20231201000000-create-user: migrating =======
# == 20231201000000-create-user: migrated (0.123s)
# ... (20+ migrations)
```

**Verify migrations:**
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Should show all migrations as "up"
```

---

### STEP 4: Seed Initial Data

```bash
# Still in server directory

# Run seeders (creates default users, companies, etc.)
npx sequelize-cli db:seed:all

# Expected output:
# Sequelize CLI [Node: xx.x.x, CLI: x.x.x, ORM: x.x.x]
# 
# Loaded configuration file "config/config.js".
# Using environment "development".
# == 20231201000001-demo-companies: seeding =======
# == 20231201000001-demo-companies: seeded (0.045s)
# ... (multiple seeders)
```

**What gets seeded:**
- Super Admin user (superadmin@hrsystem.com)
- Default company
- Company Admin user (admin@company.com)
- Sample employees (budi@company.com, ani@company.com)
- Sample shifts, work schedules, holidays

---

### STEP 5: Start Backend Server

```bash
# In server directory
npm run dev

# Expected output:
# [nodemon] 3.0.2
# [nodemon] to restart at any time, enter `rs`
# [nodemon] watching path(s): *.*
# [nodemon] watching extensions: js,mjs,json
# [nodemon] starting `node bin/www.js`
# ✅ Server running on http://0.0.0.0:3000
# 📱 Accessible from mobile: http://192.168.1.20:3000
```

**Leave this terminal running!**

---

### STEP 6: Test Backend

**Open new terminal (Cmd+T) and test:**

```bash
# Test 1: Health check
curl http://localhost:3000/test-ip

# Expected: JSON with IP detection info

# Test 2: Login endpoint
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Expected: JSON with access_token

# Test 3: Protected endpoint (should fail without token)
curl http://localhost:3000/attendances

# Expected: {"message":"Unauthorized: No authorization header provided"}
```

**If all tests pass:** ✅ Backend is working!

---

### STEP 7: Start Frontend

```bash
# Open new terminal (Cmd+T)
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/client_Salmon-HRIS

# Start Vite dev server
npm run dev

# Expected output:
# VITE v7.2.4  ready in 1234 ms
# 
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.20:5173/
# ➜  press h + enter to show help
```

**Leave this terminal running!**

---

### STEP 8: Test Frontend

```bash
# Open browser
open http://localhost:5173

# Or manually navigate to:
# http://localhost:5173
```

**You should see:**
- ✅ Login page loads
- ✅ No console errors
- ✅ Salmon HRIS logo/branding

---

### STEP 9: Test Integration (Login Flow)

**In browser (http://localhost:5173):**

1. **Login as Admin:**
   ```
   Email: admin@company.com
   Password: admin123
   ```

2. **Check:**
   - ✅ Login successful
   - ✅ Redirect to `/admin/dashboard`
   - ✅ See admin sidebar
   - ✅ See dashboard statistics

3. **Open Browser DevTools:**
   - Press: `Cmd+Option+I`
   - Go to **Network** tab
   - Click around (Employees, Attendance, etc.)
   - Should see API calls: `http://localhost:3000/...`
   - All requests should return 200 OK

4. **Test CRUD:**
   - Go to Employees page
   - Create/Edit employee
   - Should save successfully

---

### STEP 10: Test Different Roles

**Logout and login as:**

#### Employee:
```
Email: budi@company.com
Password: password123
Expected: Redirect to /employee
```

#### Super Admin:
```
Email: superadmin@hrsystem.com
Password: superadmin123
Expected: Redirect to /super-admin/dashboard
```

---

## 🎯 CURRENT TERMINALS NEEDED

```
Terminal 1 (Backend):
┌────────────────────────────────────────┐
│ cd server                              │
│ npm run dev                            │
│                                        │
│ Status: Running ✅                     │
│ Port: 3000                             │
│ Output: Server logs                    │
└────────────────────────────────────────┘

Terminal 2 (Frontend):
┌────────────────────────────────────────┐
│ cd client_Salmon-HRIS                  │
│ npm run dev                            │
│                                        │
│ Status: Running ✅                     │
│ Port: 5173                             │
│ Output: Vite logs                      │
└────────────────────────────────────────┘

Terminal 3 (Testing/Commands):
┌────────────────────────────────────────┐
│ Available for running test commands    │
│ curl, etc.                             │
└────────────────────────────────────────┘
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: PostgreSQL Connection Failed

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# If not running, start it:
# If installed via Homebrew:
brew services start postgresql@14

# If using Postgres.app:
# Open Postgres.app manually
```

---

### Issue 2: Database Not Found

**Error:**
```
ERROR: database "Project_HR_Management_Systems_db" does not exist
```

**Solution:**
```bash
# Create database
psql -U postgres -c 'CREATE DATABASE "Project_HR_Management_Systems_db";'

# Or use GUI tool (TablePlus, pgAdmin, etc.)
```

---

### Issue 3: Migration Failed

**Error:**
```
ERROR: relation "Users" already exists
```

**Solution:**
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# If needed, undo all and redo:
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

---

### Issue 4: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in .env:
PORT=3001
```

---

### Issue 5: CORS Error in Browser

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Check backend CORS config
cat server/.env | grep ALLOWED_ORIGINS

# Should include: http://localhost:5173
# If not, add it:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3005

# Restart backend server
```

---

### Issue 6: Frontend Can't Connect

**Error in browser console:**
```
Network Error / ERR_CONNECTION_REFUSED
```

**Solution:**
1. Check backend is running: `lsof -ti:3000`
2. Check frontend .env: `cat client_Salmon-HRIS/.env`
3. Verify URL matches: Backend port = Frontend VITE_BASE_URL

---

## 📝 VERIFICATION COMMANDS

### Check Backend Health:
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
psql -U postgres -d Project_HR_Management_Systems_db

# List tables
\dt

# Should see 20+ tables
# Exit: \q
```

---

## 🎯 SUCCESS CRITERIA

### Backend: ✅ Running Successfully
- Terminal shows: "Server running on http://0.0.0.0:3000"
- curl test returns JSON
- No error messages

### Frontend: ✅ Running Successfully
- Terminal shows: "VITE ready"
- Browser opens http://localhost:5173
- Login page loads without errors

### Database: ✅ Connected
- Migrations completed
- Seed data loaded
- Tables created

### Integration: ✅ Working
- Can login successfully
- Can see data in dashboard
- Can perform CRUD operations
- No network errors in console

---

## 🚀 QUICK START (After PostgreSQL Installed)

```bash
# ONE-TIME SETUP:
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# START BACKEND (Terminal 1):
npm run dev

# START FRONTEND (Terminal 2 - Cmd+T):
cd ../client_Salmon-HRIS
npm run dev

# OPEN BROWSER:
open http://localhost:5173

# LOGIN:
Email: admin@company.com
Password: admin123
```

---

## 📦 WHAT WE'LL DEPLOY

### Backend:
- Express.js server
- REST API endpoints
- Authentication system
- Database connection
- File uploads
- Email service
- Cron jobs

### Frontend:
- React SPA
- Admin dashboard
- Employee portal
- Super admin panel
- Real-time updates

---

## 🎉 NEXT STEPS AFTER LOCAL DEPLOYMENT

Once local deployment works:

1. **Test thoroughly**
   - All features
   - All roles
   - Edge cases

2. **Prepare for production**
   - Choose hosting (Heroku, AWS, DigitalOcean, Vercel)
   - Setup production database
   - Configure production env variables
   - Setup CI/CD

3. **Deploy to production**
   - Backend → Heroku/Railway/DigitalOcean
   - Frontend → Vercel/Netlify
   - Database → Managed PostgreSQL

---

## 💡 RECOMMENDED: Install PostgreSQL First

Choose one method:

### Method 1: Homebrew (Most Common)
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install PostgreSQL
brew install postgresql@14
brew services start postgresql@14
```

### Method 2: Official Installer
```
1. Visit: https://www.postgresql.org/download/macosx/
2. Download PostgreSQL 14 installer
3. Run and follow wizard
4. Remember the password you set
5. Start PostgreSQL from launcher
```

### Method 3: Postgres.app (Easiest!)
```
1. Visit: https://postgresapp.com/
2. Download Postgres.app
3. Drag to Applications
4. Open app → Click Initialize
5. Done! PostgreSQL running
```

---

## ⏭️ READY TO CONTINUE?

After installing PostgreSQL, tell me:
- "PostgreSQL sudah terinstall"

Then I'll help you:
1. ✅ Create database
2. ✅ Run migrations
3. ✅ Start backend
4. ✅ Start frontend
5. ✅ Test everything!

---

**Next:** Install PostgreSQL, then we continue! 🚀
