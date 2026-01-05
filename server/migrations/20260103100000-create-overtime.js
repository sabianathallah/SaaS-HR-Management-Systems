'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Overtimes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      AttendanceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Attandances',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      overtimeDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      clockIn: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Waktu mulai lembur (dari attendance.clockOut)'
      },
      clockOut: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Waktu selesai lembur'
      },
      requestedHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Jam lembur yang diajukan oleh employee'
      },
      actualHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Jam lembur aktual yang dihitung sistem (dari clockIn & clockOut)'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Alasan employee melakukan lembur'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Alasan admin reject overtime'
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

    // Add index for faster queries
    await queryInterface.addIndex('Overtimes', ['UserId']);
    await queryInterface.addIndex('Overtimes', ['status']);
    await queryInterface.addIndex('Overtimes', ['overtimeDate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Overtimes');
  }
};
