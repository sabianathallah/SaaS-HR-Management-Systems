'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeSalaryComponents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      PayrollComponentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PayrollComponents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Custom amount for this employee (overrides default)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When this component starts applying'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When this component stops applying (null = ongoing)'
      },
      notes: {
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

    await queryInterface.addIndex('EmployeeSalaryComponents', ['UserId'], {
      name: 'employee_salary_components_user_id_index'
    });

    await queryInterface.addIndex('EmployeeSalaryComponents', ['PayrollComponentId'], {
      name: 'employee_salary_components_component_id_index'
    });

    await queryInterface.addIndex('EmployeeSalaryComponents', ['UserId', 'PayrollComponentId'], {
      name: 'employee_salary_components_user_component_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmployeeSalaryComponents');
  }
};
