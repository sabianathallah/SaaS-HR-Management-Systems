const express = require('express')
const router = express.Router()

const attendanceRouter = require('./attendance')
const attendance_isAdminRouter = require('./attendance_isAdmin')
const leaveRequestRouter = require('./leaveRequest')
const leaveRequest_isAdminRouter = require('./leaveRequest_isAdmin')
const user_isAdminRouter = require('./user_isAdmin')
const overtimeRouter = require('./overtime')
const overtime_isAdminRouter = require('./overtime_isAdmin')
const shift_isAdminRouter = require('./shift_isAdmin')
const auditLogRouter = require('./auditLog')
const report_isAdminRouter = require('./report_isAdmin')
const notificationRouter = require('./notification')
const officeLocationAdminRouter = require('./officeLocationAdmin')
const profileRouter = require('./profile')
const workLocationChangeRequestRouter = require('./workLocationChangeRequest')
const workLocationChangeRequest_isAdminRouter = require('./workLocationChangeRequest_isAdmin')
const hybridScheduleRouter = require('./hybridSchedule')
const hybridSchedule_isAdminRouter = require('./hybridSchedule_isAdmin')
const payrollRouter = require('./payroll')
const payroll_isAdminRouter = require('./payroll_isAdmin')
const payrollSettings_isAdminRouter = require('./payrollSettings_isAdmin')
const webhookRouter = require('./webhook')
const companyRouter = require('./companyRoutes')

const isAdmin = require("../middlewares/authorization");
const authentication = require('../middlewares/authentication')
const tenantIdentification = require('../middlewares/tenantIdentification')
const errorHandler = require('../middlewares/errorHandler')

const rateLimit = require('express-rate-limit')
const LoginController = require('../controllers/loginController')
const RegisterController = require('../controllers/registerController')
const AuditLogger = require('../helpers/auditLogger')
const WorkScheduleAdminController = require('../controllers/workScheduleAdminController')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
})

router.post('/login', loginLimiter, LoginController.login)
router.post('/auth/refresh-token', LoginController.refreshToken)
router.post('/register', authentication, isAdmin, RegisterController.register)

// Webhooks (no authentication - called by external services)
router.use('/webhook', webhookRouter)

// Test endpoint for IP detection — development only
if (process.env.NODE_ENV !== 'production') {
  router.get('/test-ip', (req, res) => {
    res.status(200).json({
      message: 'IP Detection Test',
      sources: {
        'req.ip': req.ip,
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'connection.remoteAddress': req.connection?.remoteAddress,
        'socket.remoteAddress': req.socket?.remoteAddress,
      },
      detected: {
        ipAddress: AuditLogger.getIpAddress(req),
        userAgent: AuditLogger.getUserAgent(req)
      }
    });
  })
}

router.use(authentication)
router.use(tenantIdentification)
router.use('/companies', companyRouter)
router.use('/profile', profileRouter)
router.use('/users/admin', isAdmin, user_isAdminRouter)
router.use('/attendances/admin', isAdmin, attendance_isAdminRouter)
router.use('/attendances', attendanceRouter)
router.use('/leave-requests/admin', isAdmin, leaveRequest_isAdminRouter)
router.use('/leave-requests', leaveRequestRouter)
router.use('/overtimes/admin', isAdmin, overtime_isAdminRouter)
router.use('/overtimes', overtimeRouter)
router.use('/shifts/admin', isAdmin, shift_isAdminRouter)
router.use('/audit-logs', isAdmin, auditLogRouter)
router.use('/reports', isAdmin, report_isAdminRouter)
router.use('/notifications', notificationRouter)
router.use('/office-locations/admin', isAdmin, officeLocationAdminRouter)
router.use('/work-location-changes/admin', isAdmin, workLocationChangeRequest_isAdminRouter)
router.use('/work-location-changes', workLocationChangeRequestRouter)
router.use('/hybrid-schedules/admin', isAdmin, hybridSchedule_isAdminRouter)
router.use('/hybrid-schedules', hybridScheduleRouter)
router.use('/payroll_isAdmin', isAdmin, payroll_isAdminRouter)
router.use('/payrollSettings_isAdmin', isAdmin, payrollSettings_isAdminRouter)
router.use('/payroll', payrollRouter)

router.get('/admin/attendance-settings', isAdmin, WorkScheduleAdminController.getAttendanceSettings)
router.put('/admin/attendance-settings', isAdmin, WorkScheduleAdminController.updateAttendanceSettings)


router.use(errorHandler)

module.exports = router
