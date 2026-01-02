const express = require('express')
const router = express.Router()

const attandanceRouter = require('./attendance')
const attandance_isAdminRouter = require('./attendance_isAdmin')

const isAdmin = require("../middlewares/authorization");
const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')

const LoginController = require('../controllers/loginController')
const RegisterController = require('../controllers/registerController') 


router.post('/login', LoginController.login)
router.post('/register', authentication, isAdmin, RegisterController.register)

router.use(authentication)
router.use('/attendances/admin', isAdmin, attandance_isAdminRouter)
router.use('/attendances', attandanceRouter)


router.use(errorHandler)

module.exports = router