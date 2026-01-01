'use strict';
const fs = require('fs').promises
const { hashPassword } = require('../helpers/bcrypt');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // Reset sequence ke 1 sebelum insert
   await queryInterface.sequelize.query('ALTER SEQUENCE "Users_id_seq" RESTART WITH 1;');

   const user = JSON.parse(await fs.readFile('./data/users.json', 'utf-8')).map( el => {
    delete el.id
    el.createdAt = new Date()
    el.updatedAt = new Date()
    el.password = hashPassword(el.password)

    return el
  })
  await queryInterface.bulkInsert('Users', user, {});
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Users', null, {})
  }
};
