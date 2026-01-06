'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Bisa null untuk system-generated actions
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'),
        allowNull: false
      },
      tableName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nama tabel yang diubah (Users, Attendances, LeaveRequests, dll)'
      },
      recordId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID record yang diubah'
      },
      oldData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Data sebelum perubahan (untuk UPDATE & DELETE)'
      },
      newData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Data sesudah perubahan (untuk CREATE & UPDATE)'
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Summary perubahan field mana saja yang berubah'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'IP address user yang melakukan aksi'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Browser/device info'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Deskripsi tambahan untuk aksi tertentu'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('AuditLogs', ['userId']);
    await queryInterface.addIndex('AuditLogs', ['tableName']);
    await queryInterface.addIndex('AuditLogs', ['recordId']);
    await queryInterface.addIndex('AuditLogs', ['action']);
    await queryInterface.addIndex('AuditLogs', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuditLogs');
  }
};
