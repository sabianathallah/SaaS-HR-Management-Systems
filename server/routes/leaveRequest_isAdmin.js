const express = require("express");
const router = express.Router();
const LeaveRequestAdminController = require("../controllers/leaveRequestAdminController");

// Note: isAdmin middleware already applied at parent route level
// All routes here are admin-only

// Admin - Get all leave requests
router.get("/all", LeaveRequestAdminController.getAllRequests);

// Admin - Approve leave request
router.put("/:id/approve", LeaveRequestAdminController.approveRequest);

// Admin - Reject leave request
router.put("/:id/reject", LeaveRequestAdminController.rejectRequest);

// Admin - Manually adjust employee leave quota
router.put("/adjust-quota/:userId", LeaveRequestAdminController.adjustQuota);

// Admin - Get employee leave balance
router.get("/balance/:userId", LeaveRequestAdminController.getEmployeeBalance);

// Admin - View leave request attachment (inline preview)
router.get("/:id/attachment/view", LeaveRequestAdminController.viewAttachment);

// Admin - Download leave request attachment
router.get("/:id/attachment/download", LeaveRequestAdminController.downloadAttachment);

module.exports = router;
