'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const components = [
      // EARNINGS
      {
        code: 'BASE_SALARY',
        name: 'Gaji Pokok',
        type: 'earning',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: true,
        isSystemGenerated: true,
        description: 'Gaji pokok karyawan (system generated, pro-rated)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'OVERTIME_PAY',
        name: 'Uang Lembur',
        type: 'earning',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: true,
        description: 'Pembayaran lembur (1% x gaji pokok x jam lembur)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALLOW_TRANSPORT',
        name: 'Tunjangan Transport',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 500000,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Tunjangan transportasi bulanan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALLOW_MEAL',
        name: 'Tunjangan Makan',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 750000,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Tunjangan makan bulanan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALLOW_COMMUNICATION',
        name: 'Tunjangan Komunikasi',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 300000,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Tunjangan komunikasi (pulsa/internet)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALLOW_HEALTH',
        name: 'Tunjangan Kesehatan',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 500000,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Tunjangan kesehatan tambahan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALLOW_POSITION',
        name: 'Tunjangan Jabatan',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 1000000,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Tunjangan jabatan untuk posisi tertentu',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BONUS_PERFORMANCE',
        name: 'Bonus Kinerja',
        type: 'earning',
        calculationType: 'fixed',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Bonus berdasarkan performa karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'THR',
        name: 'Tunjangan Hari Raya (THR)',
        type: 'earning',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: true,
        description: 'THR (pro-rated untuk masa probation)',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // DEDUCTIONS
      {
        code: 'BPJS_HEALTH_EMP',
        name: 'BPJS Kesehatan (Karyawan)',
        type: 'deduction',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: true,
        isSystemGenerated: true,
        description: 'Potongan BPJS Kesehatan bagian karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BPJS_EMPLOYMENT_EMP',
        name: 'BPJS Ketenagakerjaan (Karyawan)',
        type: 'deduction',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: true,
        isSystemGenerated: true,
        description: 'Potongan BPJS Ketenagakerjaan bagian karyawan (JKK+JKM+JHT+JP)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'INCOME_TAX',
        name: 'PPh 21',
        type: 'deduction',
        calculationType: 'custom',
        defaultAmount: 0,
        isActive: true,
        isMandatory: true,
        isSystemGenerated: true,
        description: 'Pajak Penghasilan Pasal 21',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DEDUCT_LOAN',
        name: 'Cicilan Pinjaman',
        type: 'deduction',
        calculationType: 'fixed',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Cicilan pinjaman karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DEDUCT_ADVANCE',
        name: 'Potongan Kasbon',
        type: 'deduction',
        calculationType: 'fixed',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Potongan kasbon/gaji di muka',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DEDUCT_PENALTY',
        name: 'Denda/Sanksi',
        type: 'deduction',
        calculationType: 'fixed',
        defaultAmount: 0,
        isActive: true,
        isMandatory: false,
        isSystemGenerated: false,
        description: 'Denda atau sanksi karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('PayrollComponents', components, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PayrollComponents', null, {});
  }
};
