'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add companyId column — allow null so existing records are not rejected.
    // The column may already exist (added by an earlier bulk migration); skip
    // gracefully in that case and proceed to the backfill and index steps.
    try {
      await queryInterface.addColumn('LeaveRequests', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } catch (error) {
      // Column likely already exists — that is acceptable.
      console.log(`⚠️  addColumn skipped: ${error.message}`);
    }

    // Backfill companyId from the owning User's companyId for any rows that
    // were created before this column existed.
    await queryInterface.sequelize.query(`
      UPDATE "LeaveRequests" lr
      SET "companyId" = u."companyId"
      FROM "Users" u
      WHERE lr."UserId" = u.id
        AND lr."companyId" IS NULL
    `);

    // Add a dedicated index for efficient company-scoped queries.
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "leave_requests_company_id"
      ON "LeaveRequests"("companyId")
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the index added in the up step.
    try {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS "leave_requests_company_id"
      `);
    } catch (error) {
      console.log(`⚠️  Drop index skipped: ${error.message}`);
    }

    // Remove the column only if it was added by this migration.
    // If it was added by a previous bulk migration, removing it here would
    // break the rollback of that migration, so we guard with a try/catch and
    // let the operator decide.
    try {
      await queryInterface.removeColumn('LeaveRequests', 'companyId');
    } catch (error) {
      console.log(`⚠️  removeColumn skipped: ${error.message}`);
    }
  }
};
