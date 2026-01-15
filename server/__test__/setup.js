const { sequelize } = require('../models');

// Set test environment
process.env.NODE_ENV = 'test';

// Setup before all tests
beforeAll(async () => {
  try {
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Failed to close test database:', error);
  }
});

// Set timeout for all tests
jest.setTimeout(30000);
