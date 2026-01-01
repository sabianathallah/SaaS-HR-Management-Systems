# 🗂️ Database Relations & ERD Documentation
**SaaS HR Management System - Attendance Module**  
**Last Updated:** January 2, 2026

---

## 📊 Entity Relationship Diagram (ERD)

### Visual Representation

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ role            │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1
         │
         │ hasMany
         │
         │ M
┌────────▼─────────────────┐
│    Attendances           │
│──────────────────────────│
│ id (PK)                  │
│ UserId (FK) ───────────┐ │
│ WorkScheduleId (FK) ──┐│ │
│ HolidayId (FK) ──────┐││ │
│ date                 │││ │
│ clockIn              │││ │
│ clockOut             │││ │
│ status               │││ │
│ createdAt            │││ │
│ updatedAt            │││ │
└──────────────────────┼┼┼─┘
                       │││
              ┌────────┘││
              │         ││
              │ M       ││
        ┌─────▼────┐    ││
        │ Holidays │    ││
        │──────────│    ││
        │ id (PK)  │    ││
        │ date     │    ││
        │ descrip. │    ││
        │ isActive │    ││
        └──────────┘    ││
                        ││
               ┌────────┘│
               │         │
               │ M       │
        ┌──────▼──────┐  │
        │WorkSchedules│  │
        │─────────────│  │
        │ id (PK)     │  │
        │ workStart   │  │
        │ workEnd     │  │
        │ autoAbsent  │  │
        │ isActive    │  │
        └─────────────┘  │
                         │
        Reference to User ┘
```

---

## 🔗 Table Relationships

### 1. **Users → Attendances** (One-to-Many)

**Type:** Required Relationship  
**Foreign Key:** `UserId` in `Attendances` table  
**Cascade:** ON DELETE CASCADE, ON UPDATE CASCADE

**Description:**
- Satu user dapat memiliki banyak attendance records
- Jika user dihapus, semua attendance records ikut terhapus

**SQL Constraint:**
```sql
FOREIGN KEY (UserId) 
  REFERENCES Users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE
```

**Sequelize Association:**
```javascript
// User Model
User.hasMany(models.Attandance, { 
  foreignKey: 'UserId', 
  onDelete: 'CASCADE' 
});

// Attendance Model
Attandance.belongsTo(models.User, { 
  foreignKey: 'UserId',
  as: 'User'
});
```

**Query Example:**
```javascript
// Get user with all attendance records
const user = await User.findOne({
  where: { id: 1 },
  include: [{
    model: Attandance,
    as: 'Attandances'
  }]
});

