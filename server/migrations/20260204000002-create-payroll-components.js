'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollComponents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique code for component (e.g., ALLOW_TRANSPORT)'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Display name (e.g., Tunjangan Transport)'
      },
      type: {
        type: Sequelize.ENUM('earning', 'deduction'),
        allowNull: false,
        comment: 'earning = penambah gaji, deduction = pengurang gaji'
      },
      calculationType: {
        type: Sequelize.ENUM('fixed', 'percentage', 'custom'),
        allowNull: false,
        defaultValue: 'fixed',
        comment: 'How to calculate this component'
      },
      defaultAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Default amount or percentage value'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isMandatory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'If true, applies to all employees automatically'
      },
      isSystemGenerated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'If true, calculated by system (overtime, tax, BPJS)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('PayrollComponents', ['code'], {
      unique: true,
      name: 'payroll_components_code_unique'
    });

    await queryInterface.addIndex('PayrollComponents', ['type'], {
      name: 'payroll_components_type_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayrollComponents');
  }
};
