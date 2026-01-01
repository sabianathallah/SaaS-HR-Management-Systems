const cron = require('node-cron');
const { Attandance, User } = require('../models');
const { Op } = require('sequelize');
const { getTodayRange } = require('../helpers/attendance');

// Function untuk auto set absent (dengan logging untuk cron job)
const autoSetAbsent = async () => {
  try {
    console.log('🤖 Running auto set absent job...');
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
const setupCronJobs = () => {
  console.log('⏰ Setting up cron jobs...');
  
  // Auto set absent setiap hari jam 18:00 (6 PM)
  cron.schedule('0 18 * * *', () => {
    console.log('⏰ Cron job triggered at 6 PM');
    autoSetAbsent();
  });
  
  // Optional: Backup schedule jam 23:00 (11 PM)
  cron.schedule('0 23 * * *', () => {
    console.log('⏰ Backup cron job triggered at 11 PM');
    autoSetAbsent();
  });
  
  console.log('✅ Cron jobs setup complete');
  console.log('📅 Schedule: Auto set absent at 6 PM and 11 PM daily');
};

module.exports = { setupCronJobs, autoSetAbsent };
