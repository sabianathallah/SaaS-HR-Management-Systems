/**
 * Company Controller
 * Handles company management for Super Admin
 */

const { Company, User, sequelize } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { Op } = require('sequelize');

class CompanyController {
  /**
   * Get all companies (Super Admin only)
   */
  static async getAllCompanies(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;

      const whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Status filter
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: companies } = await Company.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        include: [{
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role'],
          where: { role: 'COMPANY_ADMIN' },
          required: false
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: {
          companies,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get All Companies Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve companies',
        error: error.message
      });
    }
  }

  /**
   * Get company by ID
   */
  static async getCompanyById(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id, {
        include: [{
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'position', 'department', 'isActive']
        }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Get statistics
      const stats = {
        totalEmployees: await User.count({ where: { companyId: id, role: 'EMPLOYEE' } }),
        activeEmployees: await User.count({ where: { companyId: id, role: 'EMPLOYEE', isActive: true } }),
        admins: await User.count({ where: { companyId: id, role: 'COMPANY_ADMIN' } })
      };

      res.status(200).json({
        success: true,
        message: 'Company retrieved successfully',
        data: {
          company,
          stats
        }
      });
    } catch (error) {
      console.error('Get Company Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve company',
        error: error.message
      });
    }
  }

  /**
   * Create new company with admin user
   */
  static async createCompany(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        // Company data
        name,
        slug,
        logo,
        address,
        phoneNumber,
        email,
        website,
        taxIdentificationNumber,
        industry,
        subscriptionPlan,
        subscriptionExpiresAt,
        settings,
        
        // Admin user data
        adminName,
        adminEmail,
        adminPassword,
        adminPhoneNumber
      } = req.body;

      // Validate required fields
      if (!name || !slug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Company name and slug are required'
        });
      }

      if (!adminName || !adminEmail || !adminPassword) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Admin name, email, and password are required'
        });
      }

      // Check if slug already exists
      const existingCompany = await Company.findOne({ where: { slug } });
      if (existingCompany) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Company slug already exists'
        });
      }

      // Check if admin email already exists
      const existingUser = await User.findOne({ where: { email: adminEmail } });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Admin email already exists'
        });
      }

      // Create company
      const company = await Company.create({
        name,
        slug: slug.toLowerCase(),
        logo,
        address,
        phoneNumber,
        email,
        website,
        taxIdentificationNumber,
        industry,
        employeeCount: 1, // Start with 1 (the admin)
        status: 'active',
        subscriptionPlan: subscriptionPlan || 'basic',
        subscriptionExpiresAt,
        settings: settings || {}
      }, { transaction });

      // Create admin user for the company
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phoneNumber: adminPhoneNumber,
        role: 'COMPANY_ADMIN',
        companyId: company.id,
        isActive: true,
        annualLeaveQuota: 12,
        usedLeaveQuota: 0
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Company and admin user created successfully',
        data: {
          company,
          adminUser: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create Company Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create company',
        error: error.message
      });
    }
  }

  /**
   * Update company
   */
  static async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        logo,
        address,
        phoneNumber,
        email,
        website,
        taxIdentificationNumber,
        industry,
        status,
        subscriptionPlan,
        subscriptionExpiresAt,
        settings
      } = req.body;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Update company (slug cannot be changed)
      await company.update({
        name: name || company.name,
        logo: logo !== undefined ? logo : company.logo,
        address: address !== undefined ? address : company.address,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : company.phoneNumber,
        email: email !== undefined ? email : company.email,
        website: website !== undefined ? website : company.website,
        taxIdentificationNumber: taxIdentificationNumber !== undefined ? taxIdentificationNumber : company.taxIdentificationNumber,
        industry: industry !== undefined ? industry : company.industry,
        status: status || company.status,
        subscriptionPlan: subscriptionPlan || company.subscriptionPlan,
        subscriptionExpiresAt: subscriptionExpiresAt !== undefined ? subscriptionExpiresAt : company.subscriptionExpiresAt,
        settings: settings || company.settings
      });

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: company
      });
    } catch (error) {
      console.error('Update Company Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company',
        error: error.message
      });
    }
  }

  /**
   * Delete company (soft delete by setting status to inactive)
   */
  static async deleteCompany(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Soft delete by setting status to inactive
      await company.update({ status: 'inactive' });

      res.status(200).json({
        success: true,
        message: 'Company deactivated successfully',
        data: company
      });
    } catch (error) {
      console.error('Delete Company Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete company',
        error: error.message
      });
    }
  }

  /**
   * Get company statistics
   */
  static async getCompanyStats(req, res) {
    try {
      const totalCompanies = await Company.count();
      const activeCompanies = await Company.count({ where: { status: 'active' } });
      const suspendedCompanies = await Company.count({ where: { status: 'suspended' } });
      const inactiveCompanies = await Company.count({ where: { status: 'inactive' } });

      const totalUsers = await User.count({ where: { role: { [Op.ne]: 'SUPER_ADMIN' } } });
      const totalEmployees = await User.count({ where: { role: 'EMPLOYEE' } });
      const totalCompanyAdmins = await User.count({ where: { role: 'COMPANY_ADMIN' } });

      res.status(200).json({
        success: true,
        message: 'Company statistics retrieved successfully',
        data: {
          companies: {
            total: totalCompanies,
            active: activeCompanies,
            suspended: suspendedCompanies,
            inactive: inactiveCompanies
          },
          users: {
            total: totalUsers,
            employees: totalEmployees,
            companyAdmins: totalCompanyAdmins
          }
        }
      });
    } catch (error) {
      console.error('Get Company Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error: error.message
      });
    }
  }
}

module.exports = CompanyController;
