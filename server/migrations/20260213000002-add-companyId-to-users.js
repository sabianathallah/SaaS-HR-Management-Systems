'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add companyId column to Users table
    await queryInterface.addColumn('Users', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null initially for migration
      references: {
        model: 'Companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add index on companyId for better query performance
    await queryInterface.addIndex('Users', ['companyId'], {
      name: 'users_company_id_index'
    });

    // Update role enum to include SUPER_ADMIN
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "role" TYPE VARCHAR(255);
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('Users', 'users_company_id_index');
    
    // Remove column
    await queryInterface.removeColumn('Users', 'companyId');
  }
};
