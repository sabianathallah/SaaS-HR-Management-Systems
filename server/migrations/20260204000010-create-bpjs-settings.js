'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BPJSSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('kesehatan', 'ketenagakerjaan_jkk', 'ketenagakerjaan_jkm', 'ketenagakerjaan_jht', 'ketenagakerjaan_jp'),
        allowNull: false,
        comment: 'Type of BPJS contribution'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Display name (e.g., BPJS Kesehatan, JKK, JKM, JHT, JP)'
      },
      employeePercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Employee contribution percentage'
      },
      companyPercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Company contribution percentage'
      },
      maxSalaryBase: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Maximum salary for calculation (null = no limit)'
      },
      minSalaryBase: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Minimum salary for calculation'
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When this setting expires (null = ongoing)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
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

    await queryInterface.addIndex('BPJSSettings', ['type'], {
      name: 'bpjs_settings_type_index'
    });

    await queryInterface.addIndex('BPJSSettings', ['isActive'], {
      name: 'bpjs_settings_is_active_index'
    });

    await queryInterface.addIndex('BPJSSettings', ['effectiveDate'], {
      name: 'bpjs_settings_effective_date_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BPJSSettings');
  }
};
