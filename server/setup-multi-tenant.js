const { User, Company, sequelize } = require('./models');
const { hashPassword } = require('./helpers/bcrypt');

async function setupMultiTenant() {
  const transaction = await sequelize.transaction();
  
  try {
    // Get default company
    const defaultCompany = await Company.findOne({
      where: { slug: 'default-company' }
    });

    if (!defaultCompany) {
      console.error('Default company not found!');
      return;
    }

    console.log(`✅ Found default company: ${defaultCompany.name} (ID: ${defaultCompany.id})`);

    // Update existing users
    console.log('\n=== Updating existing users ===');
    
    // Change ADMIN to COMPANY_ADMIN and assign to default company
    const adminUsers = await User.findAll({
      where: { role: 'ADMIN' },
      transaction
    });

    for (const user of adminUsers) {
      await user.update({
        role: 'COMPANY_ADMIN',
        companyId: defaultCompany.id
      }, { transaction });
      console.log(`✅ Updated ${user.email}: ADMIN -> COMPANY_ADMIN, assigned to company ${defaultCompany.id}`);
    }

    // Assign EMPLOYEE users to default company
    const employeeUsers = await User.findAll({
      where: { 
        role: 'EMPLOYEE',
        companyId: null
      },
      transaction
    });

    for (const user of employeeUsers) {
      await user.update({
        companyId: defaultCompany.id
      }, { transaction });
      console.log(`✅ Assigned ${user.email} to company ${defaultCompany.id}`);
    }

    // Check if super admin exists
    const superAdmin = await User.findOne({
      where: { email: 'superadmin@hrsystem.com' },
      transaction
    });

    if (!superAdmin) {
      // Create super admin
      const newSuperAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@hrsystem.com',
        password: 'superadmin123', // Will be hashed by beforeCreate hook
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
        baseSalary: 0
      }, { transaction });
      
      console.log(`\n✅ Created Super Admin: ${newSuperAdmin.email} (ID: ${newSuperAdmin.id})`);
    } else {
      console.log(`\n✅ Super Admin already exists: ${superAdmin.email}`);
    }

    // Update all existing data to belong to default company
    console.log('\n=== Updating existing data to default company ===');
    
    const tables = [
      'Attendances',
      'LeaveRequests',
      'Overtimes',
      'Shifts',
      'WorkSchedules',
      'Holidays',
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
        const [results] = await sequelize.query(`
          UPDATE "${table}" 
          SET "companyId" = :companyId,
              "updatedAt" = NOW()
          WHERE "companyId" IS NULL;
        `, {
          replacements: { companyId: defaultCompany.id },
          transaction
        });
        console.log(`✅ Updated ${table}`);
      } catch (error) {
        console.log(`⚠️  Skipped ${table}: ${error.message}`);
      }
    }

    await transaction.commit();
    console.log('\n🎉 Multi-tenant setup completed successfully!');
    
    // Show final state
    console.log('\n=== FINAL USER STATE ===');
    const finalUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'companyId'],
      order: [['id', 'ASC']]
    });
    
    finalUsers.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, CompanyId: ${user.companyId}`);
    });

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupMultiTenant();
