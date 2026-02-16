'use strict';

const { hashPassword } = require('../helpers/bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if default company already exists
    const [existingCompanies] = await queryInterface.sequelize.query(
      `SELECT id FROM "Companies" WHERE slug = 'default-company' LIMIT 1;`
    );

    let companyId;

    if (existingCompanies.length === 0) {
      // Create default company only if it doesn't exist
      await queryInterface.bulkInsert('Companies', [{
        name: 'Default Company',
        slug: 'default-company',
        logo: null,
        address: 'Jakarta, Indonesia',
        phoneNumber: '+62-21-1234567',
        email: 'contact@defaultcompany.com',
        website: null,
        taxIdentificationNumber: null,
        industry: 'Technology',
        employeeCount: 3,
        status: 'active',
        subscriptionPlan: 'enterprise',
        subscriptionExpiresAt: new Date('2027-12-31'),
        settings: JSON.stringify({
          workingHours: {
            start: '09:00',
            end: '18:00'
          },
          timezone: 'Asia/Jakarta'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});

      // Get the created company ID
      const [defaultCompany] = await queryInterface.sequelize.query(
        `SELECT id FROM "Companies" WHERE slug = 'default-company' LIMIT 1;`
      );
      companyId = defaultCompany[0].id;
    } else {
      companyId = existingCompanies[0].id;
      console.log('✅ Default company already exists');
    }

    // Check if super admin exists
    const [existingSuperAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'superadmin@hrsystem.com' LIMIT 1;`
    );

    if (existingSuperAdmin.length === 0) {
      // Create Super Admin (not tied to any company)
      await queryInterface.bulkInsert('Users', [{
        name: 'Super Admin',
        email: 'superadmin@hrsystem.com',
        password: hashPassword('superadmin123'),
        phoneNumber: '+62-812-3456-7890',
        role: 'SUPER_ADMIN',
        companyId: null,
        position: 'System Administrator',
        department: 'IT',
        annualLeaveQuota: 0,
        usedLeaveQuota: 0,
        isActive: true,
        joinDate: new Date(),
        employmentStatus: 'permanent',
        maritalStatus: 'single',
        numberOfDependents: 0,
        baseSalary: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log('✅ Super Admin created');
    } else {
      console.log('✅ Super Admin already exists');
    }

    // Update existing users to belong to default company and change ADMIN to COMPANY_ADMIN
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET "companyId" = ${companyId},
          "role" = CASE 
            WHEN "role" = 'ADMIN' THEN 'COMPANY_ADMIN'
            ELSE "role"
          END,
          "updatedAt" = NOW()
      WHERE "email" != 'superadmin@hrsystem.com'
        AND "companyId" IS NULL;
    `);
    console.log('✅ Updated existing users to default company');

    // Update all existing data to belong to default company
    const tables = [
      'Attendances',
      'LeaveRequests',
      'Overtimes',
      'Shifts',
      'WorkSchedules',
      'Holidays',
      'OfficeLocations',
      'Notifications',
      'AuditLogs',
      'WorkLocationChangeRequests',
      'HybridSchedules',
      'PayrollComponents',
      'EmployeeSalaryComponents',
      'PayrollPeriods',
      'Payrolls',
      'PayrollDetails',
      'PayrollAdjustments',
      'PayrollHistories',
      'TaxSettings',
      'BPJSSettings'
    ];

    for (const table of tables) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE "${table}" 
          SET "companyId" = ${companyId},
              "updatedAt" = NOW()
          WHERE "companyId" IS NULL;
        `);
        console.log(`✅ Updated ${table} with default companyId`);
      } catch (error) {
        console.log(`⚠️  Skipped ${table}: ${error.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove super admin
    await queryInterface.bulkDelete('Users', {
      email: 'superadmin@hrsystem.com'
    }, {});

    // Change COMPANY_ADMIN back to ADMIN
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET "role" = CASE 
        WHEN "role" = 'COMPANY_ADMIN' THEN 'ADMIN'
        ELSE "role"
      END,
      "companyId" = NULL,
      "updatedAt" = NOW();
    `);

    // Remove default company
    await queryInterface.bulkDelete('Companies', {
      slug: 'default-company'
    }, {});
  }
};
