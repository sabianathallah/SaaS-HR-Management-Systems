'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payrolls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PayrollPeriodId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PayrollPeriods',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      employeeName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Snapshot of employee name at time of payroll'
      },
      employeeEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      employeePosition: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employeeDepartment: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employmentStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      baseSalary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      workingDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Actual working days in period'
      },
      totalDaysInPeriod: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      proratedSalary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Base salary after pro-rata calculation'
      },
      overtimeHours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      overtimePay: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalAllowances: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Sum of all allowances (tunjangan)'
      },
      totalBonuses: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      thr: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Tunjangan Hari Raya (pro-rated for probation)'
      },
      totalEarnings: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Gross salary (all earnings combined)'
      },
      bpjsHealthEmployee: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'BPJS Kesehatan employee portion'
      },
      bpjsHealthCompany: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'BPJS Kesehatan company portion'
      },
      bpjsEmploymentEmployee: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'BPJS Ketenagakerjaan employee portion'
      },
      bpjsEmploymentCompany: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'BPJS Ketenagakerjaan company portion'
      },
      incomeTax: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'PPh21 income tax'
      },
      otherDeductions: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Other deductions (loans, penalties, etc.)'
      },
      totalDeductions: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      netSalary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Take-home pay (gross - deductions)'
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Snapshot of bank info at time of payroll'
      },
      bankAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bankAccountHolderName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'processing', 'paid', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'bank_transfer'
      },
      midtransReferenceId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Midtrans disbursement reference ID'
      },
      paymentProofUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL to payment receipt/proof'
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payslipUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL to generated payslip PDF'
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

    await queryInterface.addIndex('Payrolls', ['PayrollPeriodId'], {
      name: 'payrolls_period_id_index'
    });

    await queryInterface.addIndex('Payrolls', ['UserId'], {
      name: 'payrolls_user_id_index'
    });

    await queryInterface.addIndex('Payrolls', ['status'], {
      name: 'payrolls_status_index'
    });

    await queryInterface.addIndex('Payrolls', ['PayrollPeriodId', 'UserId'], {
      unique: true,
      name: 'payrolls_period_user_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payrolls');
  }
};
