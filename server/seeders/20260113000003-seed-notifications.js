'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset sequence
    await queryInterface.sequelize.query('ALTER SEQUENCE "Notifications_id_seq" RESTART WITH 1;');

    await queryInterface.bulkInsert('Notifications', [
      {
        UserId: 2, // Budi
        type: 'OVERTIME_APPROVED',
        title: '✅ Overtime Request Approved',
        message: 'Your overtime request for 2026-01-10 has been approved. Approved hours: 3 hours.',
        metadata: JSON.stringify({
          overtimeId: 1,
          overtimeDate: '2026-01-10',
          requestedHours: 3,
          actualHours: 3
        }),
        isRead: true,
        createdAt: new Date('2026-01-10T17:00:00'),
        updatedAt: new Date('2026-01-11T08:00:00')
      },
      {
        UserId: 3, // Ani
        type: 'LEAVE_APPROVED',
        title: '✅ Leave Request Approved',
        message: 'Your sick leave request from 2026-01-15 to 2026-01-15 has been approved.\n\n📝 Note: Semoga cepat sembuh',
        metadata: JSON.stringify({
          leaveRequestId: 2,
          leaveType: 'SICK_LEAVE',
          startDate: '2026-01-15',
          endDate: '2026-01-15',
          totalDays: 1
        }),
        isRead: false,
        createdAt: new Date('2026-01-14T10:00:00'),
        updatedAt: new Date('2026-01-14T10:00:00')
      },
      {
        UserId: 2, // Budi
        type: 'LEAVE_REJECTED',
        title: '❌ Leave Request Rejected',
        message: 'Your permission leave request from 2026-01-08 to 2026-01-09 has been rejected.\n\n📝 Reason: Terlalu mendadak, mohon submit lebih awal next time',
        metadata: JSON.stringify({
          leaveRequestId: 3,
          leaveType: 'PERMISSION',
          startDate: '2026-01-08',
          endDate: '2026-01-09',
          totalDays: 2
        }),
        isRead: true,
        createdAt: new Date('2026-01-07T15:00:00'),
        updatedAt: new Date('2026-01-08T09:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notifications', null, {});
  }
};
