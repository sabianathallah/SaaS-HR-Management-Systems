const { BPJSSetting } = require('../models');

/**
 * BPJS Calculation Service
 * Calculates BPJS Kesehatan and Ketenagakerjaan contributions
 */
class BPJSCalculationService {
  /**
   * Calculate all BPJS contributions for an employee
   * @param {number} baseSalary - Employee's base salary
   * @param {Date} calculationDate - Date for calculation (to get active rates)
   * @returns {Promise<Object>} BPJS calculation result
   */
  static async calculateBPJS(baseSalary, calculationDate = new Date()) {
    try {
      // Get all active BPJS settings
      const bpjsSettings = await BPJSSetting.findAll({
        where: {
          isActive: true
        }
      });

      if (bpjsSettings.length === 0) {
        throw new Error('No active BPJS settings found');
      }

      const result = {
        baseSalary,
        employee: {
          kesehatan: 0,
          jht: 0,
          jp: 0,
          total: 0
        },
        company: {
          kesehatan: 0,
          jkk: 0,
          jkm: 0,
          jht: 0,
          jp: 0,
          total: 0
        },
        totalEmployee: 0,
        totalCompany: 0,
        grandTotal: 0,
        details: []
      };

      for (const setting of bpjsSettings) {
        const { type, name, employeePercentage, companyPercentage, maxSalaryBase, minSalaryBase } = setting;

        // Determine salary base for calculation
        let salaryBase = baseSalary;

        // Apply min/max limits if set
        if (minSalaryBase && salaryBase < parseFloat(minSalaryBase)) {
          salaryBase = parseFloat(minSalaryBase);
        }
        if (maxSalaryBase && salaryBase > parseFloat(maxSalaryBase)) {
          salaryBase = parseFloat(maxSalaryBase);
        }

        // Calculate employee and company portions
        const employeeContribution = salaryBase * (parseFloat(employeePercentage) / 100);
        const companyContribution = salaryBase * (parseFloat(companyPercentage) / 100);

        // Add to result based on type
        switch (type) {
          case 'kesehatan':
            result.employee.kesehatan = Math.round(employeeContribution);
            result.company.kesehatan = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jkk':
            result.company.jkk = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jkm':
            result.company.jkm = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jht':
            result.employee.jht = Math.round(employeeContribution);
            result.company.jht = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jp':
            result.employee.jp = Math.round(employeeContribution);
            result.company.jp = Math.round(companyContribution);
            break;
        }

        result.details.push({
          type,
          name,
          salaryBase: Math.round(salaryBase),
          employeePercentage: parseFloat(employeePercentage),
          companyPercentage: parseFloat(companyPercentage),
          employeeContribution: Math.round(employeeContribution),
          companyContribution: Math.round(companyContribution)
        });
      }

      // Calculate totals
      result.employee.total = Object.values(result.employee).reduce((sum, val) => 
        typeof val === 'number' ? sum + val : sum, 0);
      
      result.company.total = Object.values(result.company).reduce((sum, val) => 
        typeof val === 'number' ? sum + val : sum, 0);

      result.totalEmployee = result.employee.total;
      result.totalCompany = result.company.total;
      result.grandTotal = result.totalEmployee + result.totalCompany;

      return result;
    } catch (error) {
      console.error('Error calculating BPJS:', error);
      throw error;
    }
  }

  /**
   * Calculate BPJS Kesehatan only
   * @param {number} baseSalary - Employee's base salary
   * @returns {Promise<Object>} BPJS Kesehatan calculation
   */
  static async calculateBPJSKesehatan(baseSalary) {
    try {
      const setting = await BPJSSetting.findOne({
        where: {
          type: 'kesehatan',
          isActive: true
        }
      });

      if (!setting) {
        return {
          employee: 0,
          company: 0,
          total: 0
        };
      }

      let salaryBase = baseSalary;
      if (setting.maxSalaryBase && salaryBase > parseFloat(setting.maxSalaryBase)) {
        salaryBase = parseFloat(setting.maxSalaryBase);
      }

      const employeeContribution = salaryBase * (parseFloat(setting.employeePercentage) / 100);
      const companyContribution = salaryBase * (parseFloat(setting.companyPercentage) / 100);

      return {
        salaryBase: Math.round(salaryBase),
        employee: Math.round(employeeContribution),
        company: Math.round(companyContribution),
        total: Math.round(employeeContribution + companyContribution)
      };
    } catch (error) {
      console.error('Error calculating BPJS Kesehatan:', error);
      throw error;
    }
  }

  /**
   * Calculate BPJS Ketenagakerjaan only (JKK + JKM + JHT + JP)
   * @param {number} baseSalary - Employee's base salary
   * @returns {Promise<Object>} BPJS Ketenagakerjaan calculation
   */
  static async calculateBPJSKetenagakerjaan(baseSalary) {
    try {
      const settings = await BPJSSetting.findAll({
        where: {
          type: ['ketenagakerjaan_jkk', 'ketenagakerjaan_jkm', 'ketenagakerjaan_jht', 'ketenagakerjaan_jp'],
          isActive: true
        }
      });

      const result = {
        employee: {
          jht: 0,
          jp: 0,
          total: 0
        },
        company: {
          jkk: 0,
          jkm: 0,
          jht: 0,
          jp: 0,
          total: 0
        },
        total: 0
      };

      for (const setting of settings) {
        let salaryBase = baseSalary;
        
        if (setting.maxSalaryBase && salaryBase > parseFloat(setting.maxSalaryBase)) {
          salaryBase = parseFloat(setting.maxSalaryBase);
        }

        const employeeContribution = salaryBase * (parseFloat(setting.employeePercentage) / 100);
        const companyContribution = salaryBase * (parseFloat(setting.companyPercentage) / 100);

        switch (setting.type) {
          case 'ketenagakerjaan_jkk':
            result.company.jkk = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jkm':
            result.company.jkm = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jht':
            result.employee.jht = Math.round(employeeContribution);
            result.company.jht = Math.round(companyContribution);
            break;
          case 'ketenagakerjaan_jp':
            result.employee.jp = Math.round(employeeContribution);
            result.company.jp = Math.round(companyContribution);
            break;
        }
      }

      result.employee.total = result.employee.jht + result.employee.jp;
      result.company.total = result.company.jkk + result.company.jkm + result.company.jht + result.company.jp;
      result.total = result.employee.total + result.company.total;

      return result;
    } catch (error) {
      console.error('Error calculating BPJS Ketenagakerjaan:', error);
      throw error;
    }
  }

  /**
   * Get all active BPJS settings
   * @returns {Promise<Array>} BPJS settings
   */
  static async getBPJSSettings() {
    return await BPJSSetting.findAll({
      where: {
        isActive: true
      },
      order: [['type', 'ASC']]
    });
  }
}

module.exports = BPJSCalculationService;
