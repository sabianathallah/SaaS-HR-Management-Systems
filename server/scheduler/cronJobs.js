const cron = require('node-cron');
const { WorkSchedule, User, Shift, UserShift } = require('../models');
const { processAutoSetAbsent } = require('../helpers/attendance');
const { Notification } = require('../models');
const notificationHelper = require('../helpers/notificationHelper');

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

// Function untuk send clock-in reminder
const sendClockInReminders = async () => {
  try {
    console.log('⏰ Running clock-in reminder job...');
    
    // Get active work schedule
    const workSchedule = await WorkSchedule.findOne({
      where: { isActive: true }
    });

    if (!workSchedule) {
      console.log('⚠️  No active work schedule found');
      return;
    }

    // Get all active employees
    const activeEmployees = await User.findAll({
      where: { 
        isActive: true,
        role: 'EMPLOYEE'
      },
      attributes: ['id', 'name', 'email']
    });

    if (activeEmployees.length === 0) {
      console.log('ℹ️  No active employees found');
      return;
    }

    console.log(`📧 Sending clock-in reminders to ${activeEmployees.length} employees...`);

    // Check if any employees have specific shifts today
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    let sentCount = 0;
    let skippedCount = 0;

    for (const employee of activeEmployees) {
      try {
        // Check if employee has a specific shift assigned
        const userShift = await UserShift.findOne({
          where: { UserId: employee.id },
          include: [{
            model: Shift,
            as: 'shift',
            where: { isActive: true }
          }]
        });

        let scheduleData = {
          workStartTime: workSchedule.workStartTime,
          shiftName: null
        };

        // If user has a shift, check if it applies today
        if (userShift && userShift.shift) {
          const shift = userShift.shift;
          const daysOfWeek = shift.daysOfWeek || [];
          
          if (daysOfWeek.includes(today)) {
            scheduleData.workStartTime = shift.startTime;
            scheduleData.shiftName = shift.shiftName;
          }
        }

        // Send notification
        await notificationHelper.sendNotification(
          employee.id,
          Notification.NOTIFICATION_TYPE.CLOCK_IN_REMINDER,
          '⏰ Clock-In Reminder',
          `Don't forget to clock in! Your work starts at ${scheduleData.workStartTime}${scheduleData.shiftName ? ` (${scheduleData.shiftName})` : ''}.`,
          scheduleData,
          true // Send email
        );

        sentCount++;
      } catch (err) {
        console.error(`❌ Error sending reminder to employee ${employee.id}:`, err.message);
        skippedCount++;
      }
    }

    console.log(`✅ Clock-in reminders sent: ${sentCount} successful, ${skippedCount} failed`);
    
  } catch (error) {
    console.error('❌ Error in clock-in reminder job:', error);
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
  let workStartTime = '09:00'; // Default work start time
  
  if (workSchedule) {
    autoAbsentTime = workSchedule.autoAbsentTime;
    workStartTime = workSchedule.workStartTime;
    console.log(`📅 Work Schedule Configuration:`);
    console.log(`   - Work Start: ${workSchedule.workStartTime}`);
    console.log(`   - Work End: ${workSchedule.workEndTime}`);
    console.log(`   - Auto Absent: ${workSchedule.autoAbsentTime}`);
  } else {
    console.log('⚠️  No work schedule found in database, using defaults');
  }

  // Parse hour and minute from autoAbsentTime (format: HH:MM)
  const [absentHour, absentMinute] = autoAbsentTime.split(':');
  
  // Create cron expression for auto absent: minute hour * * *
  const absentCronExpression = `${absentMinute} ${absentHour} * * *`;
  
  console.log(`⏰ Setting up auto absent cron job: ${absentCronExpression}`);
  
  // Auto set absent based on database configuration
  cron.schedule(absentCronExpression, () => {
    console.log(`⏰ Auto absent job triggered at ${autoAbsentTime}`);
    autoSetAbsent();
  });
  
  // Calculate clock-in reminder time (10 minutes before work start)
  const [startHour, startMinute] = workStartTime.split(':').map(Number);
  let reminderHour = startHour;
  let reminderMinute = startMinute - 10;
  
  // Handle minute overflow
  if (reminderMinute < 0) {
    reminderMinute += 60;
    reminderHour -= 1;
  }
  
  // Handle hour overflow (e.g., if work starts at 00:05)
  if (reminderHour < 0) {
    reminderHour += 24;
  }
  
  // Create cron expression for clock-in reminder
  const reminderCronExpression = `${reminderMinute} ${reminderHour} * * *`;
  const reminderTime = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;
  
  console.log(`⏰ Setting up clock-in reminder cron job: ${reminderCronExpression}`);
  
  // Clock-in reminder (10 minutes before work start)
  cron.schedule(reminderCronExpression, () => {
    console.log(`⏰ Clock-in reminder job triggered at ${reminderTime}`);
    sendClockInReminders();
  });
  
  console.log('✅ Cron jobs setup complete');
  console.log(`📅 Schedules:`);
  console.log(`   - Clock-in reminder: Daily at ${reminderTime} (10 min before work)`);
  console.log(`   - Auto set absent: Daily at ${autoAbsentTime}`);
};

module.exports = { setupCronJobs, autoSetAbsent, sendClockInReminders };
