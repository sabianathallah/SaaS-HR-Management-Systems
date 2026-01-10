const express = require('express')
const router = express.Router()
const ProfileController = require('../controllers/profileController')

// Get user profile
router.get('/', ProfileController.getProfile)

// Update profile
router.put('/', ProfileController.updateProfile)

// Change password
router.put('/change-password', ProfileController.changePassword)

module.exports = router
