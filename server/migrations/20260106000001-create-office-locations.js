'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('office_locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nama lokasi kantor (e.g., HQ Jakarta, Branch Bandung)'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Alamat lengkap kantor'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Koordinat latitude (-90 to 90)'
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Koordinat longitude (-180 to 180)'
      },
      radius: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Radius dalam meter (default: 50m)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Status aktif/non-aktif lokasi'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for better performance
    await queryInterface.addIndex('office_locations', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('office_locations');
  }
};
