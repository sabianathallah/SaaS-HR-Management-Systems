'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TaxSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tax year (e.g., 2026)'
      },
      ptkpStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'PTKP status code (TK0, TK1, K0, K1, K2, K3)'
      },
      ptkpAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'PTKP amount in IDR per year'
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Description (e.g., Tidak Kawin Tanpa Tanggungan)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Create tax brackets table
    await queryInterface.createTable('TaxBrackets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bracketLevel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Bracket order (1, 2, 3, 4, 5)'
      },
      minIncome: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Minimum income for this bracket (yearly)'
      },
      maxIncome: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Maximum income for this bracket (null = unlimited)'
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Tax rate percentage (e.g., 5.00 for 5%)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('TaxSettings', ['year', 'ptkpStatus'], {
      unique: true,
      name: 'tax_settings_year_status_unique'
    });

    await queryInterface.addIndex('TaxBrackets', ['year'], {
      name: 'tax_brackets_year_index'
    });

    await queryInterface.addIndex('TaxBrackets', ['year', 'bracketLevel'], {
      unique: true,
      name: 'tax_brackets_year_level_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TaxBrackets');
    await queryInterface.dropTable('TaxSettings');
  }
};
