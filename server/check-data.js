const { User, Company } = require('./models');

async function checkData() {
  try {
    console.log('=== EXISTING USERS ===');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'companyId'],
      order: [['id', 'ASC']]
    });
    
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, CompanyId: ${user.companyId}`);
    });

    console.log('\n=== EXISTING COMPANIES ===');
    const companies = await Company.findAll({
      attributes: ['id', 'name', 'slug', 'status'],
      order: [['id', 'ASC']]
    });
    
    companies.forEach(company => {
      console.log(`ID: ${company.id}, Name: ${company.name}, Slug: ${company.slug}, Status: ${company.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
