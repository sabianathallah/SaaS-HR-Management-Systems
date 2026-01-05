'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('LeaveRequests', {
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
      leaveType: {
        type: Sequelize.ENUM('ANNUAL_LEAVE', 'SICK_LEAVE', 'PERMISSION'),
        allowNull: false,
        comment: 'ANNUAL_LEAVE & SICK_LEAVE potong quota, PERMISSION tidak'
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Start date of leave/permission'
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'End date of leave/permission'
      },
      totalDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Total days requested (calculated)'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Reason for leave/permission'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'Request approval status'
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Admin who approved/rejected this request'
      },
      approvalNote: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Note from admin when approving/rejecting'
      },
      approvalDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the request was approved/rejected'
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('LeaveRequests');
  }
};
