'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'Attendances',
      'LeaveRequests',
      'Overtimes',
      'Shifts',
      'WorkSchedules',
      'Holidays',
      'office_locations', // snake_case
      'Notifications',
      'AuditLogs',
      'WorkLocationChangeRequests',
      'HybridSchedules',
      'PayrollComponents',
      'EmployeeSalaryComponents',
      'PayrollPeriods',
      'Payrolls',
      'PayrollDetails',
      'PayrollAdjustments',
      'PayrollHistories',
      'TaxSettings',
      'BPJSSettings'
    ];

    for (const table of tables) {
      try {
        // Add companyId column
        await queryInterface.addColumn(table, 'companyId', {
          type: Sequelize.INTEGER,
          allowNull: true, // Allow null initially for migration
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });

        // Add index for better performance
        await queryInterface.addIndex(table, ['companyId'], {
          name: `${table.toLowerCase()}_company_id_index`
        });

        console.log(`✅ Added companyId to ${table}`);
      } catch (error) {
        console.log(`⚠️  Skipped ${table}: ${error.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'Attendances',
      'LeaveRequests',
      'Overtimes',
      'Shifts',
      'WorkSchedules',
      'Holidays',
      'office_locations',
      'Notifications',
      'AuditLogs',
      'WorkLocationChangeRequests',
      'HybridSchedules',
      'PayrollComponents',
      'EmployeeSalaryComponents',
      'PayrollPeriods',
      'Payrolls',
      'PayrollDetails',
      'PayrollAdjustments',
      'PayrollHistories',
      'TaxSettings',
      'BPJSSettings'
    ];

    for (const table of tables) {
      try {
        await queryInterface.removeIndex(table, `${table.toLowerCase()}_company_id_index`);
        await queryInterface.removeColumn(table, 'companyId');
      } catch (error) {
        console.log(`⚠️  Skipped ${table}: ${error.message}`);
      }
    }
  }
};
