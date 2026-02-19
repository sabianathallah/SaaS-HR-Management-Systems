'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('WorkSchedules', 'allowLateClockIn', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    await queryInterface.addColumn('WorkSchedules', 'requirePhoto', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    await queryInterface.addColumn('WorkSchedules', 'requireGPS', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('WorkSchedules', 'allowLateClockIn');
    await queryInterface.removeColumn('WorkSchedules', 'requirePhoto');
    await queryInterface.removeColumn('WorkSchedules', 'requireGPS');
  }
};
