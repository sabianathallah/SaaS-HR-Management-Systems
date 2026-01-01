'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('WorkSchedules', [{
      workStartTime: '09:00',
      workEndTime: '17:00',
      autoAbsentTime: '18:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('WorkSchedules', null, {});
  }
};
