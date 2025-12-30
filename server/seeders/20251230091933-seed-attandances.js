'use strict';
const fs = require('fs').promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const attendances = JSON.parse(await fs.readFile('./data/attandances.json', 'utf-8')).map( el => {
      delete el.id
      el.createdAt = new Date()
      el.updatedAt = new Date()

      return el
    })

    await queryInterface.bulkInsert('Attandances', attendances, {});
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Attandances', null, {})
  }
};
