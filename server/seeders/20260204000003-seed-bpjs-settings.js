'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bpjsSettings = [
      // BPJS Kesehatan
      {
        type: 'kesehatan',
        name: 'BPJS Kesehatan',
        employeePercentage: 1.00, // 1% dari gaji
        companyPercentage: 4.00, // 4% dari gaji
        maxSalaryBase: 12000000, // Max upah 12 juta
        minSalaryBase: null,
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
        isActive: true,
        description: 'BPJS Kesehatan - Employee: 1%, Company: 4%',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // BPJS Ketenagakerjaan - JKK (Jaminan Kecelakaan Kerja)
      {
        type: 'ketenagakerjaan_jkk',
        name: 'BPJS Ketenagakerjaan - JKK',
        employeePercentage: 0.00, // Ditanggung perusahaan
        companyPercentage: 0.24, // 0.24% (risiko sangat rendah)
        maxSalaryBase: null,
        minSalaryBase: null,
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
        isActive: true,
        description: 'Jaminan Kecelakaan Kerja - Company: 0.24% (tingkat risiko sangat rendah)',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // BPJS Ketenagakerjaan - JKM (Jaminan Kematian)
      {
        type: 'ketenagakerjaan_jkm',
        name: 'BPJS Ketenagakerjaan - JKM',
        employeePercentage: 0.00, // Ditanggung perusahaan
        companyPercentage: 0.30, // 0.30%
        maxSalaryBase: null,
        minSalaryBase: null,
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
        isActive: true,
        description: 'Jaminan Kematian - Company: 0.30%',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // BPJS Ketenagakerjaan - JHT (Jaminan Hari Tua)
      {
        type: 'ketenagakerjaan_jht',
        name: 'BPJS Ketenagakerjaan - JHT',
        employeePercentage: 2.00, // 2%
        companyPercentage: 3.70, // 3.7%
        maxSalaryBase: null,
        minSalaryBase: null,
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
        isActive: true,
        description: 'Jaminan Hari Tua - Employee: 2%, Company: 3.7%',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // BPJS Ketenagakerjaan - JP (Jaminan Pensiun)
      {
        type: 'ketenagakerjaan_jp',
        name: 'BPJS Ketenagakerjaan - JP',
        employeePercentage: 1.00, // 1%
        companyPercentage: 2.00, // 2%
        maxSalaryBase: 9077600, // Max upah untuk JP (updated 2024)
        minSalaryBase: null,
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
        isActive: true,
        description: 'Jaminan Pensiun - Employee: 1%, Company: 2%',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('BPJSSettings', bpjsSettings, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BPJSSettings', null, {});
  }
};
