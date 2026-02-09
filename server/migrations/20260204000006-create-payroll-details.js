'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PayrollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Payrolls',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      PayrollComponentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'PayrollComponents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Null for system-generated components'
      },
      componentCode: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of component code'
      },
      componentName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of component name'
      },
      componentType: {
        type: Sequelize.ENUM('earning', 'deduction'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      calculationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'How this amount was calculated'
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

    await queryInterface.addIndex('PayrollDetails', ['PayrollId'], {
      name: 'payroll_details_payroll_id_index'
    });

    await queryInterface.addIndex('PayrollDetails', ['componentType'], {
      name: 'payroll_details_component_type_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayrollDetails');
  }
};
