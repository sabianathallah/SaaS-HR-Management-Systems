'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update the enum type to include 'EXPORT'
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_AuditLogs_action" ADD VALUE IF NOT EXISTS 'EXPORT';
    `);
  },

  async down (queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // If you need to revert, you would need to:
    // 1. Create a new enum without 'EXPORT'
    // 2. Alter the column to use the new enum
    // 3. Drop the old enum
    // This is complex, so we'll leave this empty for now
    console.log('Reverting this migration requires manual intervention');
  }
};
