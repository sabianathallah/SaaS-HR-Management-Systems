'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add LeaveRequestId column
    await queryInterface.addColumn('Attendances', 'LeaveRequestId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'LeaveRequests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Link to leave request if attendance is from approved leave'
    });

    // Update status ENUM to include PERMISSION and SICK_LEAVE
    await queryInterface.changeColumn('Attendances', 'status', {
      type: Sequelize.ENUM(
        'ON_PROGRESS',
        'ON_TIME',
        'LATE',
        'ABSENT',
        'LEAVE',
        'SICK_LEAVE',
        'PERMISSION',
        'HOLIDAY'
      ),
      allowNull: false,
      defaultValue: 'ON_PROGRESS'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove LeaveRequestId column
    await queryInterface.removeColumn('Attendances', 'LeaveRequestId');

    // Revert status ENUM to original
    await queryInterface.changeColumn('Attendances', 'status', {
      type: Sequelize.ENUM(
        'ON_PROGRESS',
        'ON_TIME',
        'LATE',
        'ABSENT',
        'LEAVE',
        'HOLIDAY'
      ),
      allowNull: false,
      defaultValue: 'ON_PROGRESS'
    });
  }
};
