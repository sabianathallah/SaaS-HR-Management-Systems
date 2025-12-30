const express = require('express')
const router = express.Router()

const attandanceRouter = require('./attandance')

const authentication = require('../middlewares/authentication')
const authorization = require('../middlewares/authorization')
const errorHandler = require('../middlewares/errorHandler')

const LoginController = require('../controllers/loginController')

router.post('/login', LoginController.login)
router.post('/register', LoginController.register)

router.use(authentication)
// router.use('/attandances', attandanceRouter)

router.use(errorHandler)

module.exports = router