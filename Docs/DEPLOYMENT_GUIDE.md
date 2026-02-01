# 🚀 DEPLOYMENT GUIDE - Work Location & Hybrid Schedule

## Pre-Deployment Checklist

### ✅ Backend Ready
- [x] All migrations created
- [x] Models defined with validations
- [x] Controllers implemented
- [x] Routes registered
- [x] Helper functions created
- [x] Integration with attendance system
- [x] Error handling implemented
- [x] Authentication/authorization configured

### ✅ Frontend Ready
- [x] All components created
- [x] Pages created
- [x] Routes integrated
- [x] Build successful (no errors)
- [x] Responsive design
- [x] Error handling implemented

### ✅ Documentation Ready
- [x] API documentation
- [x] User guides
- [x] Architecture diagrams
- [x] Testing guides

---

## Step-by-Step Deployment

### STEP 1: Database Migration

```bash
# Navigate to server directory
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/server

# Run migrations
npx sequelize-cli db:migrate

# Verify tables created
psql -d your_database_name -c "\dt"

# Should see:
# - WorkLocationChangeRequests
# - HybridSchedules
```

**Expected Output:**
```
Sequelize CLI [Node: XX.X.X, CLI: X.X.X, ORM: X.X.X]

Loaded configuration file "config/config.json".
Using environment "development".
== 20260116132520-create-work-location-change-request: migrating =======
== 20260116132520-create-work-location-change-request: migrated (0.XXXs)
== 20260116132527-create-hybrid-schedule: migrating =======
== 20260116132527-create-hybrid-schedule: migrated (0.XXXs)
```

**Verification SQL:**
```sql
-- Check table structure
\d "WorkLocationChangeRequests"
\d "HybridSchedules"

-- Check indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('WorkLocationChangeRequests', 'HybridSchedules');

-- Should show:
-- - Primary key indexes
-- - userId indexes
-- - status index on WorkLocationChangeRequests
-- - Unique constraint on (UserId, dayOfWeek) for HybridSchedules
```

---

### STEP 2: Backend Testing

```bash
# Start server
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/server
npm start

# Should see:
# Server running on port 3000
# Database connection established
```

**Test Endpoints with curl:**

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123"
  }'

# Save the access_token from response

# 2. Test get hybrid schedule (should return empty array initially)
curl -X GET http://localhost:3000/hybrid-schedules \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: { "message": "...", "data": [] }

# 3. Test create work location request
curl -X POST http://localhost:3000/work-location-changes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "requestDate": "2025-01-25",
    "requestedLocationType": "WFH",
    "reason": "Need to work from home for personal matter"
  }'

# Expected: 201 Created with request data

# 4. Test admin endpoints (use admin token)
curl -X GET http://localhost:3000/work-location-changes/admin/pending \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Expected: List of pending requests
```

**Health Check:**
```bash
# Check server logs for errors
tail -f server_logs.log

# Should not see:
# - Database connection errors
# - Route not found errors
# - Validation errors on valid data
```

---

### STEP 3: Frontend Build

```bash
# Navigate to client directory
cd /Users/mac/Downloads/SaaS-HR-Management-Systems/client_Salmon-HRIS

# Install dependencies (if not already)
npm install

# Build for production
npm run build

# Expected output:
# ✓ XX modules transformed
# dist/index.html
# dist/assets/*.js
# dist/assets/*.css
# ✓ built in X.XXs
```

**Build Success Indicators:**
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Bundle size reasonable (< 1MB)
- ✅ All assets copied to dist/

**Check Build Output:**
```bash
# List dist folder
ls -lh client_Salmon-HRIS/dist

# Should see:
# - index.html
# - assets/ directory with JS and CSS files
# - Public assets (images, etc.)
```

---

### STEP 4: Environment Configuration

#### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-production-db-host
DB_NAME=hr_management_system
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_PORT=5432
DB_DIALECT=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

#### Frontend (.env.production)

```env
VITE_BASE_URL=https://your-backend-api.com
```

**Security Notes:**
- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Never commit .env files to git
- ✅ Use environment variables in CI/CD
- ✅ Restrict CORS to specific domains
- ✅ Use HTTPS in production

---

### STEP 5: Deploy Backend

#### Option A: Traditional Server (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to server directory
cd server

# Start with PM2
pm2 start app.js --name "hr-backend"

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs hr-backend
```

**PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'hr-backend',
    script: './app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

#### Option B: Docker

```dockerfile
# Dockerfile (backend)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

```bash
# Build image
docker build -t hr-backend:latest .

# Run container
docker run -d \
  --name hr-backend \
  -p 3000:3000 \
  --env-file .env \
  hr-backend:latest
```

#### Option C: Cloud Platform (Heroku/Railway/Render)

**For Heroku:**
```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npx sequelize-cli db:migrate
```

**For Railway:**
1. Connect GitHub repository
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy automatically on push

---

### STEP 6: Deploy Frontend

#### Option A: Static Hosting (Netlify/Vercel)

**For Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd client_Salmon-HRIS
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
# VITE_BASE_URL=https://your-backend-api.com
```

**For Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client_Salmon-HRIS
vercel --prod

# Configure environment variables in Vercel dashboard
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option B: Docker + Nginx

```dockerfile
# Dockerfile (frontend)
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

### STEP 7: Database Seeding (Optional)

```bash
# Create admin user seed
npx sequelize-cli seed:generate --name demo-users

