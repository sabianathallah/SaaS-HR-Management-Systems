const nodemailer = require('nodemailer');

/**
 * Email Notification Helper
 * Handles sending email notifications to users
 */

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content (fallback)
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    // Skip email sending in development if credentials not configured
    if (EMAIL_CONFIG.auth.user === 'your-email@gmail.com') {
      console.log('⚠️  Email notification skipped (SMTP not configured)');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${textContent || htmlContent}`);
      return { skipped: true, reason: 'SMTP not configured' };
    }

    const mailOptions = {
      from: `"HR Management System" <${EMAIL_CONFIG.auth.user}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw error - just log it (email failure shouldn't break the app)
    return { success: false, error: error.message };
  }
};

/**
 * Send Leave Approval Email
 */
const sendLeaveApprovalEmail = async (userEmail, userName, leaveData) => {
  const subject = '✅ Leave Request Approved';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Leave Request Approved</h2>
      <p>Dear ${userName},</p>
      <p>Your leave request has been <strong>approved</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${leaveData.leaveType}</p>
        <p><strong>Start Date:</strong> ${leaveData.startDate}</p>
        <p><strong>End Date:</strong> ${leaveData.endDate}</p>
        <p><strong>Total Days:</strong> ${leaveData.totalDays} days</p>
        ${leaveData.approvalNote ? `<p><strong>Note:</strong> ${leaveData.approvalNote}</p>` : ''}
      </div>
      
      <p>Have a great time!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Leave Request Approved\n\nDear ${userName},\nYour leave request has been approved.\n\nLeave Type: ${leaveData.leaveType}\nStart Date: ${leaveData.startDate}\nEnd Date: ${leaveData.endDate}\nTotal Days: ${leaveData.totalDays} days\n${leaveData.approvalNote ? `Note: ${leaveData.approvalNote}` : ''}`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Leave Rejection Email
 */
const sendLeaveRejectionEmail = async (userEmail, userName, leaveData) => {
  const subject = '❌ Leave Request Rejected';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Leave Request Rejected</h2>
      <p>Dear ${userName},</p>
      <p>Unfortunately, your leave request has been <strong>rejected</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${leaveData.leaveType}</p>
        <p><strong>Start Date:</strong> ${leaveData.startDate}</p>
        <p><strong>End Date:</strong> ${leaveData.endDate}</p>
        <p><strong>Total Days:</strong> ${leaveData.totalDays} days</p>
        ${leaveData.approvalNote ? `<p><strong>Reason:</strong> ${leaveData.approvalNote}</p>` : ''}
      </div>
      
      <p>Please contact HR if you have any questions.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Leave Request Rejected\n\nDear ${userName},\nUnfortunately, your leave request has been rejected.\n\nLeave Type: ${leaveData.leaveType}\nStart Date: ${leaveData.startDate}\nEnd Date: ${leaveData.endDate}\nTotal Days: ${leaveData.totalDays} days\n${leaveData.approvalNote ? `Reason: ${leaveData.approvalNote}` : ''}`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Overtime Approval Email
 */
const sendOvertimeApprovalEmail = async (userEmail, userName, overtimeData) => {
  const subject = '✅ Overtime Request Approved';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Overtime Request Approved</h2>
      <p>Dear ${userName},</p>
      <p>Your overtime request has been <strong>approved</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${overtimeData.overtimeDate}</p>
        <p><strong>Requested Hours:</strong> ${overtimeData.requestedHours} hours</p>
        <p><strong>Approved Hours:</strong> ${overtimeData.actualHours} hours</p>
      </div>
      
      <p>Thank you for your hard work!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Overtime Request Approved\n\nDear ${userName},\nYour overtime request has been approved.\n\nDate: ${overtimeData.overtimeDate}\nRequested Hours: ${overtimeData.requestedHours} hours\nApproved Hours: ${overtimeData.actualHours} hours`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Overtime Rejection Email
 */
const sendOvertimeRejectionEmail = async (userEmail, userName, overtimeData) => {
  const subject = '❌ Overtime Request Rejected';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Overtime Request Rejected</h2>
      <p>Dear ${userName},</p>
      <p>Unfortunately, your overtime request has been <strong>rejected</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${overtimeData.overtimeDate}</p>
        <p><strong>Requested Hours:</strong> ${overtimeData.requestedHours} hours</p>
        ${overtimeData.rejectionReason ? `<p><strong>Reason:</strong> ${overtimeData.rejectionReason}</p>` : ''}
      </div>
      
      <p>Please contact HR if you have any questions.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Overtime Request Rejected\n\nDear ${userName},\nUnfortunately, your overtime request has been rejected.\n\nDate: ${overtimeData.overtimeDate}\nRequested Hours: ${overtimeData.requestedHours} hours\n${overtimeData.rejectionReason ? `Reason: ${overtimeData.rejectionReason}` : ''}`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Attendance Correction Email
 */
const sendAttendanceCorrectionEmail = async (userEmail, userName, attendanceData) => {
  const subject = '📝 Attendance Record Updated';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007bff;">Attendance Record Updated</h2>
      <p>Dear ${userName},</p>
      <p>Your attendance record has been <strong>${attendanceData.action}</strong> by the administrator.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${attendanceData.date}</p>
        <p><strong>Clock In:</strong> ${attendanceData.clockIn}</p>
        <p><strong>Clock Out:</strong> ${attendanceData.clockOut}</p>
        <p><strong>Status:</strong> ${attendanceData.status}</p>
      </div>
      
      <p>If you have any questions, please contact HR.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Attendance Record Updated\n\nDear ${userName},\nYour attendance record has been ${attendanceData.action} by the administrator.\n\nDate: ${attendanceData.date}\nClock In: ${attendanceData.clockIn}\nClock Out: ${attendanceData.clockOut}\nStatus: ${attendanceData.status}`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Clock-In Reminder Email
 */
const sendClockInReminderEmail = async (userEmail, userName, scheduleData) => {
  const subject = '⏰ Clock-In Reminder';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ffc107;">Clock-In Reminder</h2>
      <p>Dear ${userName},</p>
      <p>This is a friendly reminder that your work schedule starts in <strong>10 minutes</strong>.</p>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p><strong>⏰ Work Start Time:</strong> ${scheduleData.workStartTime}</p>
        ${scheduleData.shiftName ? `<p><strong>Shift:</strong> ${scheduleData.shiftName}</p>` : ''}
      </div>
      
      <p>Don't forget to clock in on time!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Clock-In Reminder\n\nDear ${userName},\nThis is a friendly reminder that your work schedule starts in 10 minutes.\n\nWork Start Time: ${scheduleData.workStartTime}\n${scheduleData.shiftName ? `Shift: ${scheduleData.shiftName}` : ''}\n\nDon't forget to clock in on time!`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Work Schedule Change Email
 */
const sendWorkScheduleChangeEmail = async (userEmail, userName, scheduleData) => {
  const subject = '📅 Work Schedule Updated';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007bff;">Work Schedule Updated</h2>
      <p>Dear ${userName},</p>
      <p>The work schedule has been <strong>updated</strong> by the administrator.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>New Work Start Time:</strong> ${scheduleData.workStartTime}</p>
        <p><strong>New Work End Time:</strong> ${scheduleData.workEndTime}</p>
      </div>
      
      <p>Please make note of the new schedule.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Work Schedule Updated\n\nDear ${userName},\nThe work schedule has been updated by the administrator.\n\nNew Work Start Time: ${scheduleData.workStartTime}\nNew Work End Time: ${scheduleData.workEndTime}\n\nPlease make note of the new schedule.`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Holiday Announcement Email
 */
const sendHolidayAnnouncementEmail = async (userEmail, userName, holidayData) => {
  const subject = '🎉 Holiday Announcement';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Holiday Announcement</h2>
      <p>Dear ${userName},</p>
      <p>A new holiday has been added to the calendar.</p>
      
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p><strong>🎉 Holiday:</strong> ${holidayData.name}</p>
        <p><strong>📅 Date:</strong> ${holidayData.date}</p>
        ${holidayData.description ? `<p><strong>Description:</strong> ${holidayData.description}</p>` : ''}
      </div>
      
      <p>Enjoy your day off!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Holiday Announcement\n\nDear ${userName},\nA new holiday has been added to the calendar.\n\nHoliday: ${holidayData.name}\nDate: ${holidayData.date}\n${holidayData.description ? `Description: ${holidayData.description}` : ''}\n\nEnjoy your day off!`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

/**
 * Send Leave Quota Adjustment Email
 */
const sendLeaveQuotaAdjustmentEmail = async (userEmail, userName, quotaData) => {
  const subject = '📊 Leave Quota Adjusted';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007bff;">Leave Quota Adjusted</h2>
      <p>Dear ${userName},</p>
      <p>Your annual leave quota has been adjusted by the administrator.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Annual Leave Quota:</strong> ${quotaData.annualLeaveQuota} days</p>
        <p><strong>Used:</strong> ${quotaData.usedLeaveQuota} days</p>
        <p><strong>Remaining:</strong> ${quotaData.remainingLeaveQuota} days</p>
      </div>
      
      <p>For questions, please contact HR.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated notification from HR Management System
      </p>
    </div>
  `;
  const textContent = `Leave Quota Adjusted\n\nDear ${userName},\nYour annual leave quota has been adjusted by the administrator.\n\nAnnual Leave Quota: ${quotaData.annualLeaveQuota} days\nUsed: ${quotaData.usedLeaveQuota} days\nRemaining: ${quotaData.remainingLeaveQuota} days`;

  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

module.exports = {
  sendEmail,
  sendLeaveApprovalEmail,
  sendLeaveRejectionEmail,
  sendOvertimeApprovalEmail,
  sendOvertimeRejectionEmail,
  sendAttendanceCorrectionEmail,
  sendClockInReminderEmail,
  sendWorkScheduleChangeEmail,
  sendHolidayAnnouncementEmail,
  sendLeaveQuotaAdjustmentEmail
};
