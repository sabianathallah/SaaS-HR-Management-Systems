/**
 * Company Routes (Super Admin Only)
 */

const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const authentication = require('../middlewares/authentication');

// Middleware to check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin only.'
    });
  }
  next();
};

// All routes require authentication and super admin role
router.use(authentication);
router.use(isSuperAdmin);

// Company CRUD routes
router.get('/', CompanyController.getAllCompanies);
router.get('/stats', CompanyController.getCompanyStats);
router.get('/:id', CompanyController.getCompanyById);
router.post('/', CompanyController.createCompany);
router.put('/:id', CompanyController.updateCompany);
router.delete('/:id', CompanyController.deleteCompany);

module.exports = router;
