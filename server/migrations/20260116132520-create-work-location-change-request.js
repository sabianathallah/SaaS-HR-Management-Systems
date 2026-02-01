'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkLocationChangeRequests', {
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
      requestDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      originalLocationType: {
        type: Sequelize.ENUM('ONSITE', 'WFH', 'REMOTE'),
        allowNull: false
      },
      requestedLocationType: {
        type: Sequelize.ENUM('ONSITE', 'WFH', 'REMOTE'),
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
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
      approvalDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('WorkLocationChangeRequests', ['UserId', 'requestDate'], {
      name: 'user_request_date_idx'
    });
    
    await queryInterface.addIndex('WorkLocationChangeRequests', ['status'], {
      name: 'status_idx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WorkLocationChangeRequests');
  }
};