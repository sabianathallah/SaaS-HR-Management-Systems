'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'annualLeaveQuota', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 12,
      comment: 'Total annual leave quota per year (in days)'
    });

    await queryInterface.addColumn('Users', 'usedLeaveQuota', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Used leave quota for current year (in days)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'annualLeaveQuota');
    await queryInterface.removeColumn('Users', 'usedLeaveQuota');
  }
};
