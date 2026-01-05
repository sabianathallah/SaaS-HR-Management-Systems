'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('Shifts', [
      {
        name: 'Shift Pagi',
        startTime: '07:00:00',
        endTime: '15:00:00',
        breakDuration: 60,
        lateTolerance: 15,
        overtimeThreshold: 15,
        isFlexible: false,
        description: 'Shift pagi - Jam kerja 07:00 sampai 15:00 dengan istirahat 1 jam',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Shift Siang',
        startTime: '09:00:00',
        endTime: '17:00:00',
        breakDuration: 60,
        lateTolerance: 15,
        overtimeThreshold: 15,
        isFlexible: false,
        description: 'Shift siang - Jam kerja 09:00 sampai 17:00 dengan istirahat 1 jam',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Shift Malam',
        startTime: '15:00:00',
        endTime: '23:00:00',
        breakDuration: 60,
        lateTolerance: 15,
        overtimeThreshold: 15,
        isFlexible: false,
        description: 'Shift malam - Jam kerja 15:00 sampai 23:00 dengan istirahat 1 jam',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Flexible',
        startTime: '00:00:00',
        endTime: '23:59:59',
        breakDuration: 60,
        lateTolerance: 0,
        overtimeThreshold: 60,
        isFlexible: true,
        description: 'Shift flexible - Tidak ada jam kerja tetap, tidak ada pengecekan keterlambatan',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Shifts', null, {});
  }
};
