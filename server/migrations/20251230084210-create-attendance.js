'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
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
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      clockIn: {
        type: Sequelize.DATE,
        allowNull: false
      },
      clockOut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'ON_PROGRESS',  // Sedang bekerja
          'ON_TIME',      // Hadir tepat waktu
          'LATE',         // Hadir terlambat
          'ABSENT',       // Tidak hadir
          'LEAVE',        // Cuti
          'HOLIDAY'       // Libur nasional
        ),
        allowNull: false,
        defaultValue: 'ON_PROGRESS'
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
    await queryInterface.dropTable('Attendances');
  }
};