'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Attendances', 'photoCheckIn', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Path/URL foto selfie saat check-in'
    });

    await queryInterface.addColumn('Attendances', 'photoCheckOut', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Path/URL foto selfie saat check-out'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Attendances', 'photoCheckIn');
    await queryInterface.removeColumn('Attendances', 'photoCheckOut');
  }
};
