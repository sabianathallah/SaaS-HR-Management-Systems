'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('LeaveRequests', 'attachmentPath', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Path to uploaded document (e.g., sick letter, supporting document)'
    });

    await queryInterface.addColumn('LeaveRequests', 'attachmentOriginalName', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Original filename of uploaded document'
    });

    await queryInterface.addColumn('LeaveRequests', 'attachmentMimeType', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'MIME type of uploaded document'
    });

    await queryInterface.addColumn('LeaveRequests', 'attachmentSize', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('LeaveRequests', 'attachmentPath');
    await queryInterface.removeColumn('LeaveRequests', 'attachmentOriginalName');
    await queryInterface.removeColumn('LeaveRequests', 'attachmentMimeType');
    await queryInterface.removeColumn('LeaveRequests', 'attachmentSize');
  }
};
