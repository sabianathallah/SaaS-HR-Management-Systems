'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'employmentStatus', {
      type: Sequelize.ENUM('probation', 'permanent', 'contract', 'internship'),
      allowNull: false,
      defaultValue: 'probation',
      after: 'isActive'
    });

    await queryInterface.addColumn('Users', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'employmentStatus'
    });

    await queryInterface.addColumn('Users', 'bankAccountNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'bankName'
    });

    await queryInterface.addColumn('Users', 'bankAccountHolderName', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'bankAccountNumber'
    });

    await queryInterface.addColumn('Users', 'baseSalary', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      after: 'bankAccountHolderName'
    });

    await queryInterface.addColumn('Users', 'maritalStatus', {
      type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: false,
      defaultValue: 'single',
      after: 'baseSalary'
    });

    await queryInterface.addColumn('Users', 'numberOfDependents', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'maritalStatus'
    });

    await queryInterface.addColumn('Users', 'taxIdentificationNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'numberOfDependents',
      comment: 'NPWP - Nomor Pokok Wajib Pajak'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'taxIdentificationNumber');
    await queryInterface.removeColumn('Users', 'numberOfDependents');
    await queryInterface.removeColumn('Users', 'maritalStatus');
    await queryInterface.removeColumn('Users', 'baseSalary');
    await queryInterface.removeColumn('Users', 'bankAccountHolderName');
    await queryInterface.removeColumn('Users', 'bankAccountNumber');
    await queryInterface.removeColumn('Users', 'bankName');
    await queryInterface.removeColumn('Users', 'employmentStatus');
  }
};
