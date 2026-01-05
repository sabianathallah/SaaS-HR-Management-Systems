const express = require('express');
const router = express.Router();
const ShiftAdminController = require('../controllers/shiftAdminController');
const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');

// Apply authentication to all routes
router.use(authentication);

// Apply admin authorization to all routes
router.use(authorization);

// Shift CRUD routes
router.get('/shifts', ShiftAdminController.getAllShifts);
router.get('/shifts/:id', ShiftAdminController.getShiftById);
router.post('/shifts', ShiftAdminController.createShift);
router.put('/shifts/:id', ShiftAdminController.updateShift);
router.delete('/shifts/:id', ShiftAdminController.deleteShift);

// User shift assignment routes
router.put('/users/:userId/shift', ShiftAdminController.assignShiftToUser);
router.delete('/users/:userId/shift', ShiftAdminController.removeShiftFromUser);

module.exports = router;
