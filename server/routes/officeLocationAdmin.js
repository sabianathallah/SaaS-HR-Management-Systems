const express = require('express');
const router = express.Router();
const OfficeLocationAdminController = require('../controllers/officeLocationAdminController');
const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');

/**
 * ========================================
 * OFFICE LOCATION ADMIN ROUTES
 * ========================================
 * Semua route ini memerlukan:
 * 1. Authentication (JWT token)
 * 2. Authorization (admin only)
 */

// Apply authentication & authorization middleware
router.use(authentication);
router.use(authorization);

/**
 * GET /api/admin/office-locations
 * Get all office locations (with optional filters)
 */
router.get('/', OfficeLocationAdminController.getAllLocations);

/**
 * POST /api/admin/office-locations
 * Create new office location
 */
router.post('/', OfficeLocationAdminController.createLocation);

/**
 * GET /api/admin/office-locations/:id
 * Get single office location by ID
 */
router.get('/:id', OfficeLocationAdminController.getLocationById);

/**
 * PUT /api/admin/office-locations/:id
 * Update office location
 */
router.put('/:id', OfficeLocationAdminController.updateLocation);

/**
 * DELETE /api/admin/office-locations/:id
 * Delete office location
 */
router.delete('/:id', OfficeLocationAdminController.deleteLocation);

/**
 * PATCH /api/admin/office-locations/:id/toggle
 * Toggle active/inactive status
 */
router.patch('/:id/toggle', OfficeLocationAdminController.toggleActive);

/**
 * GET /api/admin/office-locations/:id/stats
 * Get usage statistics for specific location
 */
router.get('/:id/stats', OfficeLocationAdminController.getLocationStats);

module.exports = router;
