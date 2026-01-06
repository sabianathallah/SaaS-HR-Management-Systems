const express = require("express");
const router = express.Router();
const AttendanceAdminController = require("../controllers/attendances_isAdminController");
const { uploadPhotoOptional } = require("../middlewares/uploadPhoto");

// Note: isAdmin middleware already applied at parent route level
// All routes here are admin-only

// Admin - View all attendance records
router.get("/all-attendance", AttendanceAdminController.getAllAttendance);

// Admin - Manual trigger auto-set-absent
router.post("/auto-set-absent", AttendanceAdminController.autoSetAbsent);

// Admin - Get today's attendance (all users or specific user)
router.get("/today-attendance", AttendanceAdminController.getTodayAttendance);

// ENDPOINT #1: Admin manually create attendance for employee (foto OPSIONAL)
router.post("/manual-attendance", uploadPhotoOptional, AttendanceAdminController.createManualAttendance);

// ENDPOINT #2: Admin edit manual attendance (foto OPSIONAL)
router.put("/manual-attendance/:id", uploadPhotoOptional, AttendanceAdminController.updateManualAttendance);

// ENDPOINT #3: Admin update work schedule (operational hours)
router.put("/work-schedule", AttendanceAdminController.updateWorkSchedule);
router.get("/work-schedule", AttendanceAdminController.getWorkSchedule);

// ENDPOINT #4: Admin manage holidays
router.post("/holiday", AttendanceAdminController.addHoliday);
router.delete("/holiday/:id", AttendanceAdminController.deleteHoliday);
router.get("/holiday", AttendanceAdminController.getAllHolidays);
// tambahan endpoint untuk mengupdate holiday
router.put("/holiday/:id", AttendanceAdminController.updateHoliday);

// ENDPOINT #5: Admin get employee statistics (specific employee)
router.get("/employee-statistics/:userId", AttendanceAdminController.getEmployeeStatistics);

// ENDPOINT #6: Admin get all employees statistics
router.get("/all-statistics", AttendanceAdminController.getAllEmployeesStatistics);

// ENDPOINT #7: Admin get attendance summary with period filter (daily, weekly, monthly, custom)
router.get("/summary", AttendanceAdminController.getAttendanceSummary);

module.exports = router;
