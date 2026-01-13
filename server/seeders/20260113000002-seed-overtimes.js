'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset sequence
    await queryInterface.sequelize.query('ALTER SEQUENCE "Overtimes_id_seq" RESTART WITH 1;');

    await queryInterface.bulkInsert('Overtimes', [
      {
        UserId: 2, // Budi
        overtimeDate: '2026-01-10',
        requestedHours: 3,
        actualHours: 3,
        reason: 'Menyelesaikan laporan bulanan',
        status: 'approved',
        approvedBy: 1, // Admin
        approvedAt: new Date('2026-01-10T17:00:00'),
        createdAt: new Date('2026-01-10T09:00:00'),
        updatedAt: new Date('2026-01-10T17:00:00')
      },
      {
        UserId: 3, // Ani
        overtimeDate: '2026-01-11',
        requestedHours: 2,
        actualHours: null,
        reason: 'Meeting dengan client',
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date('2026-01-11T14:00:00'),
        updatedAt: new Date('2026-01-11T14:00:00')
      },
      {
        UserId: 2, // Budi
        overtimeDate: '2026-01-05',
        requestedHours: 4,
        actualHours: null,
        reason: 'Audit tahunan',
        status: 'rejected',
        rejectionReason: 'Tidak ada kebutuhan mendesak untuk overtime',
        approvedBy: 1,
        approvedAt: new Date('2026-01-05T16:00:00'),
        createdAt: new Date('2026-01-05T13:00:00'),
        updatedAt: new Date('2026-01-05T16:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Overtimes', null, {});
  }
};
