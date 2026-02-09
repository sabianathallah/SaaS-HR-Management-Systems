'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PayrollId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Payrolls',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      PayrollPeriodId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'PayrollPeriods',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM(
          'created',
          'generated',
          'adjusted',
          'submitted',
          'approved',
          'rejected',
          'payment_processed',
          'payment_success',
          'payment_failed',
          'cancelled'
        ),
        allowNull: false
      },
      performedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      performedByName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of user name'
      },
      performedByRole: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data (old/new values, etc.)'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
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

    await queryInterface.addIndex('PayrollHistories', ['PayrollId'], {
      name: 'payroll_histories_payroll_id_index'
    });

    await queryInterface.addIndex('PayrollHistories', ['PayrollPeriodId'], {
      name: 'payroll_histories_period_id_index'
    });

    await queryInterface.addIndex('PayrollHistories', ['action'], {
      name: 'payroll_histories_action_index'
    });

    await queryInterface.addIndex('PayrollHistories', ['performedBy'], {
      name: 'payroll_histories_performed_by_index'
    });

    await queryInterface.addIndex('PayrollHistories', ['createdAt'], {
      name: 'payroll_histories_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayrollHistories');
  }
};
