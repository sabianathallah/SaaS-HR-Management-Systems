# Setup Cron Job untuk Auto Set Absent

## Instalasi

1. Install package `node-cron`:
```bash
cd server
npm install node-cron
```

2. Aktifkan cron job di `app.js`:

Uncomment baris berikut di file `server/app.js`:
```javascript
const { setupCronJobs } = require('./scheduler/cronJobs')
// ...
setupCronJobs()
```

## Konfigurasi Schedule

File: `server/scheduler/cronJobs.js`

### Default Schedule:
- **18:00 (6 PM)** - Primary schedule
- **23:00 (11 PM)** - Backup schedule

### Format Cron:
```
 ┌────────────── second (optional, 0-59)
 │ ┌──────────── minute (0-59)
 │ │ ┌────────── hour (0-23)
 │ │ │ ┌──────── day of month (1-31)
 │ │ │ │ ┌────── month (1-12)
 │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
 │ │ │ │ │ │
 * * * * * *
```

### Contoh Schedule:
```javascript
// Setiap hari jam 18:00
cron.schedule('0 18 * * *', callback);

// Setiap hari kerja (Senin-Jumat) jam 18:00
cron.schedule('0 18 * * 1-5', callback);

// Setiap jam
cron.schedule('0 * * * *', callback);

// Setiap 30 menit
cron.schedule('*/30 * * * *', callback);
```

## Testing

### Manual Test:
Panggil endpoint manual (sebagai admin):
```bash
POST http://localhost:3000/attendances/auto-set-absent
Authorization: Bearer <admin-token>
```

### Test Cron Function:
Tambahkan di `app.js` untuk test immediate execution:
```javascript
const { autoSetAbsent } = require('./scheduler/cronJobs');

// Test run immediately
autoSetAbsent();
```

## Production Deployment

### Option 1: Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start app.js --name "hr-system"
pm2 save
pm2 startup
```

### Option 2: Using systemd (Linux)
Create file `/etc/systemd/system/hr-system.service`:
```ini
[Unit]
Description=HR Management System
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Option 3: Using Docker
Ensure cron job runs inside container - node-cron will work automatically.

## Monitoring

### Check Logs:
```bash
# With PM2
pm2 logs hr-system

# Direct output
npm run dev
```

### Expected Log Output:
```
⏰ Setting up cron jobs...
✅ Cron jobs setup complete
📅 Schedule: Auto set absent at 6 PM and 11 PM daily
```

When cron runs:
```
⏰ Cron job triggered at 6 PM
🤖 Running auto set absent job...
✅ Auto set absent completed. 3 users marked as absent.
📋 Absent users: ['user1@mail.com', 'user2@mail.com', 'user3@mail.com']
```

## Troubleshooting

### Cron tidak jalan?
1. Pastikan server terus berjalan (gunakan PM2 atau systemd)
2. Check timezone server
3. Verifikasi cron schedule syntax

### Test timezone:
```javascript
console.log('Server timezone:', new Date().toString());
```

### Manual trigger untuk testing:
```javascript
// Di cronJobs.js, ubah schedule menjadi setiap menit untuk testing:
cron.schedule('* * * * *', () => {
  console.log('Test cron every minute');
  autoSetAbsent();
});
```

## Alternative: External Cron

Jika tidak ingin menggunakan node-cron, gunakan system cron:

```bash
# Edit crontab
crontab -e

# Tambahkan:
0 18 * * * curl -X POST http://localhost:3000/attendances/auto-set-absent -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Disable Cron Job

Comment atau hapus baris di `app.js`:
```javascript
// setupCronJobs() // Disabled
```
