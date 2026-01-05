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

const isAdmin = require("../middlewares/authorization");
const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')

const LoginController = require('../controllers/loginController')
const RegisterController = require('../controllers/registerController') 


router.post('/login', LoginController.login)
router.post('/register', authentication, isAdmin, RegisterController.register)

router.use(authentication)
router.use('/users/admin', isAdmin, user_isAdminRouter)
router.use('/attendances/admin', isAdmin, attendance_isAdminRouter)
router.use('/attendances', attendanceRouter)
router.use('/leave-requests/admin', isAdmin, leaveRequest_isAdminRouter)
router.use('/leave-requests', leaveRequestRouter)
router.use('/overtimes/admin', isAdmin, overtime_isAdminRouter)
router.use('/overtimes', overtimeRouter)
router.use('/shifts/admin', isAdmin, shift_isAdminRouter)


router.use(errorHandler)

module.exports = router