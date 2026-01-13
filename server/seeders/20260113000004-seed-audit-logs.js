'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset sequence
    await queryInterface.sequelize.query('ALTER SEQUENCE "AuditLogs_id_seq" RESTART WITH 1;');

    await queryInterface.bulkInsert('AuditLogs', [
      {
        userId: 1, // Admin
        action: 'LOGIN',
        tableName: 'Users',
        recordId: 1,
        changes: null,
        oldData: null,
        newData: null,
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-13T08:00:00'),
        updatedAt: new Date('2026-01-13T08:00:00')
      },
      {
        userId: 2, // Budi
        action: 'LOGIN',
        tableName: 'Users',
        recordId: 2,
        changes: null,
        oldData: null,
        newData: null,
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-13T08:30:00'),
        updatedAt: new Date('2026-01-13T08:30:00')
      },
      {
        userId: 1, // Admin
        action: 'APPROVE',
        tableName: 'Overtimes',
        recordId: 1,
        changes: JSON.stringify({ status: { old: 'PENDING', new: 'APPROVED' } }),
        oldData: JSON.stringify({ status: 'PENDING' }),
        newData: JSON.stringify({ status: 'APPROVED', actualHours: 3 }),
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-10T17:00:00'),
        updatedAt: new Date('2026-01-10T17:00:00')
      },
      {
        userId: 1, // Admin
        action: 'APPROVE',
        tableName: 'LeaveRequests',
        recordId: 2,
        changes: JSON.stringify({ status: { old: 'PENDING', new: 'APPROVED' } }),
        oldData: JSON.stringify({ status: 'PENDING' }),
        newData: JSON.stringify({ status: 'APPROVED' }),
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-14T10:00:00'),
        updatedAt: new Date('2026-01-14T10:00:00')
      },
      {
        userId: 1, // Admin
        action: 'REJECT',
        tableName: 'LeaveRequests',
        recordId: 3,
        changes: JSON.stringify({ status: { old: 'PENDING', new: 'REJECTED' } }),
        oldData: JSON.stringify({ status: 'PENDING' }),
        newData: JSON.stringify({ status: 'REJECTED' }),
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-07T15:00:00'),
        updatedAt: new Date('2026-01-07T15:00:00')
      },
      {
        userId: 1, // Admin
        action: 'EXPORT',
        tableName: 'Attendances',
        recordId: null,
        changes: null,
        oldData: null,
        newData: JSON.stringify({ format: 'excel', period: 'monthly', month: 1, year: 2026 }),
        ipAddress: '::1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2026-01-12T14:00:00'),
        updatedAt: new Date('2026-01-12T14:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AuditLogs', null, {});
  }
};
