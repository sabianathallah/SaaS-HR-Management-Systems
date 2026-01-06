'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('office_locations', [
      {
        name: 'HQ Jakarta - Sudirman',
        address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190',
        latitude: -6.208763,
        longitude: 106.816635,
        radius: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Branch Bandung',
        address: 'Jl. Asia Afrika No. 8, Bandung 40111',
        latitude: -6.921389,
        longitude: 107.607222,
        radius: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Branch Surabaya',
        address: 'Jl. Pemuda No. 31-37, Surabaya 60271',
        latitude: -7.257472,
        longitude: 112.752090,
        radius: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Warehouse Tangerang',
        address: 'Kawasan Industri MM2100, Cibitung, Bekasi',
        latitude: -6.295556,
        longitude: 107.164722,
        radius: 100, // Warehouse area lebih besar
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Branch Bali - Denpasar (Inactive)',
        address: 'Jl. Teuku Umar No. 123, Denpasar',
        latitude: -8.670458,
        longitude: 115.212631,
        radius: 50,
        is_active: false, // Example inactive location
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('office_locations', null, {});
  }
};
