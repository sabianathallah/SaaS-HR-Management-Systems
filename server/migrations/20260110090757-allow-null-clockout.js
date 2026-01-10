'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Ubah kolom clockOut menjadi nullable
    await queryInterface.changeColumn('Attendances', 'clockOut', {
      type: Sequelize.DATE,
      allowNull: true  // Sekarang boleh NULL
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback: kembalikan ke NOT NULL
    await queryInterface.changeColumn('Attendances', 'clockOut', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
