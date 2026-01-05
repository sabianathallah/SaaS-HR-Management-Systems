const express = require('express');
const router = express.Router();
const UserAdminController = require('../controllers/userAdminController');

// Get all users
router.get('/', UserAdminController.getAllUsers);

// Get user detail
router.get('/:id', UserAdminController.getUserDetail);

// Edit user data
router.put('/:id', UserAdminController.editUser);

// Toggle user active/inactive status
router.patch('/:id/status', UserAdminController.toggleUserStatus);

// Update employment dates (join date & leave date)
router.patch('/:id/employment-dates', UserAdminController.updateEmploymentDates);

module.exports = router;
