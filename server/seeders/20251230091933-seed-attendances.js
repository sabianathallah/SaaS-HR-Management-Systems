'use strict';
const fs = require('fs').promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Reset sequence ke 1 sebelum insert
    await queryInterface.sequelize.query('ALTER SEQUENCE "Attendances_id_seq" RESTART WITH 1;');

    const attendances = JSON.parse(await fs.readFile('./data/attendances.json', 'utf-8')).map( el => {
      delete el.id
      el.createdAt = new Date()
      el.updatedAt = new Date()

      return el
    })

    await queryInterface.bulkInsert('Attendances', attendances, {});
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Attendances', null, {})
  }
};
