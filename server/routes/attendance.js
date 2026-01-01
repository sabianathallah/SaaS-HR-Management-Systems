const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/attendanceController");

// ===== AUTHENTICATED USER ROUTES (EMPLOYEES) =====

// Employee - Clock in
router.post("/clock-in", AttendanceController.clockIn);

// Employee - Clock out
router.post("/clock-out", AttendanceController.clockOut);

// Employee - Get my attendance records
router.get("/my-attendance", AttendanceController.getMyAttendance);

// Employee - Get today's attendance (own record)
router.get("/today-attendance", AttendanceController.getTodayAttendance);

module.exports = router;