# 👥 MANAJEMEN KARYAWAN - ADMIN

> Panduan lengkap mengelola data karyawan (CRUD Operations & Flow System)

---

## 🎯 Overview

Halaman **Employee Management** adalah pusat kontrol untuk:
- ➕ Menambah karyawan baru (Create)
- 👁️ Melihat detail karyawan (Read)
- ✏️ Mengubah data karyawan (Update)
- 🗑️ Menghapus/nonaktifkan karyawan (Delete)
- 🔄 Assign shift & manage quota

---

## 📊 Employee List Interface

### Layout Halaman

```
┌─────────────────────────────────────────────────────┐
│  👥 Employee Management                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [ 🔍 Search ] [ 🎯 Filter ] [ ➕ Add Employee ]   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Employee List Table                          │  │
│  ├─────┬──────────┬──────────┬─────────┬────────┤  │
│  │ ID  │ Name     │ Email    │ Role    │ Action │  │
│  ├─────┼──────────┼──────────┼─────────┼────────┤  │
│  │ #1  │ Budi     │ budi@... │ EMPLOYEE│ ⋮      │  │
│  │ #2  │ Ani      │ ani@...  │ EMPLOYEE│ ⋮      │  │
│  │ #3  │ Admin    │ admin@.. │ ADMIN   │ ⋮      │  │
│  └─────┴──────────┴──────────┴─────────┴────────┘  │
│                                                     │
│  Showing 1-10 of 150 employees    [ ◄ 1 2 3 ► ]   │
└─────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Data | Description |
|--------|------|-------------|
| **ID** | `#001` | Employee ID (auto increment) |
| **Photo** | 👤 | Profile picture (jika ada) |
| **Name** | `Budi Santoso` | Nama lengkap |
| **Email** | `budi@company.com` | Email (unique) |
| **Position** | `Senior Developer` | Jabatan |
| **Department** | `Engineering` | Departemen |
| **Role** | `EMPLOYEE` / `ADMIN` | System role |
| **Shift** | `Office Shift` | Default shift |
| **Status** | 🟢 Active / 🔴 Inactive | isActive status |
| **Action** | ⋮ | Menu actions |

---

## ➕ CREATE: Menambah Karyawan Baru

### Flow Diagram Create Employee

```
Admin → Click "Add Employee"
   ↓
Open Form Modal
   ↓
Fill Employee Data:
├─ Personal Info (Name, Email, Phone)
├─ Employment Info (Position, Department, Role)
├─ Work Info (Shift, Join Date)
└─ Leave Quota
   ↓
Validate Data:
├─ Email unique?
├─ All required fields filled?
└─ Valid format?
   ↓
   YES → Submit to Backend
      ↓
   Backend Process:
   ├─ Hash password (bcrypt)
   ├─ Create user in database
   ├─ Assign default shift
   ├─ Set leave quota
   └─ Create audit log
      ↓
   Response Success
      ↓
   Frontend:
   ├─ Show success toast
   ├─ Refresh employee list
   ├─ Close modal
   └─ Send welcome email (optional)
      ↓
   ✅ Employee Created!
```

---

### Step-by-Step: Add Employee

#### Step 1: Click Add Employee Button
1. Di halaman **Employees**
2. Klik tombol **"➕ Add Employee"**
3. Modal form akan muncul

---

#### Step 2: Fill Form

**Form Fields:**

```
┌─────────────────────────────────────────┐
│  ➕ Add New Employee                    │
├─────────────────────────────────────────┤
│                                         │
│  📋 PERSONAL INFORMATION               │
│  ───────────────────────────────────   │
│  Name: *                               │
│  [_____________________________]       │
│                                         │
│  Email: *                              │
│  [_____________________________]       │
│                                         │
│  Phone Number:                         │
│  [_____________________________]       │
│                                         │
│  💼 EMPLOYMENT INFORMATION             │
│  ───────────────────────────────────   │
│  Position:                             │
│  [_____________________________]       │
│                                         │
│  Department:                           │
│  [_____________________________]       │
│                                         │
│  Role: *                               │
│  [ EMPLOYEE ▼ ]                        │
│    - EMPLOYEE                          │
│    - ADMIN                             │
│                                         │
│  🕐 WORK SCHEDULE                      │
│  ───────────────────────────────────   │
│  Default Shift: *                      │
│  [ Office Shift ▼ ]                    │
│    - Office Shift                      │
│    - WFH Shift                         │
│    - Flexible Shift                    │
│                                         │
│  Join Date:                            │
│  [DD/MM/YYYY]                          │
│                                         │
│  🏖️ LEAVE QUOTA                        │
│  ───────────────────────────────────   │
│  Annual Leave Quota: *                 │
│  [12] days (default)                   │
│                                         │
│  🔒 ACCOUNT SETUP                      │
│  ───────────────────────────────────   │
│  Initial Password: *                   │
│  [password123] (auto-generated)        │
│                                         │
│  ☐ Send welcome email                 │
│  ☑ Require password change on login   │
│                                         │
│  [ Cancel ]        [ Create Employee ] │
└─────────────────────────────────────────┘

* Required fields
```

