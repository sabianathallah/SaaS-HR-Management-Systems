const express = require('express')
const router = express.Router()

const attandanceRouter = require('./attandance')

const LoginController = require('../controllers/loginController')

router.post('/login', LoginController.login)
router.post('/register', LoginController.register)