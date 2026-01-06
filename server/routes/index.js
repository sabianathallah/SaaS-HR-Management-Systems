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

const isAdmin = require("../middlewares/authorization");
const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')

const LoginController = require('../controllers/loginController')
const RegisterController = require('../controllers/registerController')
const AuditLogger = require('../helpers/auditLogger')


router.post('/login', LoginController.login)
router.post('/register', authentication, isAdmin, RegisterController.register)

// 🧪 Test endpoint untuk verify IP detection (dapat dihapus di production)
router.get('/test-ip', (req, res) => {
  res.status(200).json({
    message: 'IP Detection Test',
    sources: {
      'req.ip': req.ip,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'connection.remoteAddress': req.connection?.remoteAddress,
      'socket.remoteAddress': req.socket?.remoteAddress,
      'all-headers': req.headers
    },
    detected: {
      ipAddress: AuditLogger.getIpAddress(req),
      userAgent: AuditLogger.getUserAgent(req)
    },
    note: 'This endpoint can be removed in production'
  });
})

router.use(authentication)
router.use('/users/admin', isAdmin, user_isAdminRouter)
router.use('/attendances/admin', isAdmin, attendance_isAdminRouter)
router.use('/attendances', attendanceRouter)
router.use('/leave-requests/admin', isAdmin, leaveRequest_isAdminRouter)
router.use('/leave-requests', leaveRequestRouter)
router.use('/overtimes/admin', isAdmin, overtime_isAdminRouter)
router.use('/overtimes', overtimeRouter)
router.use('/shifts/admin', isAdmin, shift_isAdminRouter)
router.use('/audit-logs', isAdmin, auditLogRouter)


router.use(errorHandler)

module.exports = router