---

#### Step 3: Field Validation

**Personal Information:**

**Name:**
- Required: ✅
- Min length: 3 characters
- Max length: 100 characters
- Format: Letters, spaces, dash only
- Example: "Budi Santoso"

**Email:**
- Required: ✅
- Must be unique (tidak boleh duplikat)
- Valid email format: `user@domain.com`
- Will be used for login
- Example: "budi.santoso@company.com"

**Phone Number:**
- Optional: ❌
- Format: +62 atau 08xx
- Example: "+62 812 3456 7890"

---

**Employment Information:**

**Position:**
- Optional: ❌
- Jabatan/posisi karyawan
- Example: "Senior Developer", "HR Manager"

**Department:**
- Optional: ❌
- Departemen/divisi
- Example: "Engineering", "Human Resources"

**Role:**
- Required: ✅
- System role untuk akses
- Options:
  - **EMPLOYEE:** Akses employee dashboard only
  - **ADMIN:** Full access (admin dashboard + management)
- Default: EMPLOYEE

---

**Work Schedule:**

**Default Shift:**
- Required: ✅
- Shift kerja default untuk karyawan ini
- Options: (dari Shift table)
  - Office Shift (09:00-17:00, Office)
  - WFH Shift (09:00-17:00, WFH)
  - Flexible Shift (Flexible, Flexible)
- Bisa diubah nanti per hari via WorkSchedule

**Join Date:**
- Optional: ❌
- Tanggal mulai kerja
- Format: DD/MM/YYYY
- Default: Today

---

**Leave Quota:**

**Annual Leave Quota:**
- Required: ✅
- Jumlah cuti tahunan
- Default: 12 days
- Range: 0-30 days
- Bisa disesuaikan per karyawan

**Used Leave Quota:**
- Auto set: 0 (untuk karyawan baru)
- Akan bertambah saat leave approved

**Remaining:**
- Auto calculated: Annual - Used
- Virtual field (tidak disimpan di DB)

---

**Account Setup:**

**Initial Password:**
- Required: ✅
- Auto-generated: `password123`
- Admin bisa custom
- Will be hashed dengan bcrypt before save
- **Best Practice:** Force user change password on first login

**Options:**
- ☐ Send welcome email (dengan credentials)
- ☑ Require password change on first login

---

#### Step 4: Submit & Backend Process

**Frontend Validation:**
```javascript
// Validate required fields
if (!name || !email || !role || !shiftId || !annualLeaveQuota) {
  toast.error("Please fill all required fields");
  return;
}

// Validate email format
if (!isValidEmail(email)) {
  toast.error("Invalid email format");
  return;
}
```

**API Call:**
```javascript
POST /register
Headers: { Authorization: Bearer <admin-token> }
Body: {
  name: "Budi Santoso",
  email: "budi@company.com",
  password: "password123",
  phoneNumber: "+62 812 3456 7890",
  role: "EMPLOYEE",
  position: "Senior Developer",
  department: "Engineering",
  ShiftId: 1,
  joinDate: "2026-01-15",
  annualLeaveQuota: 12
}
```

---

**Backend Process:**

