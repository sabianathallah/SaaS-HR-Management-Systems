# 🏢 Hybrid Work & Work Location Management System

## Overview

Sistem manajemen lokasi kerja hybrid yang memungkinkan pegawai untuk:
1. **Memiliki jadwal hybrid tetap** - Kombinasi onsite/WFH/remote dalam seminggu
2. **Request perubahan lokasi kerja sementara** - Request WFH/remote untuk hari tertentu yang butuh approval admin

## Features

### ✨ Hybrid Schedule (Jadwal Tetap)
- Pegawai dapat set jadwal kerja hybrid per minggu
- Contoh: 3 hari onsite (Senin-Rabu), 2 hari WFH (Kamis-Jumat)
- Admin dapat set jadwal hybrid untuk pegawai tertentu
- Statistik breakdown lokasi kerja per hari

### 🔄 Work Location Change Request (Request Sementara)
- Pegawai dapat request perubahan lokasi untuk hari tertentu
- Workflow approval: PENDING → APPROVED/REJECTED
- Admin dapat approve/reject dengan alasan
- History dan tracking semua request
- Statistik request per status dan tipe lokasi

### 🎯 Smart Location Detection
- Sistem otomatis menentukan lokasi kerja berdasarkan:
  1. Approved work location change request (priority tertinggi)
  2. Hybrid schedule (recurring pattern)
  3. Default ONSITE (jika tidak ada keduanya)
- GPS validation hanya required untuk ONSITE work
- WFH/Remote tidak perlu GPS saat attendance

## Database Schema

### WorkLocationChangeRequests
```sql
- id (PK)
- UserId (FK to Users)
- requestDate (DATE)
- originalLocationType (ENUM: ONSITE, WFH, REMOTE)
- requestedLocationType (ENUM: ONSITE, WFH, REMOTE)
- reason (TEXT)
- status (ENUM: PENDING, APPROVED, REJECTED, CANCELLED)
- approvedBy (FK to Users, nullable)
- approvalDate (DATETIME, nullable)
- rejectionReason (TEXT, nullable)
- createdAt
- updatedAt
```

### HybridSchedules
```sql
- id (PK)
- UserId (FK to Users)
- dayOfWeek (INTEGER 0-6, 0=Sunday)
- locationType (ENUM: ONSITE, WFH, REMOTE)
- isActive (BOOLEAN)
- createdAt
- updatedAt
- UNIQUE INDEX (UserId, dayOfWeek)
```

## API Endpoints

### Employee Endpoints

#### Hybrid Schedule
```
GET    /hybrid-schedules              - Get own hybrid schedule
PUT    /hybrid-schedules              - Create/update hybrid schedule
DELETE /hybrid-schedules              - Delete hybrid schedule
```

#### Work Location Change Request
```
POST   /work-location-changes         - Create request
GET    /work-location-changes         - Get own requests
PATCH  /work-location-changes/:id/cancel - Cancel request
```

### Admin Endpoints

#### Hybrid Schedule Management
```
GET    /hybrid-schedules/admin                     - Get all schedules
GET    /hybrid-schedules/admin/statistics          - Get statistics
GET    /hybrid-schedules/admin/user/:userId        - Get schedule by user
PUT    /hybrid-schedules/admin/user/:userId        - Update schedule for user
DELETE /hybrid-schedules/admin/user/:userId        - Delete schedule for user
```

#### Work Location Change Request Management
```
GET    /work-location-changes/admin                - Get all requests
GET    /work-location-changes/admin/pending        - Get pending requests
GET    /work-location-changes/admin/statistics     - Get statistics
PATCH  /work-location-changes/admin/:id/approve    - Approve request
PATCH  /work-location-changes/admin/:id/reject     - Reject request
```

## Priority System

Saat menentukan work location untuk hari tertentu:

```
Priority 1: Approved Work Location Change Request
            ↓ (if not found)
Priority 2: Hybrid Schedule
            ↓ (if not found)
Priority 3: Default ONSITE
```

## Use Cases

### Case 1: Regular Hybrid Schedule
John bekerja:
- Senin-Rabu: Onsite
- Kamis-Jumat: WFH

Setup hybrid schedule sekali, berlaku setiap minggu.

### Case 2: Temporary Work Location Change
Sarah biasanya onsite setiap hari, tapi:
- Rabu ini butuh WFH karena ada service AC
- Request WFH untuk tanggal spesifik
- Admin approve
- Hari lain tetap onsite seperti biasa

### Case 3: Hybrid + Temporary Override
Mike punya schedule hybrid, tapi:
- Normally: Mon-Wed onsite, Thu-Fri WFH
- Request WFH untuk Senin ini (sakit ringan)
- Admin approve
- **Senin:** WFH (temporary override)
- **Selasa-Rabu:** Onsite (hybrid schedule)
- **Kamis-Jumat:** WFH (hybrid schedule)

## GPS Validation Logic

