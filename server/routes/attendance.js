const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/attendanceController");
const isAdmin = require("../middlewares/authorization");

// for admin only
router.get("/all-attendance", isAdmin, AttendanceController.getAllAttendance);

router.post("/clock-in", AttendanceController.clockIn);
router.post("/clock-out", AttendanceController.clockOut);
router.get("/my-attendance", AttendanceController.getMyAttendance);

module.exports = router;