```javascript
// 1. Check email uniqueness
const existingUser = await User.findOne({ where: { email } });
if (existingUser) {
  return res.status(400).json({ message: "Email already exists" });
}

// 2. Hash password
const hashedPassword = hashPassword(password);

// 3. Create user
const newUser = await User.create({
  name,
  email,
  password: hashedPassword,
  phoneNumber,
  role,
  position,
  department,
  ShiftId,
  joinDate,
  annualLeaveQuota,
  usedLeaveQuota: 0,
  isActive: true
});

// 4. Create audit log
await AuditLog.create({
  userId: req.user.id, // Admin yang create
  action: 'CREATE',
  entity: 'User',
  entityId: newUser.id,
  description: `Created new employee: ${newUser.name}`
});

// 5. Send welcome email (optional)
if (sendWelcomeEmail) {
  await sendEmail({
    to: newUser.email,
    subject: "Welcome to Company",
    body: `Your account has been created. 
           Email: ${email}
           Password: ${password}
           Please change your password on first login.`
  });
}

// 6. Return response
return res.status(201).json({
  message: "Employee created successfully",
  data: newUser
});
```

---

#### Step 5: Success & Post-Actions

**Success Toast:**
```
✅ Employee created successfully!
Budi Santoso has been added to the system.
```

**Auto Actions:**
- ✅ Refresh employee list
- ✅ Close modal
- ✅ Scroll to new employee (highlight)
- ✅ Send welcome email (if checked)

**Employee Can Now:**
- 🔐 Login dengan email & password
- 📱 Access employee dashboard
- ⏰ Clock in/out
- 🏖️ Request leave (setelah probation period)

---

## 👁️ READ: Melihat Detail Karyawan

### View Employee Detail

**Cara Akses:**
1. Di table employee list
2. Klik icon **👁️ View** di kolom Action
3. Modal detail akan muncul

---

### Detail Modal

```
┌─────────────────────────────────────────────────┐
│  👤 Employee Details - Budi Santoso             │
├─────────────────────────────────────────────────┤
│                                                 │
│  📸 Profile Photo                               │
│  ┌─────────┐                                    │
│  │  [IMG]  │                                    │
│  └─────────┘                                    │
│                                                 │
│  📋 PERSONAL INFO                               │
│  ─────────────────────────────────────────────  │
│  Name:         Budi Santoso                     │
│  Email:        budi@company.com                 │
│  Phone:        +62 812 3456 7890                │
│                                                 │
│  💼 EMPLOYMENT INFO                             │
│  ─────────────────────────────────────────────  │
│  Employee ID:  #00001                           │
│  Position:     Senior Developer                 │
│  Department:   Engineering                      │
│  Role:         EMPLOYEE                         │
│  Status:       🟢 Active                        │
│                                                 │
│  📅 WORK SCHEDULE                               │
│  ─────────────────────────────────────────────  │
│  Default Shift:  Office Shift                   │
│  Work Hours:     09:00 - 17:00                  │
│  Type:           Office                         │
│  Join Date:      15 Jan 2024                    │
│  Leave Date:     - (Still Active)               │
│                                                 │
│  🏖️ LEAVE QUOTA                                 │
│  ─────────────────────────────────────────────  │
│  Annual Quota:   12 days                        │
│  Used:           3 days                         │
│  Remaining:      9 days                         │
│                                                 │
│  📊 STATISTICS (This Month)                     │
│  ─────────────────────────────────────────────  │
│  Total Days:     15 days                        │
│  Present:        14 days (93.3%)                │
│  Late:           2 days (13.3%)                 │
│  Absent:         1 day (6.7%)                   │
│  Avg Work Time:  8.5 hours                      │
│                                                 │
│  📝 RECENT ACTIVITIES                           │
│  ─────────────────────────────────────────────  │
│  • Clocked in at 08:45 AM - Today              │
│  • Leave request approved - 2 days ago          │
│  • Clocked out at 17:30 PM - Yesterday         │
│  • Overtime request submitted - 3 days ago      │
│                                                 │
│  [ Close ]  [ Edit ]  [ View Attendance ]      │
└─────────────────────────────────────────────────┘
```

---

### Quick Actions dari Detail

**Edit Button:**
- Opens edit modal dengan data pre-filled

**View Attendance:**
- Redirect ke Attendance page dengan filter: User = Budi
- Shows full attendance history untuk karyawan ini

**Deactivate/Activate:**
- Toggle isActive status
- Confirmation prompt sebelum action

---

## ✏️ UPDATE: Mengubah Data Karyawan

### Flow Diagram Update Employee

```
Admin → View Employee Details
   ↓
Click "Edit" Button
   ↓
Open Edit Form Modal (Pre-filled)
   ↓
Modify Data:
├─ Update name
├─ Update position
├─ Update department
├─ Change shift
├─ Adjust leave quota
└─ Toggle active status
   ↓
Validate Changes
   ↓
Submit Update
   ↓
Backend Process:
├─ Validate data
├─ Update user record
├─ Log changes in audit log
└─ Trigger notifications (if needed)
   ↓
Response Success
   ↓
Frontend:
├─ Show success toast
├─ Refresh employee list
├─ Close modal
└─ Highlight updated employee
   ↓
✅ Employee Updated!
```

