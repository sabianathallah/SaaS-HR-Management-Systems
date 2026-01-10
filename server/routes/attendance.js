const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/attendanceController");
const { uploadPhotoCheckIn, uploadPhotoCheckOut } = require("../middlewares/uploadPhoto");

// ===== AUTHENTICATED USER ROUTES (EMPLOYEES) =====

// Employee - Clock in (WAJIB dengan foto) - CREATE new record
router.post("/clock-in", uploadPhotoCheckIn, AttendanceController.clockIn);

// Employee - Clock out (WAJIB dengan foto) - UPDATE existing record
router.put("/clock-out", uploadPhotoCheckOut, AttendanceController.clockOut);

// Employee - Get my attendance records
router.get("/my-attendance", AttendanceController.getMyAttendance);

// Employee - Get today's attendance (own record)
router.get("/today-attendance", AttendanceController.getTodayAttendance);

// Employee - Get my attendance statistics (monthly)
router.get("/my-statistics", AttendanceController.getMyStatistics);

module.exports = router;