# Edit seed file to create admin user
# Then run:
npx sequelize-cli db:seed:all
```

**Example Seed (for testing):**
```javascript
// seeders/XXXXXX-demo-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        id: 'uuid-here',
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'hashed-password',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'uuid-here-2',
        name: 'Test Employee',
        email: 'employee@company.com',
        password: 'hashed-password',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
```

---

### STEP 8: Post-Deployment Testing

#### Backend Health Check
```bash
# Check if API is responding
curl https://your-backend-api.com/health

# Test authentication
curl -X POST https://your-backend-api.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Frontend Health Check
```bash
# Visit frontend URL
curl https://your-frontend-domain.com

# Should return HTML with no 404 errors
```

#### Integration Test
1. ✅ Open frontend in browser
2. ✅ Login with test credentials
3. ✅ Navigate to Work Location tab
4. ✅ Create hybrid schedule
5. ✅ Create work location request
6. ✅ Login as admin
7. ✅ Approve/reject requests
8. ✅ View statistics

---

### STEP 9: Monitoring & Logging

#### Backend Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs hr-backend --lines 100

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

#### Database Monitoring
```sql
-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('WorkLocationChangeRequests', 'HybridSchedules');

-- Check row counts
SELECT 'WorkLocationChangeRequests' as table, COUNT(*) FROM "WorkLocationChangeRequests"
UNION ALL
SELECT 'HybridSchedules', COUNT(*) FROM "HybridSchedules";

-- Check recent activity
SELECT status, COUNT(*) 
FROM "WorkLocationChangeRequests" 
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY status;
```

#### Application Monitoring (Recommended Tools)
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Full-stack monitoring
- **New Relic**: Performance monitoring

---

### STEP 10: Rollback Plan

#### If Migration Fails
```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Or rollback specific migration
npx sequelize-cli db:migrate:undo --name 20260116132520-create-work-location-change-request.js
```

#### If Deployment Fails
```bash
# PM2 rollback
pm2 delete hr-backend
pm2 start previous-version/app.js

# Docker rollback
docker stop hr-backend
docker run -d --name hr-backend previous-image:tag

# Git rollback
git revert HEAD
git push origin main
```

---

## Performance Optimization

### Backend
```javascript
// Add caching for statistics
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// In controller:
const cachedStats = cache.get('work-location-stats');
if (cachedStats) {
  return res.json(cachedStats);
}
// ... fetch from DB
cache.set('work-location-stats', result);
```

### Database
```sql
-- Add indexes if not exists
CREATE INDEX IF NOT EXISTS idx_wlcr_user_date 
ON "WorkLocationChangeRequests" ("UserId", "requestDate");

CREATE INDEX IF NOT EXISTS idx_wlcr_status 
ON "WorkLocationChangeRequests" ("status");

-- Analyze tables
ANALYZE "WorkLocationChangeRequests";
ANALYZE "HybridSchedules";
```

### Frontend
```javascript
// Add lazy loading
const WorkLocationManagement = lazy(() => 
  import('../components/admin/WorkLocationManagement')
);

// Add code splitting
<Suspense fallback={<Loading />}>
  <WorkLocationManagement />
</Suspense>
```

---

## Security Hardening

### Backend
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/work-location-changes', apiLimiter);
app.use('/hybrid-schedules', apiLimiter);

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

### Database
```sql
-- Create read-only user for reports
CREATE USER readonly_user WITH PASSWORD 'secure-password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

---

## Backup Strategy

### Database Backup
```bash
# Daily backup cron job
0 2 * * * pg_dump -U postgres hr_management_system > /backups/db_$(date +\%Y\%m\%d).sql

# Backup retention (keep 30 days)
find /backups -name "db_*.sql" -mtime +30 -delete
```

### Application Backup
```bash
# Backup uploads directory
rsync -av /app/uploads /backups/uploads_$(date +\%Y\%m\%d)

# Backup configuration
cp .env /backups/.env_$(date +\%Y\%m\%d)
```

---

## Troubleshooting

### Issue: "Relation does not exist"
**Solution:**
```bash
# Run migrations again
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status
```

### Issue: "JWT malformed"
**Solution:**
- Check token format in localStorage
- Verify JWT_SECRET matches between environments
- Regenerate token by logging in again

### Issue: "CORS error"
**Solution:**
- Add frontend domain to ALLOWED_ORIGINS
- Check CORS middleware configuration
- Verify request headers

### Issue: "Cannot read property of undefined"
**Solution:**
- Check API response structure
- Add null checks in frontend
- Verify backend returns expected format

---

## Success Metrics

After deployment, verify:
- ✅ Zero downtime during deployment
- ✅ All migrations applied successfully
- ✅ No errors in server logs (first hour)
- ✅ Frontend loads without console errors
- ✅ API response time < 200ms
- ✅ Database queries optimized
- ✅ All features functional
- ✅ Mobile responsive working
- ✅ Authentication working
- ✅ Admin permissions enforced

---

## Maintenance Schedule

### Daily
- Check server logs for errors
- Monitor disk space
- Review failed requests

### Weekly
- Backup database
- Review statistics
- Check performance metrics
- Update dependencies (security patches)

### Monthly
- Full system backup
- Performance optimization review
- Security audit
- Update documentation

---

## Contact & Support

**Developer:** GitHub Copilot
**Documentation:** See FINAL_COMPLETE_SUMMARY.md
**Issues:** Create GitHub issue
**Email:** support@yourcompany.com

---

**🎉 Deployment Complete! 🚀**

Your Work Location Management & Hybrid Schedule system is now live!