---

### Step-by-Step: Edit Employee

#### Step 1: Open Edit Form
1. View employee details
2. Click **"✏️ Edit"**
3. Edit modal muncul dengan data existing

#### Step 2: Update Fields

**Editable Fields:**
- ✅ Name
- ✅ Phone Number
- ✅ Position
- ✅ Department
- ✅ Role (EMPLOYEE ⇄ ADMIN)
- ✅ Default Shift
- ✅ Join Date
- ✅ Leave Date (untuk resignation)
- ✅ Annual Leave Quota
- ✅ Active Status

**Non-Editable Fields:**
- ❌ Email (karena primary identifier)
- ❌ Employee ID (auto increment)
- ❌ Used Leave Quota (calculated from leave history)
- ❌ Password (ada form terpisah untuk reset)

---

#### Step 3: Important Update Scenarios

**Scenario 1: Promote to Admin**
```
Before:
Role: EMPLOYEE
Access: /employee dashboard only

Action: Change Role to ADMIN
   ↓
After:
Role: ADMIN
Access: /admin full dashboard
Effect: User will be redirected to admin area on next login
```

**Scenario 2: Change Shift**
```
Before:
Shift: Office Shift (requires GPS)

Action: Change to WFH Shift
   ↓
After:
Shift: WFH Shift (no GPS validation)
Effect: Future attendance won't check GPS location
```

**Scenario 3: Adjust Leave Quota**
```
Before:
Annual: 12 days
Used: 8 days
Remaining: 4 days

Action: Increase to 15 days
   ↓
After:
Annual: 15 days
Used: 8 days
Remaining: 7 days (+3 days bonus)
```

**Scenario 4: Deactivate Employee (Resignation)**
```
Before:
isActive: true
leaveDate: null

Action:
1. Set leaveDate: 31/01/2026
2. Set isActive: false
   ↓
After:
isActive: false
leaveDate: 31/01/2026
Effect:
- Cannot login
- No auto-absent
- Still in database (soft delete)
- Data preserved for reports
```

---

#### Step 4: Backend Update Process

**API Call:**
```javascript
PUT /users/admin/:id
Headers: { Authorization: Bearer <admin-token> }
Body: {
  name: "Budi Santoso (Updated)",
  position: "Lead Developer",
  department: "Engineering",
  role: "ADMIN",
  ShiftId: 2,
  annualLeaveQuota: 15,
  isActive: true
}
```

**Backend Logic:**
```javascript
// 1. Find employee
const employee = await User.findByPk(id);
if (!employee) {
  return res.status(404).json({ message: "Employee not found" });
}

// 2. Track changes for audit log
const changes = {};
if (employee.name !== name) changes.name = { old: employee.name, new: name };
if (employee.role !== role) changes.role = { old: employee.role, new: role };
// ... track all changes

// 3. Update employee
await employee.update({
  name,
  position,
  department,
  role,
  ShiftId,
  annualLeaveQuota,
  isActive,
  leaveDate // jika resign
});

// 4. Create detailed audit log
await AuditLog.create({
  userId: req.user.id,
  action: 'UPDATE',
  entity: 'User',
  entityId: employee.id,
  description: `Updated employee: ${employee.name}`,
  changes: JSON.stringify(changes)
});

// 5. Send notification (if role changed)
if (changes.role) {
  await Notification.create({
    UserId: employee.id,
    type: 'SYSTEM',
    title: 'Role Updated',
    message: `Your role has been changed to ${role}`,
    priority: 'HIGH'
  });
}

// 6. Return response
return res.status(200).json({
  message: "Employee updated successfully",
  data: employee
});
```

---

## 🗑️ DELETE: Menghapus/Menonaktifkan Karyawan

### Soft Delete vs Hard Delete

**Salmon HRIS menggunakan SOFT DELETE:**

❌ **Hard Delete (NOT USED):**
- Data benar-benar dihapus dari database
- Irreversible
- Kehilangan history
- Bad for audit trail

✅ **Soft Delete (USED):**
- Set `isActive = false`
- Set `leaveDate = resignation_date`
- Data tetap ada di database
- Can be reactivated
- Preserve audit trail & reports

