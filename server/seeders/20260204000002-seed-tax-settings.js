'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const currentYear = 2026;

    // PTKP 2026 (Based on Indonesian tax law)
    const ptkpData = [
      {
        year: currentYear,
        ptkpStatus: 'TK0',
        ptkpAmount: 54000000, // Tidak Kawin, 0 tanggungan
        description: 'Tidak Kawin, Tanpa Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'TK1',
        ptkpAmount: 58500000, // Tidak Kawin, 1 tanggungan
        description: 'Tidak Kawin, 1 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'TK2',
        ptkpAmount: 63000000, // Tidak Kawin, 2 tanggungan
        description: 'Tidak Kawin, 2 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'TK3',
        ptkpAmount: 67500000, // Tidak Kawin, 3 tanggungan
        description: 'Tidak Kawin, 3 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'K0',
        ptkpAmount: 58500000, // Kawin, 0 tanggungan
        description: 'Kawin, Tanpa Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'K1',
        ptkpAmount: 63000000, // Kawin, 1 tanggungan
        description: 'Kawin, 1 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'K2',
        ptkpAmount: 67500000, // Kawin, 2 tanggungan
        description: 'Kawin, 2 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        ptkpStatus: 'K3',
        ptkpAmount: 72000000, // Kawin, 3 tanggungan
        description: 'Kawin, 3 Tanggungan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Tax Brackets 2026 (Progressive tax rates)
    const taxBrackets = [
      {
        year: currentYear,
        bracketLevel: 1,
        minIncome: 0,
        maxIncome: 60000000, // 0 - 60 juta
        taxRate: 5.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        bracketLevel: 2,
        minIncome: 60000000,
        maxIncome: 250000000, // 60 juta - 250 juta
        taxRate: 15.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        bracketLevel: 3,
        minIncome: 250000000,
        maxIncome: 500000000, // 250 juta - 500 juta
        taxRate: 25.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        bracketLevel: 4,
        minIncome: 500000000,
        maxIncome: 5000000000, // 500 juta - 5 miliar
        taxRate: 30.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        year: currentYear,
        bracketLevel: 5,
        minIncome: 5000000000,
        maxIncome: null, // > 5 miliar (unlimited)
        taxRate: 35.00,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('TaxSettings', ptkpData, {});
    await queryInterface.bulkInsert('TaxBrackets', taxBrackets, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TaxBrackets', null, {});
    await queryInterface.bulkDelete('TaxSettings', null, {});
  }
};
