const cron = require('node-cron');
const { WorkSchedule } = require('../models');
const { processAutoSetAbsent } = require('../helpers/attendance');

// Function untuk auto set absent dengan logging untuk cron job
const autoSetAbsent = async () => {
  try {
    console.log('🤖 Running auto set absent job...');
    
    const result = await processAutoSetAbsent();
    
    if (result.isHoliday) {
      console.log(`🎉 Today is a holiday: ${result.holidayDescription}`);
      console.log(`✅ ${result.absentCount} users marked as HOLIDAY.`);
      if (result.absentCount > 0) {
        console.log(`📋 Holiday marked users:`, result.absentUserEmails);
      }
      return;
    }
    
    if (result.absentCount > 0) {
      console.log(`✅ Auto set absent completed. ${result.absentCount} users marked as absent.`);
      console.log(`📋 Absent users:`, result.absentUserEmails);
    } else {
      console.log('✅ All users have clocked in today. No absent records created.');
    }
    
  } catch (error) {
    console.error('❌ Error in auto set absent:', error);
  }
};

// Setup cron jobs
const setupCronJobs = async () => {
  console.log('⏰ Setting up cron jobs...');
  
  // Get work schedule from database
  const workSchedule = await WorkSchedule.findOne({
    where: { isActive: true }
  });

  let autoAbsentTime = '18:00'; // Default fallback
  
  if (workSchedule) {
    autoAbsentTime = workSchedule.autoAbsentTime;
    console.log(`📅 Work Schedule Configuration:`);
    console.log(`   - Work Start: ${workSchedule.workStartTime}`);
    console.log(`   - Work End: ${workSchedule.workEndTime}`);
    console.log(`   - Auto Absent: ${workSchedule.autoAbsentTime}`);
  } else {
    console.log('⚠️  No work schedule found in database, using default: 18:00');
  }

  // Parse hour and minute from autoAbsentTime (format: HH:MM)
  const [hour, minute] = autoAbsentTime.split(':');
  
  // Create cron expression: minute hour * * *
  const cronExpression = `${minute} ${hour} * * *`;
  
  console.log(`⏰ Setting up auto absent cron job with expression: ${cronExpression}`);
  
  // Auto set absent based on database configuration
  cron.schedule(cronExpression, () => {
    console.log(`⏰ Cron job triggered at ${autoAbsentTime}`);
    autoSetAbsent();
  });
  
  console.log('✅ Cron jobs setup complete');
  console.log(`📅 Schedule: Auto set absent daily at ${autoAbsentTime}`);
};

module.exports = { setupCronJobs, autoSetAbsent };
