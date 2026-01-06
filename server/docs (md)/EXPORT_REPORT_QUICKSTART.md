# 📊 Export & Report Feature - Quick Start

Fitur export dan report untuk attendance system sudah berhasil diimplementasikan!

## ✅ Yang Sudah Dibuat

1. **Helper Functions** (`helpers/export.js`)
   - Export to Excel with formatting
   - Export to CSV
   - Generate Monthly Report (3 sheets)

2. **Controller** (`controllers/reportController.js`)
   - Export Attendance to Excel
   - Export Attendance to CSV
   - Generate Monthly Report
   - Report Preview (JSON)
   - Employee Performance Report

3. **Routes** (`routes/report_isAdmin.js`)
   - Registered at `/reports`
   - Admin-only access

4. **Dependencies**
   - ✅ exceljs (untuk Excel)
   - ✅ json2csv (untuk CSV)
   - ✅ bcryptjs (dependency fix)

## 🚀 Quick Test

### 1. Start Server
```bash
cd server
npm run dev
```

### 2. Login sebagai Admin
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Simpan token yang didapat.

### 3. Test Export Excel
```bash
export TOKEN="your_jwt_token_here"

curl -X GET \
  'http://localhost:3000/reports/export/excel?startDate=2025-12-01&endDate=2025-12-31' \
  -H "Authorization: Bearer $TOKEN" \
  --output test_report.xlsx
```

### 4. Test Monthly Report
```bash
curl -X GET \
  'http://localhost:3000/reports/monthly?month=12&year=2025' \
  -H "Authorization: Bearer $TOKEN" \
  --output monthly_dec_2025.xlsx
```

### 5. Test Preview (JSON)
```bash
curl -X GET \
  'http://localhost:3000/reports/preview?limit=5' \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/export/excel` | Export ke Excel |
| GET | `/reports/export/csv` | Export ke CSV |
| GET | `/reports/monthly` | Monthly report (3 sheets) |
| GET | `/reports/preview` | Preview data (JSON) |
| GET | `/reports/employee-performance` | Employee performance |

## 🔧 Query Parameters

### Export Excel/CSV
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `userId`: Integer
- `status`: ON_TIME, LATE, ABSENT, etc.

### Monthly Report
- `month`: 1-12 (required)
- `year`: YYYY (required)

### Employee Performance
- `userId`: Integer (required)
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

## 📖 Full Documentation

Lihat dokumentasi lengkap di: `docs (md)/EXPORT_REPORT_ENDPOINTS.md`

## 🐛 Troubleshooting

### Error: "Router.use() requires a middleware function"
**Fixed!** Import middleware sudah diperbaiki di `report_isAdmin.js`

### Error: "Cannot find module bcryptjs"
**Fixed!** Dependency sudah ditambahkan ke `package.json`

### Port 3000 already in use
Kill process yang menggunakan port:
```bash
lsof -ti:3000 | xargs kill -9
```

## 📦 Excel File Structure

### Standard Export
- 1 Sheet dengan data attendance
- Summary section (total records, work hours, overtime)
- Formatted headers dan borders

### Monthly Report
- **Sheet 1**: Monthly Summary (statistics)
- **Sheet 2**: Employee Statistics (per-employee breakdown)
- **Sheet 3**: Detailed Attendance (all records)

## 🎯 Next Steps

1. Test semua endpoints dengan data real
2. Customize Excel columns jika perlu
3. Add additional filters jika diperlukan
4. Implement frontend untuk download files

## ⚡ Performance Tips

- Gunakan date range filter untuk dataset besar
- Preview endpoint sudah ada limit default (100)
- Monthly report lebih efisien daripada export semua data

---

**Status**: ✅ Ready to use
**Last Updated**: January 6, 2026
