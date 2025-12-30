'use strict';
const fs = require('fs').promises
const { hashPassword } = require('../helpers/bcrypt');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

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
