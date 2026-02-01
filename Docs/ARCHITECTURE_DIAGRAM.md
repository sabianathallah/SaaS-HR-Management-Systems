# 📊 VISUAL ARCHITECTURE DIAGRAM

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │   Employee Side     │         │     Admin Side       │        │
│  ├─────────────────────┤         ├─────────────────────┤        │
│  │                     │         │                      │        │
│  │ 📍 Work Location    │         │ 🏢 Work Location    │        │
│  │    Tab              │         │    Requests Menu    │        │
│  │                     │         │                      │        │
│  │ ┌─────────────────┐ │         │ ┌────────────────┐ │        │
│  │ │ HybridSchedule  │ │         │ │ Pending Tab    │ │        │
│  │ │ Component       │ │         │ │ All Tab        │ │        │
│  │ │ - View/Edit     │ │         │ │ Statistics Tab │ │        │
│  │ │ - Weekly Grid   │ │         │ │ Approve/Reject │ │        │
│  │ └─────────────────┘ │         │ └────────────────┘ │        │
│  │                     │         │                      │        │
│  │ ┌─────────────────┐ │         │ 🔄 Hybrid Schedule  │        │
│  │ │ WorkLocation    │ │         │    Menu             │        │
│  │ │ Request         │ │         │                      │        │
│  │ │ Component       │ │         │ ┌────────────────┐ │        │
│  │ │ - Create        │ │         │ │ View All       │ │        │
│  │ │ - History       │ │         │ │ Edit User      │ │        │
│  │ │ - Cancel        │ │         │ │ Statistics     │ │        │
│  │ └─────────────────┘ │         │ └────────────────┘ │        │
│  │                     │         │                      │        │
│  └─────────────────────┘         └─────────────────────┘        │
│                                                                   │
└───────────────────────┬───────────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS (axios)
                        │ Bearer Token Auth
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                    BACKEND (Express + Sequelize)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      ROUTES LAYER                            │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  /work-location-changes           /hybrid-schedules         │ │
│  │  ├─ POST   /                      ├─ GET    /               │ │
│  │  ├─ GET    /                      ├─ PUT    /               │ │
│  │  └─ PATCH  /:id/cancel            └─ DELETE /:dayOfWeek     │ │
│  │                                                              │ │
│  │  /work-location-changes/admin     /hybrid-schedules/admin   │ │
│  │  ├─ GET    /                      ├─ GET    /               │ │
│  │  ├─ GET    /pending               ├─ GET    /user/:userId   │ │
│  │  ├─ PATCH  /:id/approve           ├─ PUT    /user/:userId   │ │
│  │  ├─ PATCH  /:id/reject            ├─ DELETE /user/:id/day/x │ │
│  │  └─ GET    /statistics            └─ GET    /statistics     │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE LAYER                          │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ Authenticate │  │  isAdmin     │  │  Validation  │     │ │
│  │  │  (JWT)       │→ │  Check       │→ │  Layer       │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   CONTROLLER LAYER                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  workLocationChangeRequestController.js                     │ │
│  │  ├─ createRequest()                                         │ │
│  │  ├─ getOwnRequests()                                        │ │
│  │  └─ cancelRequest()                                         │ │
│  │                                                              │ │
│  │  workLocationChangeRequestAdminController.js                │ │
│  │  ├─ getAllRequests()                                        │ │
│  │  ├─ getPendingRequests()                                    │ │
│  │  ├─ approveRequest()                                        │ │
│  │  ├─ rejectRequest()                                         │ │
│  │  └─ getStatistics()                                         │ │
│  │                                                              │ │
│  │  hybridScheduleController.js                                │ │
│  │  ├─ getOwnSchedule()                                        │ │
│  │  ├─ upsertSchedule()                                        │ │
│  │  └─ deleteSchedule()                                        │ │
│  │                                                              │ │
│  │  hybridScheduleAdminController.js                           │ │
│  │  ├─ getAllSchedules()                                       │ │
│  │  ├─ getScheduleByUserId()                                   │ │
│  │  ├─ upsertScheduleForUser()                                 │ │
│  │  ├─ deleteScheduleDay()                                     │ │
│  │  └─ getStatistics()                                         │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      HELPER LAYER                            │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  workLocation.js                                            │ │
│  │  ├─ getEffectiveLocationType(userId, date)                 │ │
│  │  │   1. Check approved requests (Priority 1)               │ │
│  │  │   2. Check hybrid schedule (Priority 2)                 │ │
│  │  │   3. Return ONSITE default (Priority 3)                 │ │
│  │  │                                                           │ │
│  │  ├─ shouldValidateGPS(locationType)                        │ │
│  │  │   → true if ONSITE, false if WFH/REMOTE                 │ │
│  │  │                                                           │ │
│  │  └─ getWorkLocationInfo(userId, date)                      │ │
│  │      → Complete location info + GPS requirement            │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                       MODEL LAYER                            │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ┌───────────────────────────┐  ┌──────────────────────┐   │ │
│  │  │ WorkLocationChangeRequest │  │  HybridSchedule      │   │ │
│  │  ├───────────────────────────┤  ├──────────────────────┤   │ │
│  │  │ - id                      │  │ - id                 │   │ │
│  │  │ - UserId (FK)             │  │ - UserId (FK)        │   │ │
│  │  │ - requestDate             │  │ - dayOfWeek (0-6)    │   │ │
│  │  │ - originalLocationType    │  │ - locationType       │   │ │
│  │  │ - requestedLocationType   │  │ - createdAt          │   │ │
│  │  │ - reason                  │  │ - updatedAt          │   │ │
│  │  │ - status                  │  │                      │   │ │
│  │  │ - approvedBy (FK)         │  │ UNIQUE(UserId,day)   │   │ │
│  │  │ - rejectionReason         │  └──────────────────────┘   │ │
│  │  │ - createdAt               │                             │ │
│  │  │ - updatedAt               │                             │ │
│  │  └───────────────────────────┘                             │ │
│  │                                                              │ │
│  │  Associations:                                              │ │
│  │  User → hasMany → WorkLocationChangeRequests               │ │
│  │  User → hasMany → HybridSchedules                           │ │
│  │  WorkLocationChangeRequest → belongsTo → User (employee)    │ │
│  │  WorkLocationChangeRequest → belongsTo → User (approver)    │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────┬───────────────────────────────────────────┘
                        │
                        │ Sequelize ORM
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ WorkLocationChangeRequests                                   │ │
│  │ ├─ id (PK)                                                   │ │
│  │ ├─ UserId (FK → Users.id)                                    │ │
│  │ ├─ requestDate (indexed)                                     │ │
│  │ ├─ status (indexed: PENDING/APPROVED/REJECTED/CANCELLED)    │ │
│  │ └─ approvedBy (FK → Users.id, nullable)                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ HybridSchedules                                              │ │
│  │ ├─ id (PK)                                                   │ │
│  │ ├─ UserId (FK → Users.id, indexed)                           │ │
│  │ ├─ dayOfWeek (0-6)                                           │ │
│  │ ├─ locationType (ONSITE/WFH/REMOTE)                          │ │
│  │ └─ UNIQUE CONSTRAINT (UserId, dayOfWeek)                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Flow 1: Employee Creates Work Location Request

