'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
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
        onDelete: 'CASCADE',
        comment: 'User who receives this notification'
      },
      type: {
        type: Sequelize.ENUM(
          'LEAVE_APPROVED',
          'LEAVE_REJECTED',
          'OVERTIME_APPROVED',
          'OVERTIME_REJECTED',
          'ATTENDANCE_CORRECTION',
          'WORK_SCHEDULE_CHANGE',
          'HOLIDAY_ANNOUNCEMENT',
          'LEAVE_QUOTA_ADJUSTMENT',
          'CLOCK_IN_REMINDER'
        ),
        allowNull: false,
        comment: 'Type of notification'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Notification title'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Notification message body'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the notification has been read'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data (leaveRequestId, overtimeId, etc)'
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};