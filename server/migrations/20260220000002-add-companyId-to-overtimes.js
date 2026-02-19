'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Overtimes');
    if (!tableDescription.companyId) {
      await queryInterface.addColumn('Overtimes', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Companies', key: 'id' }
      });
    }

    // Backfill companyId from the employee's User record
    await queryInterface.sequelize.query(`
      UPDATE "Overtimes" o
      SET "companyId" = u."companyId"
      FROM "Users" u
      WHERE o."UserId" = u.id
      AND o."companyId" IS NULL
    `);

    // Add index
    try {
      await queryInterface.addIndex('Overtimes', ['companyId'], {
        name: 'overtimes_company_id_idx'
      });
    } catch (e) { /* index may already exist */ }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('Overtimes', 'overtimes_company_id_idx');
    } catch (e) {}
    await queryInterface.removeColumn('Overtimes', 'companyId');
  }
};
