const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/attendanceController");
const isAdmin = require("../middlewares/authorization");

// ===== ADMIN ONLY ROUTES =====

// Existing admin routes
router.get("/all-attendance", isAdmin, AttendanceController.getAllAttendance);
router.post("/auto-set-absent", isAdmin, AttendanceController.autoSetAbsent);
router.get("/today-attendance", isAdmin, AttendanceController.getTodayAttendance);

// ENDPOINT #1: Admin manually create attendance for employee
router.post("/admin/manual-attendance", isAdmin, AttendanceController.createManualAttendance);

// ENDPOINT #2: Admin edit manual attendance
router.put("/admin/manual-attendance/:id", isAdmin, AttendanceController.updateManualAttendance);

// ENDPOINT #3: Admin update work schedule (operational hours)
router.put("/admin/work-schedule", isAdmin, AttendanceController.updateWorkSchedule);
router.get("/admin/work-schedule", isAdmin, AttendanceController.getWorkSchedule);

// ENDPOINT #4: Admin manage holidays
router.post("/admin/holiday", isAdmin, AttendanceController.addHoliday);
router.delete("/admin/holiday/:id", isAdmin, AttendanceController.deleteHoliday);
router.get("/admin/holidays", isAdmin, AttendanceController.getAllHolidays);

// ===== AUTHENTICATED USER ROUTES =====

// for authenticated users
router.post("/clock-in", AttendanceController.clockIn);
router.post("/clock-out", AttendanceController.clockOut);
router.get("/my-attendance", AttendanceController.getMyAttendance);

module.exports = router;