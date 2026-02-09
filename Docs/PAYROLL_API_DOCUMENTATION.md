# Payroll System API Documentation

## Overview
Sistem payroll terintegrasi dengan payment gateway (Midtrans Iris) untuk disbursement otomatis ke rekening karyawan.

---

## Base URL
```
http://localhost:3000/api
```

---

## Authentication
Semua endpoint (kecuali webhook) memerlukan JWT token di header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 🔐 Admin/HR Endpoints

#### 1. **Payroll Periods**

##### GET `/payroll/admin/periods`
Get all payroll periods

**Query Parameters:**
- `status` (optional): Filter by status (draft, pending_review, approved, processing, paid, cancelled)
- `year` (optional): Filter by year
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "periodName": "January 2026",
      "periodStart": "2025-12-21",
      "periodEnd": "2026-01-20",
      "cutoffDate": "2026-01-20",
      "paymentDate": "2026-01-25",
      "status": "paid",
      "totalEmployees": 50,
      "totalGrossSalary": "250000000",
      "totalDeductions": "50000000",
      "totalNetSalary": "200000000",
      "generator": { "id": 1, "name": "Admin" },
      "approver": { "id": 2, "name": "Finance" },
      "midtransBatchId": "BATCH-123"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

##### POST `/payroll/admin/periods`
Create new payroll period

**Request Body:**
```json
{
  "periodName": "February 2026",
  "periodStart": "2026-01-21",
  "periodEnd": "2026-02-20",
  "cutoffDate": "2026-02-20",
  "paymentDate": "2026-02-25",
  "notes": "Regular monthly payroll"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll period created successfully",
  "data": { ... }
}
```

##### POST `/payroll/admin/periods/:periodId/generate`
Generate payrolls for all active employees in a period

**Response:**
```json
{
  "success": true,
  "message": "Generated 50 payrolls successfully",
  "data": {
    "period": { ... },
    "totalGenerated": 50,
    "totalErrors": 0
  }
}
```

##### POST `/payroll/admin/periods/:periodId/approve`
Approve payroll period (Finance action)

**Request Body:**
```json
{
  "notes": "Approved by Finance Department"
}
```

##### POST `/payroll/admin/periods/:periodId/process-payment`
Process payment via Midtrans Iris

**Response:**
```json
{
  "success": true,
  "message": "Payment processing initiated successfully",
  "data": {
    "period": { ... },
    "batchResult": {
      "batchId": "BATCH-123",
      "totalPayouts": 50,
      "totalAmount": 200000000,
      "results": [ ... ]
    }
  }
}
```

##### POST `/payroll/admin/periods/:periodId/generate-payslips`
Generate PDF/HTML payslips for all employees

---

#### 2. **Payrolls**

##### GET `/payroll/admin/periods/:periodId/payrolls`
Get all payrolls in a period

**Query Parameters:**
- `status`: Filter by status
- `search`: Search by employee name/email
- `page`, `limit`: Pagination

##### GET `/payroll/admin/payrolls/:payrollId`
Get detailed payroll information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee": { ... },
    "period": { ... },
    "baseSalary": 10000000,
    "proratedSalary": 10000000,
    "overtimeHours": 10,
    "overtimePay": 100000,
    "totalAllowances": 2000000,
    "totalBonuses": 500000,
    "thr": 0,
    "totalEarnings": 12600000,
    "bpjsHealthEmployee": 126000,
    "bpjsEmploymentEmployee": 378000,
    "incomeTax": 500000,
    "totalDeductions": 1004000,
    "netSalary": 11596000,
    "details": [ ... ],
    "adjustments": [ ... ],
    "histories": [ ... ]
  }
}
```

##### POST `/payroll/admin/payrolls/:payrollId/adjustments`
Add manual adjustment to payroll

**Request Body:**
```json
{
  "adjustmentType": "earning",
  "reason": "Bonus Kinerja Q1",
  "amount": 2000000,
  "description": "Performance bonus for excellent work",
  "isBackpay": false
}
```

**Adjustment Types:**
- `earning`: Add to gross salary (bonus, backpay, etc.)
- `deduction`: Subtract from salary (loan, penalty, etc.)

---

#### 3. **Payroll Components Management**

##### GET `/payroll/settings/components`
Get all payroll components

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ALLOW_TRANSPORT",
      "name": "Tunjangan Transport",
      "type": "earning",
      "calculationType": "fixed",
      "defaultAmount": 500000,
      "isActive": true,
      "isMandatory": false,
      "isSystemGenerated": false
    }
  ]
}
```