```
┌────────────┐
│  Employee  │
└─────┬──────┘
      │
      │ 1. Select date, location type, reason
      ▼
┌─────────────────────┐
│  Frontend Component │
│ WorkLocationRequest │
└─────┬───────────────┘
      │
      │ 2. Validation (no past dates, required fields)
      ▼
┌─────────────────────┐
│  POST Request       │
│  /work-location-    │
│  changes            │
└─────┬───────────────┘
      │
      │ 3. JWT Token in header
      ▼
┌─────────────────────┐
│  Backend Middleware │
│  - Authenticate     │
│  - Validate         │
└─────┬───────────────┘
      │
      │ 4. Create request
      ▼
┌─────────────────────┐
│  Controller         │
│  createRequest()    │
│  - Detect original  │
│  - Check duplicate  │
│  - Save to DB       │
└─────┬───────────────┘
      │
      │ 5. Insert row
      ▼
┌─────────────────────┐
│  Database           │
│  INSERT INTO        │
│  WorkLocation...    │
│  status=PENDING     │
└─────┬───────────────┘
      │
      │ 6. Return success
      ▼
┌─────────────────────┐
│  Response 201       │
│  { message, data }  │
└─────────────────────┘
```

### Flow 2: Admin Approves Request

```
┌────────────┐
│   Admin    │
└─────┬──────┘
      │
      │ 1. Click Approve button
      ▼
┌─────────────────────┐
│  Frontend Component │
│ WorkLocationMgmt    │
└─────┬───────────────┘
      │
      │ 2. Confirm dialog
      ▼
┌─────────────────────┐
│  PATCH Request      │
│  /admin/:id/approve │
└─────┬───────────────┘
      │
      │ 3. JWT + Admin role check
      ▼
┌─────────────────────┐
│  Backend Middleware │
│  - Authenticate     │
│  - isAdmin check    │
└─────┬───────────────┘
      │
      │ 4. Approve request
      ▼
┌─────────────────────┐
│  Controller         │
│  approveRequest()   │
│  - Check PENDING    │
│  - Set approvedBy   │
│  - Update status    │
└─────┬───────────────┘
      │
      │ 5. Update row
      ▼
┌─────────────────────┐
│  Database           │
│  UPDATE             │
│  status=APPROVED    │
│  approvedBy=adminId │
└─────┬───────────────┘
      │
      │ 6. Return success
      ▼
┌─────────────────────┐
│  Response 200       │
│  { message, data }  │
└─────────────────────┘
```

