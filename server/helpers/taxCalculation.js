const { TaxSetting, TaxBracket } = require('../models');

/**
 * Tax Calculation Service
 * Calculates PPh21 (Indonesian Income Tax) based on progressive tax brackets
 */
class TaxCalculationService {
  /**
   * Calculate PPh21 for an employee
   * @param {number} grossSalaryMonthly - Monthly gross salary
   * @param {string} maritalStatus - 'single' or 'married'
   * @param {number} numberOfDependents - Number of dependents (0-3)
   * @param {number} year - Tax year
   * @returns {Promise<Object>} Tax calculation result
   */
  static async calculatePPh21(grossSalaryMonthly, maritalStatus, numberOfDependents = 0, year = new Date().getFullYear()) {
    try {
      // Step 1: Calculate yearly gross income
      const yearlyGrossIncome = grossSalaryMonthly * 12;

      // Step 2: Get PTKP (Penghasilan Tidak Kena Pajak)
      const ptkpStatus = this.determinePTKPStatus(maritalStatus, numberOfDependents);
      const ptkpData = await TaxSetting.findOne({
        where: {
          year,
          ptkpStatus,
          isActive: true
        }
      });

      if (!ptkpData) {
        // If no data found, use default TK0
        const defaultPTKP = await TaxSetting.findOne({
          where: {
            year,
            ptkpStatus: 'TK0',
            isActive: true
          }
        });
        
        if (!defaultPTKP) {
          throw new Error(`Tax settings for year ${year} not found`);
        }
        
        var ptkpAmount = parseFloat(defaultPTKP.ptkpAmount);
      } else {
        var ptkpAmount = parseFloat(ptkpData.ptkpAmount);
      }

      // Step 3: Calculate taxable income (PKP)
      const pkp = Math.max(0, yearlyGrossIncome - ptkpAmount);

      // Step 4: Calculate tax based on progressive brackets
      const taxBrackets = await TaxBracket.findAll({
        where: {
          year,
          isActive: true
        },
        order: [['bracketLevel', 'ASC']]
      });

      let totalTax = 0;
      let remainingIncome = pkp;
      const bracketDetails = [];

      for (const bracket of taxBrackets) {
        if (remainingIncome <= 0) break;

        const minIncome = parseFloat(bracket.minIncome);
        const maxIncome = bracket.maxIncome ? parseFloat(bracket.maxIncome) : null;
        const taxRate = parseFloat(bracket.taxRate);

        let taxableInThisBracket = 0;

        if (maxIncome === null) {
          // Unlimited bracket (last bracket)
          taxableInThisBracket = remainingIncome;
        } else {
          const bracketRange = maxIncome - minIncome;
          taxableInThisBracket = Math.min(remainingIncome, bracketRange);
        }

        const taxInThisBracket = taxableInThisBracket * (taxRate / 100);
        totalTax += taxInThisBracket;

        bracketDetails.push({
          bracketLevel: bracket.bracketLevel,
          taxableAmount: taxableInThisBracket,
          taxRate: taxRate,
          taxAmount: taxInThisBracket
        });

        remainingIncome -= taxableInThisBracket;
      }

      // Monthly tax
      const monthlyTax = totalTax / 12;

      return {
        grossSalaryMonthly,
        yearlyGrossIncome,
        ptkpStatus,
        ptkpAmount,
        pkp,
        yearlyTax: Math.round(totalTax),
        monthlyTax: Math.round(monthlyTax),
        bracketDetails,
        effectiveTaxRate: pkp > 0 ? ((totalTax / yearlyGrossIncome) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error calculating PPh21:', error);
      throw error;
    }
  }

  /**
   * Determine PTKP status based on marital status and dependents
   * @param {string} maritalStatus - 'single', 'married', 'divorced', 'widowed'
   * @param {number} numberOfDependents - Number of dependents (0-3+)
   * @returns {string} PTKP status code
   */
  static determinePTKPStatus(maritalStatus, numberOfDependents) {
    // Limit dependents to max 3
    const dependents = Math.min(numberOfDependents, 3);

    // Married or widowed = K (Kawin)
    // Single or divorced = TK (Tidak Kawin)
    const isMarried = maritalStatus === 'married' || maritalStatus === 'widowed';
    const prefix = isMarried ? 'K' : 'TK';

    return `${prefix}${dependents}`;
  }

  /**
   * Calculate tax for THR (Tunjangan Hari Raya)
   * THR has special tax calculation in Indonesia
   * @param {number} thrAmount - THR amount
   * @param {number} regularSalary - Regular monthly salary
   * @param {string} maritalStatus - Marital status
   * @param {number} numberOfDependents - Number of dependents
   * @param {number} year - Tax year
   * @returns {Promise<Object>} THR tax calculation
   */
  static async calculateTHRTax(thrAmount, regularSalary, maritalStatus, numberOfDependents, year = new Date().getFullYear()) {
    try {
      // For THR, tax is calculated on (THR + salary) then subtract regular salary tax
      const combinedIncome = thrAmount + regularSalary;
      
      const combinedTax = await this.calculatePPh21(combinedIncome, maritalStatus, numberOfDependents, year);
      const regularTax = await this.calculatePPh21(regularSalary, maritalStatus, numberOfDependents, year);
      
      const thrTax = Math.max(0, combinedTax.monthlyTax - regularTax.monthlyTax);

      return {
        thrAmount,
        thrTax: Math.round(thrTax),
        thrNetAmount: Math.round(thrAmount - thrTax)
      };
    } catch (error) {
      console.error('Error calculating THR tax:', error);
      throw error;
    }
  }

  /**
   * Get all active tax brackets for a year
   * @param {number} year - Tax year
   * @returns {Promise<Array>} Tax brackets
   */
  static async getTaxBrackets(year = new Date().getFullYear()) {
    return await TaxBracket.findAll({
      where: {
        year,
        isActive: true
      },
      order: [['bracketLevel', 'ASC']]
    });
  }

  /**
   * Get all active PTKP settings for a year
   * @param {number} year - Tax year
   * @returns {Promise<Array>} PTKP settings
   */
  static async getPTKPSettings(year = new Date().getFullYear()) {
    return await TaxSetting.findAll({
      where: {
        year,
        isActive: true
      },
      order: [['ptkpStatus', 'ASC']]
    });
  }
}

module.exports = TaxCalculationService;
