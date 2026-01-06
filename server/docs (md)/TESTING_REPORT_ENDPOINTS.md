# Testing Report Endpoints

## Prerequisites
1. Server running on `http://localhost:3000`
2. Admin user credentials: `admin@company.com` / `admin123`
3. Sample attendance data in database

## 1. Login & Get Token

```bash
# Login sebagai admin
TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "admin123"
  }' 2>/dev/null | jq -r '.access_token')

echo "Token: $TOKEN"
```

## 2. Preview Report (JSON)

### Basic Preview (no filters)
```bash
curl -X GET "http://localhost:3000/reports/preview?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### With Date Filter
```bash
curl -X GET "http://localhost:3000/reports/preview?startDate=2026-01-01&endDate=2026-01-31&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Filter by User ID
```bash
curl -X GET "http://localhost:3000/reports/preview?userId=2&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Filter by Status
```bash
curl -X GET "http://localhost:3000/reports/preview?status=LATE&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Combined Filters
```bash
curl -X GET "http://localhost:3000/reports/preview?userId=2&status=PRESENT&startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response Example:**
```json
{
  "status": "success",
  "message": "Report preview retrieved successfully",
  "data": {
    "summary": {
      "totalRecords": 10,
      "previewRecords": 10,
      "totalWorkHours": "85.50",
      "statusBreakdown": {
        "PRESENT": 8,
        "LATE": 2
      }
    },
    "attendances": [...],
    "filters": {
      "userId": "2",
      "status": "PRESENT"
    }
  }
}
```

## 3. Export to Excel

### Basic Export (All Data)
```bash
curl -X GET "http://localhost:3000/reports/export/excel" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_all.xlsx

# Check file size
ls -lh attendance_all.xlsx
```

### Export with Date Range
```bash
curl -X GET "http://localhost:3000/reports/export/excel?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_january.xlsx
```

### Export for Specific User
```bash
curl -X GET "http://localhost:3000/reports/export/excel?userId=2" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_user2.xlsx
```

### Export by Status
```bash
curl -X GET "http://localhost:3000/reports/export/excel?status=LATE" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_late.xlsx
```

### Export with Combined Filters
```bash
curl -X GET "http://localhost:3000/reports/export/excel?userId=2&startDate=2026-01-01&endDate=2026-01-31&status=PRESENT" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_filtered.xlsx
```

**Excel Structure:**
- Header Row: User ID | Employee Name | Date | Clock In | Clock Out | Status | Work Hours
- Data Rows: Attendance records
- Summary Row: Total work hours
- Styling: Blue header, bold text, borders

## 4. Export to CSV

### Basic CSV Export
```bash
curl -X GET "http://localhost:3000/reports/export/csv" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_all.csv

# View CSV content
cat attendance_all.csv
```

### CSV with Date Filter
```bash
curl -X GET "http://localhost:3000/reports/export/csv?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_january.csv
```

### CSV for Specific User
```bash
curl -X GET "http://localhost:3000/reports/export/csv?userId=3" \
  -H "Authorization: Bearer $TOKEN" \
  --output attendance_user3.csv
```

**CSV Output Example:**
```csv
"User ID","Employee Name","Date","Clock In","Clock Out","Status","Work Hours"
2,"Budi Santoso","2026-01-06","06/01/2026, 09.00.00","06/01/2026, 18.00.00","PRESENT","9.00"
3,"Ani Wijaya","2026-01-06","06/01/2026, 08.55.00","06/01/2026, 18.10.00","PRESENT","9.25"
```

## 5. Monthly Report (3-Sheet Excel)

### Generate Monthly Report
```bash
# January 2026
curl -X GET "http://localhost:3000/reports/monthly?month=1&year=2026" \
  -H "Authorization: Bearer $TOKEN" \
  --output monthly_report_jan2026.xlsx

# December 2025
curl -X GET "http://localhost:3000/reports/monthly?month=12&year=2025" \
  -H "Authorization: Bearer $TOKEN" \
  --output monthly_report_dec2025.xlsx

# Current month (automatic)
curl -X GET "http://localhost:3000/reports/monthly?month=1&year=2026" \
  -H "Authorization: Bearer $TOKEN" \
  --output monthly_current.xlsx
