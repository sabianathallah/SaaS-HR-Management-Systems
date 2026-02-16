# 🏢 Multi-Tenant Architecture Implementation Guide

## Overview
This HR Management System has been upgraded to a **Multi-Tenant SaaS Architecture**, allowing multiple companies to use the same system with complete data isolation.

## 🔐 Authentication Credentials

### Super Admin (Platform Owner)
```
Email: superadmin@hrsystem.com
Password: superadmin123
Role: SUPER_ADMIN
Access: Can manage all companies, view all data, create new companies
```

### Company Admin (Default Company)
```
Email: admin@company.com
Password: admin123
Role: COMPANY_ADMIN
Company: Default Company
Access: Can manage their company's employees, attendance, payroll, etc.
```

### Employees (Default Company)
```
Email: budi@company.com / ani@company.com
Password: password123
Role: EMPLOYEE
Company: Default Company
Access: Can clock in/out, request leave, view own data
```

## 📊 Database Architecture

### New Table: `Companies`
- Stores company/tenant information
- Each company has unique `slug` and `id`
- Tracks subscription status and expiry

### Modified Tables
All major tables now include `companyId`:
- Users
- Attendances
- LeaveRequests
- Overtimes
- Payrolls
- and 15+ more tables

## 🎯 Role Structure

```
SUPER_ADMIN (Platform Owner)
    ↓
COMPANY_ADMIN (Client Company Admin)
    ↓
EMPLOYEE (Company Employee)
```

## 🔒 Data Isolation

### Tenant Identification
- **Method**: Email-based detection via `User.companyId`
- **Flow**: Login → Get user → Extract companyId → Filter all queries

### Middleware Stack
1. `authentication` - Verify JWT token
2. `tenantIdentification` - Attach company context to request
3. `tenantIsolation` - Ensure data filtering by companyId

### Automatic Filtering
All API queries automatically filtered by `companyId` except for SUPER_ADMIN.

## 🚀 API Endpoints

### Super Admin Routes (New)
```
GET    /companies          - Get all companies
GET    /companies/stats    - Get company statistics
GET    /companies/:id      - Get company details
POST   /companies          - Create new company
PUT    /companies/:id      - Update company
DELETE /companies/:id      - Deactivate company
```

### Login Response (Updated)
```json
{
  "access_token": "...",
  "user": {
    "id": 1,
    "name": "Admin HR",
    "email": "admin@company.com",
    "role": "COMPANY_ADMIN",
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "Default Company",
      "slug": "default-company",
      "logo": null
    }
  }
}
```

## 📝 Creating New Company (Super Admin)

### API Request
```bash
POST /companies
Authorization: Bearer {super_admin_token}

{
  "name": "PT Teknologi Maju",
  "slug": "teknologi-maju",
  "email": "contact@tekmaju.com",
  "phoneNumber": "+62-21-1234567",
  "address": "Jakarta",
  "industry": "Technology",
  "subscriptionPlan": "professional",
  "subscriptionExpiresAt": "2027-12-31",
  
  "adminName": "John Doe",
  "adminEmail": "john@tekmaju.com",
  "adminPassword": "secure123",
  "adminPhoneNumber": "+62-812-1234567"
}
```

### What Happens
1. Creates new `Company` record
2. Creates first `COMPANY_ADMIN` user for that company
3. Company can now onboard employees
4. All data automatically isolated by `companyId`

## 🔧 Migration Commands

```bash
# Run migrations
npm run migrate

# Run setup script (if needed)
node setup-multi-tenant.js

# Reset sequences (if needed)
node reset-sequences.js
```

## 📱 Frontend Changes Required

### 1. Login Flow
- Store `companyId` and `company` object in auth state
- Display company name/logo in header
- Show company switcher for SUPER_ADMIN

### 2. Super Admin Dashboard (New)
- Company management page
- Create/edit/view companies
- View company statistics
- Access any company's data

### 3. API Calls
- Include `companyId` in context (automatic via backend)
- For SUPER_ADMIN: optionally pass `?companyId=X` to view specific company

### 4. Role-based UI
- SUPER_ADMIN: Show company management menu
- COMPANY_ADMIN: Show admin dashboard (filtered to their company)
- EMPLOYEE: Show employee dashboard

## 🛡️ Security Features

### Subscription Check
- Login validates company subscription status
- Blocks access if company is `suspended` or `inactive`
- Blocks access if subscription expired

### Data Isolation
- Employees only see their company data
- Company Admins only manage their company
- Super Admin can access all (with filtering)

### Validation
- `companyId` required for non-super-admin users
- All queries auto-filtered by tenant middleware
- Company status checked on every request

## 📚 Code Examples

### Backend: Create User with Company
```javascript
const user = await User.create({
  name: "Jane Doe",
  email: "jane@company.com",
  password: "password",
  role: "EMPLOYEE",
  companyId: req.companyId  // Auto-added by middleware
});
```

### Backend: Query with Company Filter
```javascript
// tenantIsolation.addCompanyFilter automatically adds companyId
const employees = await User.findAll({
  where: tenantIsolation.addCompanyFilter({
    role: 'EMPLOYEE',
    isActive: true
  }, req)
});
```

### Frontend: Check User Role
```javascript
const isSuperAdmin = user.role === 'SUPER_ADMIN';
const isCompanyAdmin = user.role === 'COMPANY_ADMIN';
const isEmployee = user.role === 'EMPLOYEE';

if (isSuperAdmin) {
  // Show company management
} else if (isCompanyAdmin) {
  // Show admin dashboard
} else {
  // Show employee dashboard
}
```

## 🎨 UI/UX Recommendations

### Company Branding
- Display company logo in header
- Show company name in sidebar
- Use company colors (from settings.branding)

### Super Admin Features
- Company selector dropdown
- Quick stats dashboard
- Company creation wizard

### Company Admin Features
- Employee management (filtered to their company)
- Company settings page
- Subscription status widget

## 📊 Database Status

```
✅ Companies table created
✅ companyId added to 20+ tables
✅ Default Company created
✅ Super Admin created
✅ Existing data migrated to Default Company
✅ ADMIN role converted to COMPANY_ADMIN
✅ Tenant middleware implemented
✅ API routes protected
```

## 🔄 Next Steps

1. ✅ Backend multi-tenant setup - DONE
2. 🔄 Frontend authentication update - IN PROGRESS
3. ⏳ Super Admin dashboard - PENDING
4. ⏳ Company management UI - PENDING
5. ⏳ Mobile app updates - PENDING

---

**Created**: February 13, 2026
**Status**: Backend Complete, Frontend In Progress