---

### Flow Diagram Deactivate Employee

```
Admin → Select Employee
   ↓
Click "Deactivate"
   ↓
Confirmation Dialog:
"Are you sure you want to deactivate Budi Santoso?"
├─ Set leave date?
└─ Reason for deactivation?
   ↓
Admin Confirms
   ↓
Backend Process:
├─ Set isActive = false
├─ Set leaveDate = selected_date
├─ Cancel pending leaves/overtimes
├─ Create audit log
└─ Send notification to employee
   ↓
Response Success
   ↓
Frontend:
├─ Show success toast
├─ Update employee list (grayed out)
└─ Move to "Inactive Employees" tab
   ↓
✅ Employee Deactivated!

Effects:
├─ ❌ Cannot login
├─ ❌ No auto-absent
├─ ❌ No attendance tracking
├─ ✅ Data preserved for reports
└─ ✅ Can reactivate later
```

---

### Step-by-Step: Deactivate Employee

#### Step 1: Select Employee
1. Find employee in list
2. Click action menu **⋮**
3. Select **"Deactivate"**

#### Step 2: Confirmation Dialog

```
┌─────────────────────────────────────────────┐
│  ⚠️ Deactivate Employee                     │
├─────────────────────────────────────────────┤
│                                             │
│  Are you sure you want to deactivate:      │
│  👤 Budi Santoso (budi@company.com)        │
│                                             │
│  This will:                                │
│  ❌ Revoke system access                   │
│  ❌ Stop attendance tracking               │
│  ❌ Cancel pending requests                │
│  ✅ Preserve data for reports              │
│                                             │
│  Leave Date: *                             │
│  [DD/MM/YYYY] (Last working day)           │
│                                             │
│  Reason:                                   │
│  [ Resignation      ▼ ]                    │
│    - Resignation                           │
│    - Termination                           │
│    - Contract End                          │
│    - Other                                 │
│                                             │
│  Notes:                                    │
│  ┌─────────────────────────────────────┐  │
│  │ Additional notes...                 │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  [ Cancel ]            [ Deactivate ]      │
└─────────────────────────────────────────────┘
```

#### Step 3: Backend Process

**API Call:**
```javascript
PUT /users/admin/:id/deactivate
Headers: { Authorization: Bearer <admin-token> }
Body: {
  leaveDate: "2026-01-31",
  reason: "Resignation",
  notes: "Moving to another company"
}
```

**Backend Logic:**
```javascript
const transaction = await sequelize.transaction();

try {
  // 1. Update employee status
  await employee.update({
    isActive: false,
    leaveDate: leaveDate
  }, { transaction });

  // 2. Cancel all pending leave requests
  await LeaveRequest.update(
    { status: 'CANCELLED' },
    {
      where: {
        UserId: employee.id,
        status: 'PENDING'
      },
      transaction
    }
  );

  // 3. Cancel all pending overtime requests
  await Overtime.update(
    { status: 'CANCELLED' },
    {
      where: {
        UserId: employee.id,
        status: 'PENDING'
      },
      transaction
    }
  );

  // 4. Create audit log
  await AuditLog.create({
    userId: req.user.id,
    action: 'DEACTIVATE',
    entity: 'User',
    entityId: employee.id,
    description: `Deactivated employee: ${employee.name}`,
    metadata: JSON.stringify({ reason, notes, leaveDate })
  }, { transaction });

  // 5. Send notification
  await Notification.create({
    UserId: employee.id,
    type: 'SYSTEM',
    title: 'Account Deactivated',
    message: 'Your account has been deactivated.',
    priority: 'HIGH'
  }, { transaction });

  await transaction.commit();

  return res.status(200).json({
    message: "Employee deactivated successfully"
  });

} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

### Reactivate Employee

**Jika perlu reactivate:**

```
Admin → Inactive Employees Tab
   ↓
Select Employee
   ↓
Click "Reactivate"
   ↓
Confirmation
   ↓
Set: isActive = true, leaveDate = null
   ↓
