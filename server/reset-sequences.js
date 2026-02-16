const { sequelize } = require('./models');

async function resetSequences() {
  try {
    console.log('🔧 Resetting database sequences...');
    
    // Reset Users sequence
    await sequelize.query(`
      SELECT setval('"Users_id_seq"', (SELECT MAX(id) FROM "Users") + 1, false);
    `);
    console.log('✅ Reset Users sequence');

    // Reset Companies sequence
    await sequelize.query(`
      SELECT setval('"Companies_id_seq"', (SELECT MAX(id) FROM "Companies") + 1, false);
    `);
    console.log('✅ Reset Companies sequence');

    console.log('🎉 All sequences reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSequences();
