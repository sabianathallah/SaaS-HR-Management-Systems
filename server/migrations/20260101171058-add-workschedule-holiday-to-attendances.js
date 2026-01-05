'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add WorkScheduleId column to Attendances table
    await queryInterface.addColumn('Attendances', 'WorkScheduleId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable untuk backward compatibility dengan data existing
      references: {
        model: 'WorkSchedules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Jika schedule dihapus, set NULL (keep attendance record)
    });

    // Add HolidayId column to Attendances table
    await queryInterface.addColumn('Attendances', 'HolidayId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable karena hanya diisi jika status = HOLIDAY
      references: {
        model: 'Holidays',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Jika holiday dihapus, set NULL (keep attendance record)
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Attendances', ['WorkScheduleId'], {
      name: 'attendances_work_schedule_id_idx'
    });

    await queryInterface.addIndex('Attendances', ['HolidayId'], {
      name: 'attendances_holiday_id_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('Attendances', 'attendances_work_schedule_id_idx');
    await queryInterface.removeIndex('Attendances', 'attendances_holiday_id_idx');

    // Remove columns
    await queryInterface.removeColumn('Attendances', 'WorkScheduleId');
    await queryInterface.removeColumn('Attendances', 'HolidayId');
  }
};
