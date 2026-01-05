const express = require("express");
const router = express.Router();
const LeaveRequestController = require("../controllers/leaveRequestController");

// Note: authentication middleware already applied at parent route level (routes/index.js)

// ===== EMPLOYEE ROUTES =====

// Employee - Submit leave/permission request
router.post("/", LeaveRequestController.submitRequest);

// Employee - Get my leave requests
router.get("/my-requests", LeaveRequestController.getMyRequests);

// Employee - Get my leave balance
router.get("/my-balance", LeaveRequestController.getMyBalance);

// Employee - Cancel my leave request (PENDING only)
router.delete("/:id", LeaveRequestController.cancelRequest);

module.exports = router;
