'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollAdjustments', {
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
      adjustmentType: {
        type: Sequelize.ENUM('earning', 'deduction'),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Reason for adjustment (e.g., Bonus Kinerja, Potongan Keterlambatan)'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isBackpay: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True if this is a correction from previous period'
      },
      referenceMonth: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Which month this backpay refers to (e.g., 2026-01)'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approvedAt: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('PayrollAdjustments', ['PayrollId'], {
      name: 'payroll_adjustments_payroll_id_index'
    });

    await queryInterface.addIndex('PayrollAdjustments', ['createdBy'], {
      name: 'payroll_adjustments_created_by_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayrollAdjustments');
  }
};
