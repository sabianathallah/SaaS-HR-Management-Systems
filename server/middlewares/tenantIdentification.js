/**
 * Tenant Identification Middleware
 * Identifies and attaches company information to the request
 * Based on authenticated user's companyId
 */

const { Company, User } = require('../models');

const tenantIdentification = async (req, res, next) => {
  try {
    // Skip for super admin routes or if no user is authenticated
    if (!req.user) {
      return next();
    }

    // If user is SUPER_ADMIN, they can access all companies
    if (req.user.role === 'SUPER_ADMIN') {
      req.isSuperAdmin = true;
      req.companyId = req.query.companyId || req.body.companyId || null;
      
      if (req.companyId) {
        const company = await Company.findByPk(req.companyId);
        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'Company not found'
          });
        }
        req.company = company;
      }
      
      return next();
    }

    // For non-super admin users, get company from user record
    if (!req.user.companyId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any company'
      });
    }

    // Fetch full user data with company
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Company,
        as: 'company',
        required: true
      }]
    });

    if (!user || !user.company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found or user not associated with company'
      });
    }

    // Check if company is active
    if (user.company.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Company is ${user.company.status}. Please contact support.`
      });
    }

    // Check subscription expiry (if applicable)
    if (user.company.subscriptionExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.company.subscriptionExpiresAt);
      
      if (now > expiryDate) {
        return res.status(403).json({
          success: false,
          message: 'Company subscription has expired. Please renew to continue.'
        });
      }
    }

    // Attach company info to request
    req.company = user.company;
    req.companyId = user.company.id;
    req.isSuperAdmin = false;

    next();
  } catch (error) {
    console.error('Tenant Identification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error identifying tenant',
      error: error.message
    });
  }
};

module.exports = tenantIdentification;