##### POST `/payroll/settings/components`
Create new payroll component

**Request Body:**
```json
{
  "code": "ALLOW_HOUSING",
  "name": "Tunjangan Perumahan",
  "type": "earning",
  "calculationType": "fixed",
  "defaultAmount": 1500000,
  "description": "Housing allowance for employees"
}
```

---

#### 4. **Employee Salary Settings**

##### GET `/payroll/settings/employees/:employeeId/components`
Get employee's assigned salary components

##### POST `/payroll/settings/employees/:employeeId/components`
Assign component to employee

**Request Body:**
```json
{
  "componentId": 3,
  "amount": 750000,
  "effectiveDate": "2026-02-01",
  "notes": "Meal allowance increase"
}
```

##### PUT `/payroll/settings/employees/:employeeId/base-salary`
Update employee's base salary

**Request Body:**
```json
{
  "baseSalary": 12000000,
  "notes": "Annual salary increment"
}
```

---

#### 5. **Tax & BPJS Settings**

##### GET `/payroll/settings/tax`
Get tax settings (PTKP & tax brackets)

**Query Parameters:**
- `year`: Tax year (default: current year)

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "ptkpSettings": [
      {
        "ptkpStatus": "TK0",
        "ptkpAmount": 54000000,
        "description": "Tidak Kawin, Tanpa Tanggungan"
      }
    ],
    "taxBrackets": [
      {
        "bracketLevel": 1,
        "minIncome": 0,
        "maxIncome": 60000000,
        "taxRate": 5.00
      }
    ]
  }
}
```

##### GET `/payroll/settings/bpjs`
Get BPJS settings

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "kesehatan",
      "name": "BPJS Kesehatan",
      "employeePercentage": 1.00,
      "companyPercentage": 4.00,
      "maxSalaryBase": 12000000
    }
  ]
}
```

---

### 👤 Employee Endpoints

#### 1. **My Payslips**

##### GET `/payroll/my-payslips`
Get employee's own payslips

**Query Parameters:**
- `year`: Filter by year
- `status`: Filter by status
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "period": {
        "periodName": "January 2026",
        "periodStart": "2025-12-21",
        "periodEnd": "2026-01-20"
      },
      "totalEarnings": 12600000,
      "totalDeductions": 1004000,
      "netSalary": 11596000,
      "status": "paid",
      "paidAt": "2026-01-25T10:00:00Z"
    }
  ]
}
```

##### GET `/payroll/my-payslips/summary`
Get payslip summary for dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "latestPayslip": {
      "periodName": "January 2026",
      "grossSalary": 12600000,
      "netSalary": 11596000,
      "status": "paid"
    },
    "yearToDate": {
      "year": 2026,
      "totalMonths": 1,
      "totalGross": 12600000,
      "totalNet": 11596000,
      "totalTax": 500000,
      "totalBPJS": 504000,
      "averageGross": 12600000,
      "averageNet": 11596000
    }
  }
}
```

##### GET `/payroll/my-payslips/:payslipId`
Get payslip detail

##### GET `/payroll/my-payslips/:payslipId/download`
Get payslip file URL

**Response:**
```json
{
  "success": true,
  "data": {
    "payslipUrl": "/uploads/payslips/payslip_123_January_2026.html",
    "employeeName": "John Doe",
    "periodName": "January 2026"
  }
}
```

##### GET `/payroll/my-payslips/:payslipId/payment-proof`
Get payment proof/receipt

---

### 🔔 Webhook Endpoints

##### POST `/webhooks/midtrans`
Midtrans webhook callback (no authentication required)

**Request Body:** (from Midtrans)
```json
{
  "reference_id": "PAY-123",
  "status": "completed",
  "amount": 11596000,
  "beneficiary_name": "John Doe",
  "beneficiary_account": "1234567890",
  "completed_at": "2026-01-25T10:00:00Z"
}
```

