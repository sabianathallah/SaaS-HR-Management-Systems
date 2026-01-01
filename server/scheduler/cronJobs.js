const cron = require('node-cron');
const { Attandance, User, WorkSchedule, Holiday } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange } = require('../helpers/attendance');

// Function untuk auto set absent (dengan logging untuk cron job)
const autoSetAbsent = async () => {
  try {
    console.log('🤖 Running auto set absent job...');
    
    // Check if today is a holiday
    const today = new Date();
    const todayDateOnly = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const isHoliday = await Holiday.findOne({
      where: {
        date: todayDateOnly,
        isActive: true
      }
    });

    if (isHoliday) {
      console.log(`🎉 Today is a holiday: ${isHoliday.description}`);
      console.log('⏭️  Skipping auto set absent for holiday.');
      
      // Mark all users as HOLIDAY
      const allUsers = await User.findAll({
        attributes: ['id', 'email']
      });

      const { startOfDay, endOfDay } = getTodayRange();
      
      // Check which users don't have attendance record today
      const attendedUserIds = await Attandance.findAll({
        where: {
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        attributes: ['UserId']
      });
      
      const attendedIds = attendedUserIds.map(a => a.UserId);
      const usersWithoutRecord = allUsers.filter(user => !attendedIds.includes(user.id));
      
      // Create HOLIDAY records for users without attendance
      if (usersWithoutRecord.length > 0) {
        await Promise.all(
          usersWithoutRecord.map(user => 
            Attandance.create({
              UserId: user.id,
              date: new Date(),
              clockIn: new Date(),
              clockOut: new Date(),
              status: Attandance.ATTENDANCE_STATUS.HOLIDAY
            })
          )
        );
        console.log(`✅ ${usersWithoutRecord.length} users marked as HOLIDAY.`);
      }
      
      return;
    }

    const { startOfDay, endOfDay } = getTodayRange();
    
    // Get all users
    const allUsers = await User.findAll({
      attributes: ['id', 'email']
    });
    
    // Get users yang sudah clock-in hari ini
    const attendedUserIds = await Attandance.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      attributes: ['UserId']
    });
    
    const attendedIds = attendedUserIds.map(a => a.UserId);
    
    // Filter users yang belum clock-in
    const absentUsers = allUsers.filter(user => !attendedIds.includes(user.id));
    
    // Create absent records for users yang tidak hadir
    if (absentUsers.length > 0) {
      await Promise.all(
        absentUsers.map(user => 
          Attandance.create({
            UserId: user.id,
            date: new Date(),
            clockIn: new Date(),
            clockOut: new Date(),
            status: Attandance.ATTENDANCE_STATUS.ABSENT
          })
        )
      );
      
      console.log(`✅ Auto set absent completed. ${absentUsers.length} users marked as absent.`);
      console.log(`📋 Absent users:`, absentUsers.map(u => u.email));
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
