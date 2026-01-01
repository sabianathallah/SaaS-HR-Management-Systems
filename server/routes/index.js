const express = require('express')
const router = express.Router()

const attandanceRouter = require('./attendance')

const isAdmin = require("../middlewares/authorization");
const authentication = require('../middlewares/authentication')
const errorHandler = require('../middlewares/errorHandler')

const LoginController = require('../controllers/loginController')


router.post('/login', LoginController.login)
router.post('/register', authentication, isAdmin, LoginController.register)

router.use(authentication)
router.use('/attendances', attandanceRouter)

router.use(errorHandler)

module.exports = router