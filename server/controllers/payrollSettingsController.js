const {
  PayrollComponent,
  EmployeeSalaryComponent,
  User,
  TaxSetting,
  TaxBracket,
  BPJSSetting
} = require('../models');
const { Op } = require('sequelize');
const AuditLogger = require('../helpers/auditLogger');

class PayrollSettingsController {
  // ==================== PAYROLL COMPONENTS ====================

  /**
   * Get all payroll components
   */
  static async getPayrollComponents(req, res, next) {
    try {
      const { type, isActive, search } = req.query;

      const where = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const components = await PayrollComponent.findAll({
        where,
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: components
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create payroll component
   */
  static async createPayrollComponent(req, res, next) {
    try {
      const {
        code,
        name,
        type,
        calculationType,
        defaultAmount,
        isMandatory,
        isSystemGenerated,
        description
      } = req.body;

      // Check if code already exists
      const existing = await PayrollComponent.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Component code already exists'
        });
      }

      const component = await PayrollComponent.create({
        code,
        name,
        type,
        calculationType,
        defaultAmount: defaultAmount || 0,
        isMandatory: isMandatory || false,
        isSystemGenerated: isSystemGenerated || false,
        description,
        isActive: true
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_component_created',
        description: `Created payroll component: ${name} (${code})`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        message: 'Payroll component created successfully',
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update payroll component
   */
  static async updatePayrollComponent(req, res, next) {
    try {
      const { componentId } = req.params;
      const updateData = req.body;

      const component = await PayrollComponent.findByPk(componentId);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Component not found'
        });
      }

      if (component.isSystemGenerated && !req.user.role.includes('SUPERADMIN')) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify system-generated components'
        });
      }

      await component.update(updateData);

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_component_updated',
        description: `Updated payroll component: ${component.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Payroll component updated successfully',
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete payroll component
   */
  static async deletePayrollComponent(req, res, next) {
    try {
      const { componentId } = req.params;

      const component = await PayrollComponent.findByPk(componentId);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Component not found'
        });
      }

      if (component.isSystemGenerated) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete system-generated components'
        });
      }

      await component.destroy();

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'payroll_component_deleted',
        description: `Deleted payroll component: ${component.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Payroll component deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== EMPLOYEE SALARY COMPONENTS ====================

  /**
   * Get employee's salary components
   */
  static async getEmployeeSalaryComponents(req, res, next) {
    try {
      const { employeeId } = req.params;

      const components = await EmployeeSalaryComponent.findAll({
        where: {
          UserId: employeeId,
          isActive: true
        },
        include: [
          {
            model: PayrollComponent,
            as: 'component',
            where: { isActive: true }
          }
        ],
        order: [[{ model: PayrollComponent, as: 'component' }, 'type', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: components
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign component to employee
   */
  static async assignComponentToEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { componentId, amount, effectiveDate, endDate, notes } = req.body;

      // Check if employee exists
      const employee = await User.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Check if component exists
      const component = await PayrollComponent.findByPk(componentId);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Component not found'
        });
      }

      // Check if already assigned
      const existing = await EmployeeSalaryComponent.findOne({
        where: {
          UserId: employeeId,
          PayrollComponentId: componentId,
          isActive: true
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Component already assigned to this employee'
        });
      }

      const salaryComponent = await EmployeeSalaryComponent.create({
        UserId: employeeId,
        PayrollComponentId: componentId,
        amount,
        effectiveDate: effectiveDate || new Date(),
        endDate,
        notes,
        isActive: true
      });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'employee_salary_component_assigned',
        description: `Assigned ${component.name} to ${employee.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        message: 'Component assigned successfully',
        data: salaryComponent
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update employee's salary component
   */
  static async updateEmployeeSalaryComponent(req, res, next) {
    try {
      const { salaryComponentId } = req.params;
      const updateData = req.body;

      const salaryComponent = await EmployeeSalaryComponent.findByPk(salaryComponentId);
      if (!salaryComponent) {
        return res.status(404).json({
          success: false,
          message: 'Salary component not found'
        });
      }

      await salaryComponent.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Salary component updated successfully',
        data: salaryComponent
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove component from employee
   */
  static async removeComponentFromEmployee(req, res, next) {
    try {
      const { salaryComponentId } = req.params;

      const salaryComponent = await EmployeeSalaryComponent.findByPk(salaryComponentId, {
        include: [
          { model: User, as: 'employee', attributes: ['name'] },
          { model: PayrollComponent, as: 'component', attributes: ['name'] }
        ]
      });

      if (!salaryComponent) {
        return res.status(404).json({
          success: false,
          message: 'Salary component not found'
        });
      }

      await salaryComponent.update({ isActive: false, endDate: new Date() });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'employee_salary_component_removed',
        description: `Removed ${salaryComponent.component?.name} from ${salaryComponent.employee?.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Component removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update employee base salary
   */
  static async updateEmployeeBaseSalary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { baseSalary, notes } = req.body;

      const employee = await User.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      const oldSalary = employee.baseSalary;
      await employee.update({ baseSalary });

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'employee_salary_updated',
        description: `Updated ${employee.name}'s base salary from ${oldSalary} to ${baseSalary}. ${notes || ''}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Base salary updated successfully',
        data: {
          employeeId: employee.id,
          employeeName: employee.name,
          oldSalary,
          newSalary: baseSalary
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TAX SETTINGS ====================

  /**
   * Get tax settings
   */
  static async getTaxSettings(req, res, next) {
    try {
      const { year } = req.query;
      const currentYear = year || new Date().getFullYear();

      const ptkpSettings = await TaxSetting.findAll({
        where: {
          year: currentYear,
          isActive: true
        },
        order: [['ptkpStatus', 'ASC']]
      });

      const taxBrackets = await TaxBracket.findAll({
        where: {
          year: currentYear,
          isActive: true
        },
        order: [['bracketLevel', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: {
          year: currentYear,
          ptkpSettings,
          taxBrackets
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update tax settings
   */
  static async updateTaxSettings(req, res, next) {
    try {
      const { ptkpSettings, taxBrackets } = req.body;
      const year = req.body.year || new Date().getFullYear();

      // Update PTKP settings
      if (ptkpSettings && Array.isArray(ptkpSettings)) {
        for (const ptkp of ptkpSettings) {
          await TaxSetting.upsert({
            year,
            ptkpStatus: ptkp.ptkpStatus,
            ptkpAmount: ptkp.ptkpAmount,
            description: ptkp.description,
            isActive: true
          });
        }
      }

      // Update tax brackets
      if (taxBrackets && Array.isArray(taxBrackets)) {
        for (const bracket of taxBrackets) {
          await TaxBracket.upsert({
            year,
            bracketLevel: bracket.bracketLevel,
            minIncome: bracket.minIncome,
            maxIncome: bracket.maxIncome,
            taxRate: bracket.taxRate,
            isActive: true
          });
        }
      }

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'tax_settings_updated',
        description: `Updated tax settings for year ${year}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Tax settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== BPJS SETTINGS ====================

  /**
   * Get BPJS settings
   */
  static async getBPJSSettings(req, res, next) {
    try {
      const settings = await BPJSSetting.findAll({
        where: { isActive: true },
        order: [['type', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update BPJS settings
   */
  static async updateBPJSSettings(req, res, next) {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings)) {
        return res.status(400).json({
          success: false,
          message: 'Settings must be an array'
        });
      }

      for (const setting of settings) {
        if (setting.id) {
          await BPJSSetting.update(setting, {
            where: { id: setting.id }
          });
        }
      }

      // Log audit
      await AuditLogger.log({
        userId: req.user.id,
        action: 'bpjs_settings_updated',
        description: 'Updated BPJS settings',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'BPJS settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PayrollSettingsController;
