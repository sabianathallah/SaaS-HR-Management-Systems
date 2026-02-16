/**
 * Tenant Isolation Middleware
 * Ensures all database queries are automatically filtered by companyId
 * Prevents data leakage between companies
 */

const tenantIsolation = {
  /**
   * Add companyId filter to where clause
   * @param {Object} whereClause - Sequelize where clause
   * @param {Object} req - Express request object
   * @returns {Object} - Modified where clause with companyId
   */
  addCompanyFilter(whereClause = {}, req) {
    // Super admin can query any company or all companies
    if (req.isSuperAdmin) {
      // If companyId is specified in request, use it
      if (req.companyId) {
        return {
          ...whereClause,
          companyId: req.companyId
        };
      }
      // Otherwise, don't add filter (super admin sees all)
      return whereClause;
    }

    // For regular users, always filter by their company
    if (req.companyId) {
      return {
        ...whereClause,
        companyId: req.companyId
      };
    }

    // If no companyId, return original (this shouldn't happen if tenantIdentification middleware runs first)
    return whereClause;
  },

  /**
   * Add companyId to data being created/updated
   * @param {Object} data - Data to be inserted/updated
   * @param {Object} req - Express request object
   * @returns {Object} - Data with companyId
   */
  addCompanyToData(data = {}, req) {
    // Don't add companyId for super admin unless explicitly specified
    if (req.isSuperAdmin && !req.companyId) {
      return data;
    }

    // Add companyId if it exists
    if (req.companyId) {
      return {
        ...data,
        companyId: req.companyId
      };
    }

    return data;
  },

  /**
   * Validate that user has access to the specified resource
   * @param {Object} resource - Database record to check
   * @param {Object} req - Express request object
   * @param {String} resourceName - Name of resource for error message
   * @throws {Error} - If user doesn't have access
   */
  validateAccess(resource, req, resourceName = 'Resource') {
    if (!resource) {
      const error = new Error(`${resourceName} not found`);
      error.status = 404;
      throw error;
    }

    // Super admin has access to everything
    if (req.isSuperAdmin) {
      return true;
    }

    // Check if resource belongs to user's company
    if (resource.companyId && resource.companyId !== req.companyId) {
      const error = new Error(`You don't have access to this ${resourceName.toLowerCase()}`);
      error.status = 403;
      throw error;
    }

    return true;
  },

  /**
   * Express middleware to enforce tenant isolation on routes
   * Should be used after authentication and tenantIdentification middlewares
   */
  enforce() {
    return (req, res, next) => {
      // Skip for super admin
      if (req.isSuperAdmin) {
        return next();
      }

      // Ensure companyId exists for non-super admin
      if (!req.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Company context required'
        });
      }

      next();
    };
  }
};

module.exports = tenantIsolation;
