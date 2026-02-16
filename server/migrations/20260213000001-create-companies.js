'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Company name cannot be empty'
          }
        }
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Company slug cannot be empty'
          },
          isLowercase: {
            msg: 'Slug must be lowercase'
          }
        }
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL or path to company logo'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address'
          }
        }
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      taxIdentificationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'NPWP Perusahaan'
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Industry type: Technology, Finance, Retail, etc.'
      },
      employeeCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: 'Employee count cannot be negative'
          }
        }
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      subscriptionPlan: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'basic',
        comment: 'Subscription plan: basic, professional, enterprise'
      },
      subscriptionExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Subscription expiry date'
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Company-specific settings and configurations'
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

    // Add index on slug for faster lookups
    await queryInterface.addIndex('Companies', ['slug'], {
      name: 'companies_slug_index',
      unique: true
    });

    // Add index on status
    await queryInterface.addIndex('Companies', ['status'], {
      name: 'companies_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Companies');
  }
};