### Flow 3: Attendance Check with Work Location

```
┌────────────┐
│  Employee  │
│  Clock In  │
└─────┬──────┘
      │
      │ 1. Request to clock in
      ▼
┌─────────────────────┐
│  Attendance         │
│  Controller         │
└─────┬───────────────┘
      │
      │ 2. Get work location info
      ▼
┌─────────────────────┐
│  workLocation       │
│  Helper             │
│  getWorkLocationInfo│
└─────┬───────────────┘
      │
      │ 3. Check Priority 1
      ▼
┌─────────────────────┐
│  Check Approved     │
│  Request for today? │
└─────┬───────────────┘
      │
      │ YES: Use request type
      │ NO: Go to Priority 2
      ▼
┌─────────────────────┐
│  Check Hybrid       │
│  Schedule for       │
│  today's day?       │
└─────┬───────────────┘
      │
      │ YES: Use schedule type
      │ NO: Go to Priority 3
      ▼
┌─────────────────────┐
│  Default: ONSITE    │
└─────┬───────────────┘
      │
      │ 4. Determine GPS requirement
      ▼
┌─────────────────────┐
│  shouldValidateGPS? │
│  - ONSITE: true     │
│  - WFH/REMOTE: false│
└─────┬───────────────┘
      │
      │ 5. Validate GPS if needed
      ▼
┌─────────────────────┐
│  GPS Validation     │
│  (if required)      │
└─────┬───────────────┘
      │
      │ 6. Save attendance
      ▼
┌─────────────────────┐
│  Database           │
│  INSERT attendance  │
└─────────────────────┘
```

## Priority System Flowchart

```
                    ┌─────────────────────┐
                    │  Determine Work     │
                    │  Location for Date  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  PRIORITY 1:        │
                    │  Check Approved     │
                    │  Request for Date?  │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴───────────────┐
                │                              │
                ▼ YES                          ▼ NO
    ┌─────────────────────┐        ┌─────────────────────┐
    │  Use Request Type   │        │  PRIORITY 2:        │
    │  (WFH/REMOTE/       │        │  Check Hybrid       │
    │   ONSITE)           │        │  Schedule for Day?  │
    └─────────┬───────────┘        └──────────┬──────────┘
              │                               │
              │                ┌──────────────┴───────────────┐
              │                │                              │
              │                ▼ YES                          ▼ NO
              │    ┌─────────────────────┐        ┌─────────────────────┐
              │    │  Use Schedule Type  │        │  PRIORITY 3:        │
              │    │  (per day of week)  │        │  Default ONSITE     │
              │    └─────────┬───────────┘        └──────────┬──────────┘
              │              │                               │
              └──────────────┴───────────────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Effective Location │
                  │  Type Determined    │
                  └─────────────────────┘
```