Employee can login again
```

---

## 🔍 Search & Filter

### Search Function

**Search by:**
- 📝 Name (partial match)
- 📧 Email (exact/partial)
- 🏢 Position
- 🏢 Department

**Implementation:**
```javascript
// Frontend
const filteredEmployees = employees.filter(emp => {
  const searchLower = searchTerm.toLowerCase();
  return (
    emp.name.toLowerCase().includes(searchLower) ||
    emp.email.toLowerCase().includes(searchLower) ||
    emp.position?.toLowerCase().includes(searchLower) ||
    emp.department?.toLowerCase().includes(searchLower)
  );
});
```

---

### Filter Options

**Filter by Status:**
- ✅ All Employees
- 🟢 Active Only
- 🔴 Inactive Only

**Filter by Role:**
- 👥 All Roles
- 👤 Employee Only
- 👨‍💼 Admin Only

**Filter by Department:**
- 🏢 All Departments
- 💻 Engineering
- 💼 Human Resources
- 💰 Finance
- 📈 Sales
- etc.

**Filter by Shift:**
- 🕐 All Shifts
- 🏢 Office Shift
- 🏠 WFH Shift
- 🔄 Flexible Shift

---

## 📊 Bulk Operations

### Mass Actions

**Select Multiple Employees:**
```
☐ Select All

☑ Budi Santoso
☑ Ani Wijaya
☐ Citra Dewi

[2 selected]

Actions:
├─ 🔄 Change Shift (Bulk)
├─ 📧 Send Notification (Bulk)
├─ 📥 Export Selected
└─ 🗑️ Deactivate Selected
```

---

### Bulk Shift Assignment

**Use Case:** Company-wide WFH policy

```
Select: All Employees (150)
   ↓
Action: Change Shift
   ↓
Select: WFH Shift
   ↓
Confirm: "Change shift for 150 employees?"
   ↓
Process: Update all in transaction
   ↓
✅ All employees now on WFH shift
```

---

## 📈 Export Employees

### Export Options

**Format:**
- 📊 Excel (.xlsx)
- 📄 CSV (.csv)
- 📋 PDF (table format)

**Data Included:**
- All employee information
- Current status
- Leave balance
- Shift assignment
- Join date & leave date

**Usage:**
- 📊 Reports untuk management
- 📁 Backup data
- 📊 Payroll integration
- 📈 Analytics

---

## 🔐 Permission & Security

### Admin Permissions Required

**Full Access:**
- ✅ View all employees
- ✅ Create new employees
- ✅ Edit employee data
- ✅ Deactivate employees
- ✅ View employee statistics
- ✅ Export employee data

**Security Measures:**
- 🔐 Admin role required (middleware)
- 📝 All actions logged in audit log
- 🔒 Password hashed before save
- 🚫 Cannot delete admin (self)
- ⚠️ Confirmation for critical actions

---

## 📊 Metrics & KPIs

### Employee Analytics

**Total Headcount:**
- Current: 150 employees
- Active: 142
- Inactive: 8
- Trend: +5 this month

**Department Distribution:**
```
Engineering:    45 (30%)
Sales:          30 (20%)
HR:            15 (10%)
Finance:        20 (13%)
Marketing:      25 (17%)
Operations:     15 (10%)
```

**Role Distribution:**
```
Employees:     135 (90%)
Admins:         15 (10%)
```

**Shift Distribution:**
```
Office:        100 (67%)
WFH:           40 (27%)
Flexible:      10 (6%)
```

---

## 📞 Troubleshooting

### Common Issues

**Problem: Cannot create employee - "Email already exists"**

**Solution:**
1. Email harus unique
2. Check apakah email sudah dipakai
3. Gunakan email lain atau
4. Reactivate existing employee dengan email tersebut

---

**Problem: Employee tidak bisa login setelah dibuat**

**Solution:**
1. Check isActive = true
2. Verify email & password
3. Check role assignment
4. Clear browser cache
5. Try password reset

---

**Problem: Bulk update failed**

**Solution:**
1. Check internet connection
2. Reduce batch size (max 100 at once)
3. Check for validation errors
4. Try one by one untuk identify issue

---

## ✅ Best Practices

### DO (Lakukan)
- ✅ Always fill complete employee data
- ✅ Use descriptive position/department names
- ✅ Set proper shift dari awal
- ✅ Document deactivation reasons
- ✅ Regular data backup/export
- ✅ Review employee list monthly
- ✅ Monitor inactive employees

### DON'T (Jangan)
- ❌ Hard delete employees (use soft delete)
- ❌ Share employee credentials
- ❌ Forget to set leave quota
- ❌ Ignore inactive employees cleanup
- ❌ Skip audit log review
- ❌ Deactivate without proper reason

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0