---

## Payroll Calculation Logic

### 1. **Working Days Calculation**
```
workingDays = actualDaysWorked (considering join/leave dates)
proratedSalary = (baseSalary / totalDaysInPeriod) * workingDays
```

### 2. **Overtime Pay**
```
overtimePay = baseSalary * 1% * overtimeHours
```

### 3. **Gross Salary**
```
grossSalary = proratedSalary + overtimePay + allowances + bonuses + THR
```

### 4. **BPJS Deductions**
- **BPJS Kesehatan (Employee):** 1% of gross (max base: 12 juta)
- **BPJS Ketenagakerjaan (Employee):** 
  - JHT: 2%
  - JP: 1% (max base: 9.077 juta)

### 5. **Income Tax (PPh21)**
```
Yearly Income = grossSalary * 12
Taxable Income (PKP) = Yearly Income - PTKP
Tax = Progressive calculation based on tax brackets
Monthly Tax = Yearly Tax / 12
```

**Tax Brackets 2026:**
| Income Range | Tax Rate |
|--------------|----------|
| 0 - 60 juta | 5% |
| 60 - 250 juta | 15% |
| 250 - 500 juta | 25% |
| 500 juta - 5 M | 30% |
| > 5 M | 35% |

**PTKP (Tax-Free Income):**
| Status | PTKP Amount |
|--------|-------------|
| TK0 | 54,000,000 |
| TK1 | 58,500,000 |
| K0 | 58,500,000 |
| K1 | 63,000,000 |
| K2 | 67,500,000 |
| K3 | 72,000,000 |

### 6. **Net Salary**
```
netSalary = grossSalary - (BPJS + Tax + otherDeductions)
```

---

## Payroll Process Flow

```
1. CREATE PERIOD
   ↓
2. GENERATE PAYROLLS (calculate for all employees)
   ↓
3. REVIEW & ADJUST (HR adds manual adjustments if needed)
   ↓
4. SUBMIT FOR APPROVAL
   ↓
5. APPROVE (Finance reviews and approves)
   ↓
6. PROCESS PAYMENT (Create batch disbursement to Midtrans)
   ↓
7. MIDTRANS TRANSFERS (Money sent to employee accounts)
   ↓
8. WEBHOOK CALLBACK (Update payment status)
   ↓
9. GENERATE PAYSLIPS (Create PDF/HTML payslips)
   ↓
10. NOTIFY EMPLOYEES
```

---

## Special Cases

### 1. **Pro-rata Calculation**
- **New Employee (join mid-period):** Calculate from join date
- **Resign/PHK (leave mid-period):** Calculate until leave date
- **Probation Employee THR:** Pro-rated based on months worked

### 2. **Manual Adjustments**
- Bonus kinerja
- Potongan khusus
- Backpay (koreksi gaji bulan sebelumnya)
- Cicilan pinjaman
- Kasbon

### 3. **Payment Status**
- **draft:** Newly generated
- **pending:** Submitted for approval
- **approved:** Approved by finance
- **processing:** Payment being processed by Midtrans
- **paid:** Successfully transferred
- **failed:** Payment failed

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | No permission to access |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Testing

### Mock Midtrans (Development Mode)
Sistem menggunakan mock Midtrans service untuk development. Untuk testing:

```bash
# Test webhook manually
POST /api/webhooks/test
{
  "referenceId": "PAY-123",
  "status": "completed"
}
```

### Production Setup
Install midtrans-client dan configure:

```bash
npm install midtrans-client
```

Set environment variables:
```
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
NODE_ENV=production
```

---

## Database Schema

### Core Tables
- `PayrollPeriods` - Payroll periods
- `Payrolls` - Employee payrolls
- `PayrollDetails` - Detailed components breakdown
- `PayrollAdjustments` - Manual adjustments
- `PayrollHistories` - Audit trail
- `PayrollComponents` - Master components
- `EmployeeSalaryComponents` - Employee-specific components
- `TaxSettings` - PTKP settings
- `TaxBrackets` - Progressive tax brackets
- `BPJSSettings` - BPJS contribution rates

---

## Support

For issues or questions, contact HR/IT department.