## Component Hierarchy

```
AdminPage
│
├─── AdminDashboard
├─── EmployeeManagement
├─── AttendanceManagement
├─── LeaveManagement
├─── ShiftScheduleManagement
├─── OvertimeManagement
├─── OfficeLocationManagement
│
├─── WorkLocationManagement ★ NEW
│    ├─── Tab: Pending Requests
│    │    ├─── Request List
│    │    └─── Approve/Reject Buttons
│    ├─── Tab: All Requests
│    │    ├─── Filter Controls
│    │    ├─── Request List
│    │    └─── Pagination
│    └─── Tab: Statistics
│         ├─── Status Overview Card
│         └─── Location Type Card
│
├─── HybridScheduleManagement ★ NEW
│    ├─── Tab: All Schedules
│    │    ├─── User Schedule Grid
│    │    └─── Edit Modal
│    └─── Tab: Statistics
│         ├─── Overview Card
│         ├─── By Day Card
│         └─── By Location Type Card
│
├─── ReportAnalytics
└─── AuditLogViewer


EmployeePage
│
├─── Dashboard Tab
├─── Attendance Tab
├─── Leave Tab
│
├─── Work Location Tab ★ NEW
│    ├─── HybridSchedule Component
│    │    ├─── View Mode (Weekly Grid)
│    │    ├─── Edit Mode (Day Selectors)
│    │    └─── Summary Statistics
│    │
│    └─── WorkLocationRequest Component
│         ├─── Create Request Form
│         └─── Request History List
│
├─── Notifications Tab
└─── Profile Tab
```

---

## State Management Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT STATE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WorkLocationManagement:                                    │
│  ├─ activeTab: 'pending' | 'all' | 'statistics'            │
│  ├─ requests: Array<Request>                               │
│  ├─ statistics: Object                                     │
│  ├─ loading: boolean                                       │
│  ├─ currentPage: number                                    │
│  ├─ totalPages: number                                     │
│  ├─ filters: { status, userId, startDate, endDate }       │
│  ├─ showRejectModal: boolean                              │
│  ├─ selectedRequest: Request | null                        │
│  └─ rejectionReason: string                                │
│                                                             │
│  HybridScheduleManagement:                                  │
│  ├─ activeTab: 'schedules' | 'statistics'                 │
│  ├─ schedules: Array<UserSchedule>                        │
│  ├─ statistics: Object                                     │
│  ├─ loading: boolean                                       │
│  ├─ currentPage: number                                    │
│  ├─ totalPages: number                                     │
│  ├─ showEditModal: boolean                                │
│  ├─ selectedUser: User | null                             │
│  └─ weeklySchedule: { [dayOfWeek]: locationType }        │
│                                                             │
│  WorkLocationRequest:                                       │
│  ├─ requests: Array<Request>                              │
│  ├─ loading: boolean                                       │
│  ├─ showForm: boolean                                     │
│  └─ form: { requestDate, requestedLocationType, reason } │
│                                                             │
│  HybridSchedule:                                           │
│  ├─ schedule: { [dayOfWeek]: locationType }              │
│  ├─ loading: boolean                                       │
│  ├─ editMode: boolean                                     │
│  └─ tempSchedule: { [dayOfWeek]: locationType }          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
             │
             │ useEffect triggers
             ▼
┌─────────────────────────────────────────────────────────────┐
│                     API CALLS                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  axios.get/post/patch/delete(API_BASE_URL + endpoint)      │
│  headers: { Authorization: `Bearer ${token}` }             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
             │
             │ Response
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   STATE UPDATE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Success: setState(response.data)                          │
│  Error: console.error + alert(error.message)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ★ NEW: Newly created components
- → : Data flow direction
- ├─ : Has/Contains
- └─ : End of branch
- ▼ : Next step
- PK : Primary Key
- FK : Foreign Key

