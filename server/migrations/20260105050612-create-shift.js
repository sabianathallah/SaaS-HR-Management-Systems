'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Shifts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Nama shift: Pagi, Siang, Malam, Flexible'
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Jam mulai kerja shift ini (HH:mm:ss)'
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Jam selesai kerja shift ini (HH:mm:ss)'
      },
      breakDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: 'Durasi istirahat dalam menit'
      },
      lateTolerance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
        comment: 'Toleransi keterlambatan dalam menit sebelum dianggap late'
      },
      overtimeThreshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
        comment: 'Minimum menit overtime untuk dihitung sebagai lembur'
      },
      isFlexible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True jika shift flexible (tidak ada pengecekan keterlambatan ketat)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Deskripsi shift'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('Shifts');
  }
};
