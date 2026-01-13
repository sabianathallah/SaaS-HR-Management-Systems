'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset sequence
    await queryInterface.sequelize.query('ALTER SEQUENCE "LeaveRequests_id_seq" RESTART WITH 1;');

    await queryInterface.bulkInsert('LeaveRequests', [
      {
        UserId: 2, // Budi
        leaveType: 'ANNUAL_LEAVE',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        totalDays: 3,
        reason: 'Liburan keluarga',
        status: 'PENDING',
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      },
      {
        UserId: 3, // Ani
        leaveType: 'SICK_LEAVE',
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 1,
        reason: 'Demam dan flu',
        status: 'APPROVED',
        approvedBy: 1, // Admin
        approvalNote: 'Semoga cepat sembuh',
        approvalDate: new Date('2026-01-14'),
        createdAt: new Date('2026-01-13'),
        updatedAt: new Date('2026-01-14')
      },
      {
        UserId: 2, // Budi
        leaveType: 'PERMISSION',
        startDate: '2026-01-08',
        endDate: '2026-01-09',
        totalDays: 2,
        reason: 'Urusan keluarga mendadak',
        status: 'REJECTED',
        approvedBy: 1,
        approvalNote: 'Terlalu mendadak, mohon submit lebih awal next time',
        approvalDate: new Date('2026-01-07'),
        createdAt: new Date('2026-01-06'),
        updatedAt: new Date('2026-01-07')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LeaveRequests', null, {});
  }
};
