const express = require("express");
const router = express.Router();
const LeaveRequestController = require("../controllers/leaveRequestController");
const { upload } = require("../helpers/fileUploadHelper");

// Note: authentication middleware already applied at parent route level (routes/index.js)

// ===== EMPLOYEE ROUTES =====

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error('Multer Error:', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({
        message: 'Invalid file type. Only PDF, JPG, PNG are allowed.',
        error: 'INVALID_FILE_TYPE'
      });
    }
    
    return res.status(400).json({
      message: err.message || 'File upload error',
      error: 'UPLOAD_ERROR'
    });
  }
  next();
};

// Employee - Submit leave/permission request (with optional file attachment)
router.post("/", 
  upload.single('attachment'), 
  multerErrorHandler,
  LeaveRequestController.submitRequest
);

// Employee - Get my leave requests
router.get("/my-requests", LeaveRequestController.getMyRequests);

// Employee - Get my leave balance
router.get("/my-balance", LeaveRequestController.getMyBalance);

// Employee - Cancel my leave request (PENDING only)
router.delete("/:id", LeaveRequestController.cancelRequest);

module.exports = router;