```

**Excel Structure (3 Sheets):**

**Sheet 1 - Summary:**
- Report period
- Total employees
- Total attendance records
- Total work hours
- Status breakdown

**Sheet 2 - Employee Statistics:**
- User ID
- Employee Name
- Total Days
- Present
- Late
- Absent
- Leave
- Total Work Hours
- Attendance Rate (%)

**Sheet 3 - Detailed Attendance:**
- Date
- User ID
- Employee Name
- Clock In
- Clock Out
- Status
- Work Hours

## 6. Employee Performance Report

### Get Performance for User ID 2
```bash
curl -X GET "http://localhost:3000/reports/employee-performance?userId=2" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Performance with Custom Date Range
```bash
curl -X GET "http://localhost:3000/reports/employee-performance?userId=2&startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Performance for Current Month (automatic)
```bash
curl -X GET "http://localhost:3000/reports/employee-performance?userId=3" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response Example:**
```json
{
  "status": "success",
  "message": "Employee performance report retrieved successfully",
  "data": {
    "employee": {
      "id": 2,
      "name": "Budi Santoso",
      "email": "budi@company.com",
      "role": "EMPLOYEE"
    },
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    },
    "statistics": {
      "totalDays": 20,
      "onTime": 15,
      "late": 5,
      "absent": 0,
      "leave": 0,
      "totalWorkHours": "180.00",
      "averageWorkHours": "9.00",
      "attendanceRate": "100.00"
    },
    "attendances": [...]
  }
}
```

## 7. Complete Testing Script

Save this as `test_reports.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Report Endpoints ===${NC}\n"

# 1. Login
echo -e "${GREEN}1. Getting admin token...${NC}"
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}' | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to get token"
    exit 1
fi
echo "✅ Token obtained"

# 2. Preview Report
echo -e "\n${GREEN}2. Testing Preview Report...${NC}"
curl -s -X GET "http://localhost:3000/reports/preview?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.summary'
echo "✅ Preview report tested"

# 3. Export to Excel
echo -e "\n${GREEN}3. Testing Excel Export...${NC}"
curl -s -X GET "http://localhost:3000/reports/export/excel" \
  -H "Authorization: Bearer $TOKEN" \
  --output /tmp/test_attendance.xlsx
SIZE=$(ls -lh /tmp/test_attendance.xlsx | awk '{print $5}')
echo "✅ Excel exported: $SIZE"

# 4. Export to CSV
echo -e "\n${GREEN}4. Testing CSV Export...${NC}"
curl -s -X GET "http://localhost:3000/reports/export/csv" \
  -H "Authorization: Bearer $TOKEN" \
  --output /tmp/test_attendance.csv
LINES=$(wc -l < /tmp/test_attendance.csv)
echo "✅ CSV exported: $LINES lines"

# 5. Monthly Report
echo -e "\n${GREEN}5. Testing Monthly Report...${NC}"
curl -s -X GET "http://localhost:3000/reports/monthly?month=1&year=2026" \
  -H "Authorization: Bearer $TOKEN" \
  --output /tmp/test_monthly.xlsx
SIZE=$(ls -lh /tmp/test_monthly.xlsx | awk '{print $5}')
echo "✅ Monthly report generated: $SIZE"

# 6. Employee Performance
echo -e "\n${GREEN}6. Testing Employee Performance...${NC}"
curl -s -X GET "http://localhost:3000/reports/employee-performance?userId=2" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.statistics'
echo "✅ Performance report tested"

echo -e "\n${BLUE}=== All Tests Completed! ===${NC}"
```

Run with:
```bash
chmod +x test_reports.sh
./test_reports.sh
```

## 8. Error Cases

### Missing Token
```bash
curl -X GET "http://localhost:3000/reports/preview"
# Response: 401 Unauthorized
```

### Non-Admin User
```bash
# Login as employee
EMPLOYEE_TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@company.com","password":"budi123"}' | jq -r '.access_token')

curl -X GET "http://localhost:3000/reports/preview" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
# Response: 403 Forbidden - Admin access required
```

### Invalid Month
```bash
curl -X GET "http://localhost:3000/reports/monthly?month=13&year=2026" \
  -H "Authorization: Bearer $TOKEN" | jq .
# Response: 400 Bad Request - Month must be between 1 and 12
```

### No Data Found
```bash
curl -X GET "http://localhost:3000/reports/export/excel?startDate=2020-01-01&endDate=2020-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
# Response: 404 Not Found - No attendance data found
```

### Missing User ID for Performance
```bash
curl -X GET "http://localhost:3000/reports/employee-performance" \
  -H "Authorization: Bearer $TOKEN" | jq .
# Response: 400 Bad Request - User ID is required
```

## 9. Query Parameters Summary

| Endpoint | Required | Optional | Default |
|----------|----------|----------|---------|
| `/preview` | - | page, limit, startDate, endDate, userId, status | limit=100 |
| `/export/excel` | - | startDate, endDate, userId, status | - |
| `/export/csv` | - | startDate, endDate, userId, status | - |
| `/monthly` | month, year | - | - |
| `/employee-performance` | userId | startDate, endDate | Current month |

## 10. Response Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not admin user
- `404 Not Found` - No data found
- `500 Internal Server Error` - Server error

## Notes

1. All endpoints require `Authorization: Bearer <token>` header
2. All endpoints require admin role
3. Dates should be in format: `YYYY-MM-DD`
4. All exports are logged in audit log
5. Excel files use ExcelJS library
6. CSV files use json2csv library
7. File downloads have auto-generated filenames with timestamps
