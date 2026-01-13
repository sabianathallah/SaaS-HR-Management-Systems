'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // For PostgreSQL: Need to handle ENUM type changes carefully
    
    // Step 1: Remove default value temporarily
    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" DROP DEFAULT;`
    );

    // Step 2: Change column type to VARCHAR temporarily
    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" TYPE VARCHAR(50) USING status::VARCHAR;`
    );

    // Step 3: Drop old ENUM type if exists
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_Attendances_status";`
    );

    // Step 4: Create new ENUM type with all statuses
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Attendances_status" AS ENUM (
        'ON_PROGRESS',
        'ON_TIME',
        'LATE',
        'ABSENT',
        'LEAVE',
        'SICK_LEAVE',
        'PERMISSION',
        'HOLIDAY'
      );
    `);

    // Step 5: Change column back to ENUM type
    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" TYPE "enum_Attendances_status" USING status::"enum_Attendances_status";`
    );

    // Step 6: Set default value back
    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" SET DEFAULT 'ON_PROGRESS'::"enum_Attendances_status";`
    );
  },

  async down (queryInterface, Sequelize) {
    // Revert changes (similar process)
    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" DROP DEFAULT;`
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" TYPE VARCHAR(50) USING status::VARCHAR;`
    );

    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_Attendances_status";`
    );

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Attendances_status" AS ENUM (
        'ON_PROGRESS',
        'ON_TIME',
        'LATE',
        'ABSENT',
        'LEAVE',
        'SICK_LEAVE',
        'PERMISSION',
        'HOLIDAY'
      );
    `);

    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" TYPE "enum_Attendances_status" USING status::"enum_Attendances_status";`
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE "Attendances" ALTER COLUMN "status" SET DEFAULT 'ON_PROGRESS'::"enum_Attendances_status";`
    );
  }
};
