'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Shifts: add composite unique (companyId, name)
    // The old unique on name alone was removed from the model, but there may be a DB-level constraint from the original migration
    // Try to remove it safely, then add composite
    try {
      await queryInterface.removeIndex('Shifts', 'shifts_name_key');
    } catch (e) { /* index may not exist */ }
    try {
      await queryInterface.removeIndex('Shifts', 'Shifts_name_key');
    } catch (e) { /* ignore */ }
    await queryInterface.addIndex('Shifts', ['companyId', 'name'], {
      unique: true,
      name: 'shifts_company_name_unique'
    });

    // 2. Holidays: add composite unique (companyId, date)
    // Old unique on date alone may exist at DB level
    try {
      await queryInterface.removeIndex('Holidays', 'holidays_date_key');
    } catch (e) { /* index may not exist */ }
    try {
      await queryInterface.removeIndex('Holidays', 'Holidays_date_key');
    } catch (e) { /* ignore */ }
    await queryInterface.addIndex('Holidays', ['companyId', 'date'], {
      unique: true,
      name: 'holidays_company_date_unique'
    });

    // 3. TaxSettings: drop old unique (year, ptkpStatus), add (companyId, year, ptkpStatus)
    try {
      await queryInterface.removeIndex('TaxSettings', 'tax_settings_year_status_unique');
    } catch (e) { /* may not exist */ }
    await queryInterface.addIndex('TaxSettings', ['companyId', 'year', 'ptkpStatus'], {
      unique: true,
      name: 'tax_settings_company_year_status_unique'
    });

    // 4. BPJSSettings: add composite unique (companyId, type, name)
    await queryInterface.addIndex('BPJSSettings', ['companyId', 'type', 'name'], {
      unique: true,
      name: 'bpjs_settings_company_type_name_unique'
    });

    // 5. PayrollPeriods: add unique (companyId, periodStart, periodEnd) to prevent overlap
    await queryInterface.addIndex('PayrollPeriods', ['companyId', 'periodStart', 'periodEnd'], {
      unique: true,
      name: 'payroll_periods_company_range_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Shifts', 'shifts_company_name_unique');
    await queryInterface.removeIndex('Holidays', 'holidays_company_date_unique');
    try {
      await queryInterface.removeIndex('TaxSettings', 'tax_settings_company_year_status_unique');
    } catch (e) {}
    // Restore old TaxSettings unique
    await queryInterface.addIndex('TaxSettings', ['year', 'ptkpStatus'], {
      unique: true,
      name: 'tax_settings_year_status_unique'
    });
    await queryInterface.removeIndex('BPJSSettings', 'bpjs_settings_company_type_name_unique');
    await queryInterface.removeIndex('PayrollPeriods', 'payroll_periods_company_range_unique');
  }
};