// Get attendance with user info
const attendance = await Attandance.findOne({
  where: { id: 1 },
  include: [{
    model: User,
    as: 'User',
    attributes: ['id', 'name', 'email']
  }]
});
```

---

### 2. **WorkSchedules → Attendances** (One-to-Many)

**Type:** Optional Relationship  
**Foreign Key:** `WorkScheduleId` in `Attendances` table  
**Cascade:** ON DELETE SET NULL, ON UPDATE CASCADE

**Description:**
- Satu work schedule dapat digunakan oleh banyak attendance records
- Attendance record menyimpan reference ke schedule yang dipakai saat determine LATE/ON_TIME
- Jika work schedule dihapus, WorkScheduleId di attendance di-set NULL (keep history)

**SQL Constraint:**
```sql
FOREIGN KEY (WorkScheduleId) 
  REFERENCES WorkSchedules(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE
```

**Sequelize Association:**
```javascript
// WorkSchedule Model
WorkSchedule.hasMany(models.Attandance, { 
  foreignKey: 'WorkScheduleId',
  as: 'Attendances'
});

// Attendance Model
Attandance.belongsTo(models.WorkSchedule, { 
  foreignKey: 'WorkScheduleId',
  as: 'WorkSchedule'
});
```

**Query Example:**
```javascript
// Get work schedule with all attendances using it
const schedule = await WorkSchedule.findOne({
  where: { id: 1 },
  include: [{
    model: Attandance,
    as: 'Attendances',
    include: [{
      model: User,
      as: 'User',
      attributes: ['name', 'email']
    }]
  }]
});

// Get attendance with work schedule info
const attendance = await Attandance.findOne({
  where: { id: 1 },
  include: [{
    model: WorkSchedule,
    as: 'WorkSchedule',
    attributes: ['workStartTime', 'workEndTime', 'autoAbsentTime']
  }]
});
```

**Use Case:**
```javascript
// Audit: Berapa attendance yang pakai schedule lama vs baru?
const oldScheduleCount = await Attandance.count({
  where: { WorkScheduleId: 1 }
});

const newScheduleCount = await Attandance.count({
  where: { WorkScheduleId: 2 }
});
```

---

### 3. **Holidays → Attendances** (One-to-Many)

**Type:** Optional Relationship  
**Foreign Key:** `HolidayId` in `Attendances` table  
**Cascade:** ON DELETE SET NULL, ON UPDATE CASCADE

**Description:**
- Satu holiday dapat memiliki banyak attendance records (employees marked as HOLIDAY)
- Hanya attendance dengan status HOLIDAY yang memiliki HolidayId
- Jika holiday dihapus, HolidayId di attendance di-set NULL (keep history)

**SQL Constraint:**
```sql
FOREIGN KEY (HolidayId) 
  REFERENCES Holidays(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE
```

**Sequelize Association:**
```javascript
// Holiday Model
Holiday.hasMany(models.Attandance, { 
  foreignKey: 'HolidayId',
  as: 'Attendances'
});

// Attendance Model
Attandance.belongsTo(models.Holiday, { 
  foreignKey: 'HolidayId',
  as: 'Holiday'
});
```

**Query Example:**
```javascript
// Get holiday with all employees who were off
const holiday = await Holiday.findOne({
  where: { date: '2026-01-01' },
  include: [{
    model: Attandance,
    as: 'Attendances',
    include: [{
      model: User,
      as: 'User',
      attributes: ['name', 'email']
    }]
  }]
});

// Get attendance with holiday info
const attendance = await Attandance.findOne({
  where: { 
    status: 'HOLIDAY',
    date: { [Op.gte]: new Date('2026-01-01') }
  },
  include: [{
    model: Holiday,
    as: 'Holiday',
    attributes: ['date', 'description']
  }]
});
```

**Use Case:**
```javascript
// Report: Siapa saja yang libur karena Natal?
const christmasAttendances = await Attandance.findAll({
  include: [{
    model: Holiday,
    as: 'Holiday',
    where: { description: 'Christmas Day' }
  }, {
    model: User,
    as: 'User',
    attributes: ['name', 'email']
  }]
});
```

---

## 📋 Database Schema

### **Users Table**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM('admin', 'employee') | NOT NULL, DEFAULT 'employee' | User role |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)

---

### **Attendances Table**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique attendance identifier |
| UserId | INTEGER | NOT NULL, FOREIGN KEY → Users(id) | Reference to user |
| WorkScheduleId | INTEGER | NULL, FOREIGN KEY → WorkSchedules(id) | Reference to work schedule used |
| HolidayId | INTEGER | NULL, FOREIGN KEY → Holidays(id) | Reference to holiday (if status=HOLIDAY) |
| date | TIMESTAMP | NOT NULL | Attendance date |
| clockIn | TIMESTAMP | NOT NULL | Clock-in time |
| clockOut | TIMESTAMP | NOT NULL | Clock-out time |
| status | ENUM | NOT NULL, DEFAULT 'ON_PROGRESS' | Attendance status |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Status ENUM Values:**
- `ON_PROGRESS` - Employee has clocked in, not yet clocked out
- `ON_TIME` - Employee clocked in on time
- `LATE` - Employee clocked in late
- `ABSENT` - Employee didn't clock in
- `HOLIDAY` - Company holiday
- `LEAVE` - Employee on leave (future feature)

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (UserId) → Users(id)
- FOREIGN KEY (WorkScheduleId) → WorkSchedules(id)
- FOREIGN KEY (HolidayId) → Holidays(id)
- INDEX (WorkScheduleId) - For performance
- INDEX (HolidayId) - For performance

**Cascade Rules:**
- UserId: ON DELETE CASCADE, ON UPDATE CASCADE
- WorkScheduleId: ON DELETE SET NULL, ON UPDATE CASCADE
- HolidayId: ON DELETE SET NULL, ON UPDATE CASCADE

---

### **WorkSchedules Table**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique schedule identifier |
| workStartTime | VARCHAR(5) | NOT NULL, DEFAULT '09:00' | Work start time (HH:MM) |
| workEndTime | VARCHAR(5) | NOT NULL, DEFAULT '17:00' | Work end time (HH:MM) |
| autoAbsentTime | VARCHAR(5) | NOT NULL, DEFAULT '18:00' | Auto-absent cron time (HH:MM) |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Is this schedule active? |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes:**
- PRIMARY KEY (id)

**Business Rule:**
- Hanya boleh ada 1 active schedule (isActive=true) pada satu waktu
- Admin bisa create schedule baru, tapi harus set yang lama isActive=false

---

### **Holidays Table**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique holiday identifier |
| date | DATE | NOT NULL, UNIQUE | Holiday date (YYYY-MM-DD) |
| description | VARCHAR(255) | NOT NULL | Holiday name/description |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Is this holiday active? |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL | Record update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (date)

**Business Rule:**
- Satu tanggal hanya boleh ada 1 holiday
- Holiday dapat di-deactivate (isActive=false) tanpa dihapus

---

## 🎯 Relationship Benefits

### 1. **Data Integrity** ✅

**Before (No Relations):**
```javascript
// Attendance tidak tahu pakai schedule mana
const attendance = await Attandance.findByPk(1);
console.log(attendance.WorkScheduleId); // undefined

// Tidak bisa trace: "Attendance ini LATE berdasarkan schedule apa?"
```

**After (With Relations):**
```javascript
// Attendance punya reference ke schedule yang dipakai
const attendance = await Attandance.findByPk(1, {
  include: [{ model: WorkSchedule, as: 'WorkSchedule' }]
});
console.log(attendance.WorkSchedule.workStartTime); // "09:00"

// Clear audit trail: Tahu schedule mana yang dipakai untuk judge LATE/ON_TIME
```

---

### 2. **Audit Trail** ✅

**Example Use Case:**
```javascript
// Report: Attendance mana yang pakai schedule lama?
const oldScheduleAttendances = await Attandance.findAll({
  where: { WorkScheduleId: 1 },
  include: [{
    model: User,
    as: 'User',
    attributes: ['name']
  }, {
    model: WorkSchedule,
    as: 'WorkSchedule',
    attributes: ['workStartTime', 'workEndTime']
  }]
});

// Report: Siapa yang libur karena Natal?
const christmasOff = await Attandance.findAll({
  include: [{
    model: Holiday,
    as: 'Holiday',
    where: { description: 'Christmas Day' }
  }, {
    model: User,
    as: 'User'
  }]
});
```

---

### 3. **Data Consistency** ✅

**Scenario:**
```
09:00 - Admin set schedule: workStartTime = 09:00
10:00 - Employee A clock-in (LATE, pakai schedule workStart=09:00)
11:00 - Admin ubah schedule: workStartTime = 08:00
12:00 - Employee B clock-in (LATE, pakai schedule workStart=08:00)
```

**Before (No WorkScheduleId):**
- Attendance A & B sama-sama query active schedule
- Attendance A akan di-judge pakai schedule BARU (salah!)
- Inconsistent data

**After (With WorkScheduleId):**
- Attendance A saved with WorkScheduleId=1 (schedule lama)
- Attendance B saved with WorkScheduleId=2 (schedule baru)
- Consistent & accurate data

---

### 4. **Better Reporting** ✅

**Query Examples:**

```javascript
// 1. Attendance count by work schedule
const scheduleReport = await WorkSchedule.findAll({
  attributes: [
    'id',
    'workStartTime',
    [sequelize.fn('COUNT', sequelize.col('Attendances.id')), 'attendanceCount']
  ],
  include: [{
    model: Attandance,
    as: 'Attendances',
    attributes: []
  }],
  group: ['WorkSchedule.id']
});

// 2. Holiday impact analysis
const holidayReport = await Holiday.findAll({
  attributes: [
    'date',
    'description',
    [sequelize.fn('COUNT', sequelize.col('Attendances.id')), 'employeeCount']
  ],
  include: [{
    model: Attandance,
    as: 'Attendances',
    attributes: []
  }],
  group: ['Holiday.id']
});

// 3. User attendance with all relations
const userAttendances = await Attandance.findAll({
  where: { UserId: 1 },
  include: [
    { model: User, as: 'User' },
    { model: WorkSchedule, as: 'WorkSchedule' },
    { model: Holiday, as: 'Holiday' }
  ],
  order: [['date', 'DESC']]
});
```

---

## 🔄 Migration History

### Migration Timeline

1. ✅ **20251230083946-create-user.js** - Create Users table
2. ✅ **20251230084210-create-attandance.js** - Create Attendances table with UserId FK
3. ✅ **20260101092749-update-attendance-status-enum.js** - Add HOLIDAY status
4. ✅ **20260101162504-create-work-schedule.js** - Create WorkSchedules table
5. ✅ **20260101162510-create-holiday.js** - Create Holidays table
6. ✅ **20260101171058-add-workschedule-holiday-to-attendances.js** - **ADD WorkScheduleId & HolidayId FK**

### Latest Migration Details

**File:** `20260101171058-add-workschedule-holiday-to-attendances.js`

**Changes:**
- Added `WorkScheduleId` column to Attendances
- Added `HolidayId` column to Attendances
- Created foreign key constraints
- Added indexes for performance

**SQL Generated:**
```sql
-- Add WorkScheduleId column
ALTER TABLE "Attendances" 
ADD COLUMN "WorkScheduleId" INTEGER NULL
REFERENCES "WorkSchedules"(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- Add HolidayId column
ALTER TABLE "Attendances" 
ADD COLUMN "HolidayId" INTEGER NULL
REFERENCES "Holidays"(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- Add indexes
CREATE INDEX "attendances_work_schedule_id_idx" ON "Attendances"("WorkScheduleId");
CREATE INDEX "attendances_holiday_id_idx" ON "Attendances"("HolidayId");
```

**Rollback:**
```bash
npx sequelize-cli db:migrate:undo
```

---

## 📖 Usage Examples

### Example 1: Create Attendance with Relations

```javascript
// Employee clock-in (auto-save WorkScheduleId)
const workSchedule = await WorkSchedule.findOne({ where: { isActive: true } });

const attendance = await Attandance.create({
  UserId: 1,
  WorkScheduleId: workSchedule.id, // Save reference
  HolidayId: null,
  date: new Date(),
  clockIn: new Date(),
  clockOut: new Date(),
  status: 'ON_PROGRESS'
});
```

### Example 2: Auto Set Absent with Holiday

```javascript
// If today is holiday
const holiday = await Holiday.findOne({ 
  where: { date: '2026-01-01', isActive: true } 
});

const workSchedule = await WorkSchedule.findOne({ where: { isActive: true } });

await Attandance.create({
  UserId: 1,
  WorkScheduleId: workSchedule.id,
  HolidayId: holiday.id, // Save holiday reference
  date: new Date(),
  clockIn: new Date(),
  clockOut: new Date(),
  status: 'HOLIDAY'
});
```

### Example 3: Query with All Relations

```javascript
const attendances = await Attandance.findAll({
  include: [
    {
      model: User,
      as: 'User',
      attributes: ['id', 'name', 'email']
    },
    {
      model: WorkSchedule,
      as: 'WorkSchedule',
      attributes: ['workStartTime', 'workEndTime']
    },
    {
      model: Holiday,
      as: 'Holiday',
      attributes: ['date', 'description']
    }
  ],
  order: [['date', 'DESC']]
});

// Response example:
{
  id: 1,
  UserId: 1,
  WorkScheduleId: 1,
  HolidayId: null,
  date: "2026-01-02",
  status: "ON_TIME",
  User: {
    id: 1,
    name: "John Doe",
    email: "john@example.com"
  },
  WorkSchedule: {
    workStartTime: "09:00",
    workEndTime: "17:00"
  },
  Holiday: null
}
```

---

## 🎓 Best Practices

### 1. Always Save WorkScheduleId
```javascript
// ❌ BAD: Don't save schedule reference
await Attandance.create({
  UserId: userId,
  // Missing WorkScheduleId!
  date: new Date(),
  status: 'ON_TIME'
});

// ✅ GOOD: Always save schedule reference
const workSchedule = await WorkSchedule.findOne({ where: { isActive: true } });
await Attandance.create({
  UserId: userId,
  WorkScheduleId: workSchedule?.id, // Save reference
  date: new Date(),
  status: 'ON_TIME'
});
```

### 2. Save HolidayId Only for HOLIDAY Status
```javascript
// ✅ GOOD: Conditional HolidayId
const holiday = status === 'HOLIDAY' 
  ? await Holiday.findOne({ where: { date: targetDate } })
  : null;

await Attandance.create({
  UserId: userId,
  WorkScheduleId: workSchedule?.id,
  HolidayId: holiday?.id || null, // Only for HOLIDAY status
  status: status
});
```

### 3. Include Relations in Queries
```javascript
// ❌ BAD: Query without relations
const attendance = await Attandance.findByPk(1);
// Can't access schedule or holiday info

// ✅ GOOD: Include relations
const attendance = await Attandance.findByPk(1, {
  include: [
    { model: User, as: 'User' },
    { model: WorkSchedule, as: 'WorkSchedule' },
    { model: Holiday, as: 'Holiday' }
  ]
});
// Full context available
```

---

## 📊 Summary

### Relations Implemented ✅

1. **Users → Attendances** (One-to-Many) - Required
2. **WorkSchedules → Attendances** (One-to-Many) - Optional
3. **Holidays → Attendances** (One-to-Many) - Optional

### Benefits Achieved ✅

- ✅ Data integrity via foreign keys
- ✅ Audit trail untuk compliance
- ✅ Consistent data across schedule changes
- ✅ Better reporting capabilities
- ✅ Clear relationship documentation

### Files Modified ✅

- ✅ Migration: `20260101171058-add-workschedule-holiday-to-attendances.js`
- ✅ Models: `attendance.js`, `workschedule.js`, `holiday.js`
- ✅ Helper: `attendance.js`
- ✅ Controllers: `attendanceController.js`, `attendances_isAdminController.js`

---

**Documentation Version:** 2.0  
**Last Updated:** January 2, 2026  
**Status:** ✅ All relations implemented and tested
