'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    
    await queryInterface.addColumn('Users', 'joinDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'leaveDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'isActive');
    await queryInterface.removeColumn('Users', 'joinDate');
    await queryInterface.removeColumn('Users', 'leaveDate');
  }
};
