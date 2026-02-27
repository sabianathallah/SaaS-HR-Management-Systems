'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── Payrolls table ──────────────────────────────────────────────────────
    const payrollCols = await queryInterface.describeTable('Payrolls');
    if (!payrollCols.companyId) {
      await queryInterface.addColumn('Payrolls', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    // Backfill Payrolls: derive companyId from the employee's User record
    await queryInterface.sequelize.query(`
      UPDATE "Payrolls" p
      SET "companyId" = u."companyId"
      FROM "Users" u
      WHERE p."UserId" = u.id
        AND p."companyId" IS NULL
    `);

    try {
      await queryInterface.addIndex('Payrolls', ['companyId'], {
        name: 'payrolls_company_id_idx'
      });
    } catch (e) { /* index may already exist */ }

    // ── PayrollPeriods table ────────────────────────────────────────────────
    const periodCols = await queryInterface.describeTable('PayrollPeriods');
    if (!periodCols.companyId) {
      await queryInterface.addColumn('PayrollPeriods', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    // Backfill PayrollPeriods: derive companyId from the generatedBy User record
    await queryInterface.sequelize.query(`
      UPDATE "PayrollPeriods" pp
      SET "companyId" = u."companyId"
      FROM "Users" u
      WHERE pp."generatedBy" = u.id
        AND pp."companyId" IS NULL
    `);

    try {
      await queryInterface.addIndex('PayrollPeriods', ['companyId'], {
        name: 'payroll_periods_company_id_idx'
      });
    } catch (e) { /* index may already exist */ }
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('Payrolls', 'payrolls_company_id_idx'); } catch (e) {}
    try { await queryInterface.removeIndex('PayrollPeriods', 'payroll_periods_company_id_idx'); } catch (e) {}
    try { await queryInterface.removeColumn('Payrolls', 'companyId'); } catch (e) {}
    try { await queryInterface.removeColumn('PayrollPeriods', 'companyId'); } catch (e) {}
  }
};
