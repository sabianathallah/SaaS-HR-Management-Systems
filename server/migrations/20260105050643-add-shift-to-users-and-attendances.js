'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add ShiftId to Users table
    await queryInterface.addColumn('Users', 'ShiftId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Shifts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Shift default untuk user ini'
    });

    // Add ShiftId to Attendances table
    await queryInterface.addColumn('Attendances', 'ShiftId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Shifts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Shift yang dipakai untuk attendance ini (bisa override shift user)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Attendances', 'ShiftId');
    await queryInterface.removeColumn('Users', 'ShiftId');
  }
};