```javascript
// GPS required only for ONSITE work
if (locationType === 'ONSITE' && !isFlexibleShift) {
  // Require GPS coordinates
  // Validate location within office radius
} else {
  // GPS not required for WFH/REMOTE
  // No location validation
}
```

## Integration Points

### Attendance System
- Clock-in checks effective work location for the day
- Adapts GPS requirement based on location type
- Response includes work location info:
  ```json
  {
    "locationInfo": {
      "workLocationType": "WFH",
      "workLocationSource": "HYBRID_SCHEDULE",
      "requiresGPS": false,
      "message": "Working from home - location not required"
    }
  }
  ```

### Notification System (Future)
- Notify pegawai when request approved/rejected
- Remind pegawai about tomorrow's work location
- Alert admin about pending requests

### Dashboard (Frontend Integration)
- Display work location badge/indicator
- Show upcoming schedule
- Request management interface
- Admin approval dashboard
- Statistics and reports

## Installation & Setup

### 1. Run Migrations
```bash
cd server
npx sequelize-cli db:migrate
```

This will create:
- `WorkLocationChangeRequests` table
- `HybridSchedules` table
- Indexes for performance

### 2. Update User Model (Already Done)
Associations added:
- `User.hasMany(WorkLocationChangeRequest)`
- `User.hasMany(HybridSchedule)`

### 3. Test the APIs
```bash
# Run tests
npm test __test__/workLocationChangeRequest.test.js
npm test __test__/hybridSchedule.test.js
```

## Configuration

No additional configuration needed. The system uses existing:
- Authentication middleware
- Authorization middleware (isAdmin)
- Error handler
- Audit logger

## Testing

### Unit Tests
- Work Location Change Request (Employee & Admin)
- Hybrid Schedule (Employee & Admin)
- Work Location Helper functions

### Test Coverage
- Create/Read/Update/Delete operations
- Authorization checks
- Validation rules
- Business logic (priority system)
- Error handling

## Documentation

### API Documentation
- `/server/docs (md)/WORK_LOCATION_MANAGEMENT.md` - Complete API reference
- `/server/docs (md)/WORK_LOCATION_QUICKSTART.md` - Quick start guide (ID)

### Code Documentation
- Inline comments in controllers
- JSDoc for helper functions
- Model associations documented

## Migration Path

### For Existing Users
1. All existing users default to ONSITE (no change in behavior)
2. Users can opt-in to set hybrid schedule
3. Temporary change requests are optional

### For Attendance
1. Attendance system automatically checks work location
2. GPS validation adapts based on location type
3. No breaking changes to existing functionality

## Performance Considerations

### Database Indexes
- `WorkLocationChangeRequests`: Indexed on (UserId, requestDate), (status)
- `HybridSchedules`: Unique index on (UserId, dayOfWeek)

### Caching Opportunities (Future)
- Cache hybrid schedules per user
- Cache approved requests for current month
- Invalidate on update

### Query Optimization
- Join optimization in admin list queries
- Pagination for large datasets
- Efficient date range queries

## Security

### Authorization
- Employee can only view/modify own data
- Admin can view/modify all data
- Proper role-based access control

### Validation
- Input validation on all endpoints
- Date validation (no past dates for requests)
- Status transition validation
- Unique constraint on hybrid schedule per user per day

### Audit Trail
- All changes logged via AuditLogger
- Track who approved/rejected requests
- Maintain history of schedule changes

## Monitoring & Metrics

### Key Metrics to Track
- Total hybrid schedule users
- Request approval rate
- Average approval time
- Work location distribution per day
- GPS validation success rate

### Admin Statistics Endpoints
```
GET /work-location-changes/admin/statistics
GET /hybrid-schedules/admin/statistics
```

## Future Enhancements

### Phase 2 Features
- [ ] Bulk approve/reject requests
- [ ] Auto-approve rules (e.g., WFH on Fridays)
- [ ] Team calendar view
- [ ] Conflict detection (e.g., meeting scheduled when WFH requested)
- [ ] Email/push notifications
- [ ] Mobile app support
- [ ] Integration with calendar systems (Google Calendar, Outlook)

### Phase 3 Features
- [ ] Smart scheduling suggestions
- [ ] Office capacity planning
- [ ] Desk booking integration
- [ ] Analytics dashboard
- [ ] Reporting tools for management
- [ ] API webhooks for third-party integration

## Support

For questions or issues:
- Documentation: `/server/docs (md)/`
- Tests: `/server/__test__/`
- Code: `/server/controllers/`, `/server/models/`, `/server/routes/`

## Version History

### v1.0.0 (January 16, 2026)
- Initial release
- Hybrid schedule management
- Work location change request system
- Integration with attendance system
- Complete API documentation
- Test coverage

## License

Same as main project

## Contributors

- Backend implementation
- Database schema design
- API documentation
- Test coverage

---

**Last Updated:** January 16, 2026
**Status:** Production Ready ✅
