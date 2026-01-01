const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/attendanceController");
const AttendanceAdminController = require("../controllers/attendances_forAdmin");
const isAdmin = require("../middlewares/authorization");

// ===== ADMIN ONLY ROUTES =====

// Admin - View all attendance records
router.get("/all-attendance", isAdmin, AttendanceAdminController.getAllAttendance);

// Admin - Manual trigger auto-set-absent
router.post("/auto-set-absent", isAdmin, AttendanceAdminController.autoSetAbsent);

// Admin - Get today's attendance (all users or specific user)
router.get("/today-attendance", isAdmin, AttendanceAdminController.getTodayAttendance);

// ENDPOINT #1: Admin manually create attendance for employee
router.post("/admin/manual-attendance", isAdmin, AttendanceAdminController.createManualAttendance);

// ENDPOINT #2: Admin edit manual attendance
router.put("/admin/manual-attendance/:id", isAdmin, AttendanceAdminController.updateManualAttendance);

// ENDPOINT #3: Admin update work schedule (operational hours)
router.put("/admin/work-schedule", isAdmin, AttendanceAdminController.updateWorkSchedule);
router.get("/admin/work-schedule", isAdmin, AttendanceAdminController.getWorkSchedule);

// ENDPOINT #4: Admin manage holidays
router.post("/admin/holiday", isAdmin, AttendanceAdminController.addHoliday);
router.delete("/admin/holiday/:id", isAdmin, AttendanceAdminController.deleteHoliday);
router.get("/admin/holidays", isAdmin, AttendanceAdminController.getAllHolidays);

// ===== AUTHENTICATED USER ROUTES =====

// for authenticated users (employees)
router.post("/clock-in", AttendanceController.clockIn);
router.post("/clock-out", AttendanceController.clockOut);
router.get("/my-attendance", AttendanceController.getMyAttendance);

module.exports = router;