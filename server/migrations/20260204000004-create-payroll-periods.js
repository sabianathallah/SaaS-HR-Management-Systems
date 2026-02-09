'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PayrollPeriods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      periodName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'e.g., "January 2026" or "2026-01"'
      },
      periodStart: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Start date of attendance period (21st prev month)'
      },
      periodEnd: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'End date of attendance period (20th current month)'
      },
      cutoffDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Cutoff date for data (20th current month)'
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Scheduled payment date (25th current month)'
      },
      status: {
        type: Sequelize.ENUM(
          'draft',
          'pending_review',
          'approved',
          'processing',
          'paid',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'draft'
      },
      totalEmployees: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalGrossSalary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalDeductions: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalNetSalary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      generatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      generatedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
      processedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      midtransBatchId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Midtrans Iris batch disbursement ID'
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

    await queryInterface.addIndex('PayrollPeriods', ['status'], {
      name: 'payroll_periods_status_index'
    });

    await queryInterface.addIndex('PayrollPeriods', ['periodStart', 'periodEnd'], {
      name: 'payroll_periods_period_index'
    });

    await queryInterface.addIndex('PayrollPeriods', ['paymentDate'], {
      name: 'payroll_periods_payment_date_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayrollPeriods');
  }
};
