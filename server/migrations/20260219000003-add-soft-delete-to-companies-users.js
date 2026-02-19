'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add deletedAt to Companies
    await queryInterface.addColumn('Companies', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });

    // Add deletedAt to Users
    await queryInterface.addColumn('Users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'deletedAt');
    await queryInterface.removeColumn('Users', 'deletedAt');
  }
};
