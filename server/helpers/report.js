/**
 * Report Helper Functions
 * Utility functions untuk generate reports dan export data
 */

/**
 * Calculate work hours between clock in and clock out
 * @param {Date|String} clockIn - Clock in datetime
 * @param {Date|String} clockOut - Clock out datetime
 * @returns {String} Work hours in decimal format (e.g., "8.50")
 */
function calculateWorkHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diff = new Date(clockOut) - new Date(clockIn);
  return (diff / (1000 * 60 * 60)).toFixed(2);
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date string
 */
function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Format datetime to Indonesian locale
 * @param {Date|String} datetime - Datetime to format
 * @returns {String} Formatted datetime string (e.g., "06/01/2026, 15.30.00")
 */
function formatDateTime(datetime) {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Get month name from month number
 * @param {Number} month - Month number (1-12)
 * @returns {String} Month name in English
 */
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Invalid Month';
}

/**
 * Calculate attendance statistics for an array of attendance records
 * @param {Array} attendances - Array of attendance objects
 * @returns {Object} Statistics object with counts and percentages
 */
function calculateAttendanceStats(attendances) {
  const stats = {
    totalDays: attendances.length,
    onTime: 0,
    late: 0,
    absent: 0,
    leave: 0,
    present: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
    attendanceRate: 0
  };

  attendances.forEach(att => {
    if (att.status === 'ON_TIME' || att.status === 'PRESENT') {
      stats.onTime++;
      stats.present++;
    } else if (att.status === 'LATE') {
      stats.late++;
      stats.present++;
    } else if (att.status === 'ABSENT') {
      stats.absent++;
    } else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) {
      stats.leave++;
    }

    stats.totalWorkHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
  });

  const workingDays = stats.totalDays - stats.leave;
  
  stats.averageWorkHours = workingDays > 0 ? (stats.totalWorkHours / workingDays).toFixed(2) : '0.00';
  stats.attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : '0.00';
  stats.totalWorkHours = stats.totalWorkHours.toFixed(2);

  return stats;
}

/**
 * Group attendances by user ID and calculate stats per user
 * @param {Array} attendances - Array of attendance objects with User include
 * @returns {Array} Array of user statistics
 */
function groupAttendancesByUser(attendances) {
  const userStatsMap = {};

  attendances.forEach(att => {
    const userId = att.UserId;

    if (!userStatsMap[userId]) {
      userStatsMap[userId] = {
        userId: userId,
        userName: att.User?.name || 'Unknown',
        userEmail: att.User?.email || '-',
        totalDays: 0,
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        workHours: 0,
        attendances: []
      };
    }

    const stats = userStatsMap[userId];
    stats.totalDays++;
    stats.attendances.push(att);

    if (att.status === 'ON_TIME' || att.status === 'PRESENT') {
      stats.present++;
    } else if (att.status === 'LATE') {
      stats.late++;
      stats.present++;
    } else if (att.status === 'ABSENT') {
      stats.absent++;
    } else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) {
      stats.leave++;
    }

    stats.workHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
  });

  // Calculate attendance rate for each user
  return Object.values(userStatsMap).map(stats => {
    const workingDays = stats.totalDays - stats.leave;
    const attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : '0.00';
    return {
      ...stats,
      workHours: stats.workHours.toFixed(2),
      attendanceRate
    };
  });
}

/**
 * Calculate status breakdown from attendances
 * @param {Array} attendances - Array of attendance objects
 * @returns {Object} Object with status counts
 */
function calculateStatusBreakdown(attendances) {
  return attendances.reduce((acc, att) => {
    acc[att.status] = (acc[att.status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get date range for current month
 * @returns {Object} Object with startDate and endDate
 */
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate: firstDay, endDate: lastDay };
}

/**
 * Get date range for specific month and year
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year (e.g., 2026)
 * @returns {Object} Object with startDate and endDate
 */
function getMonthRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return { startDate, endDate };
}

/**
 * Validate month and year parameters
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year
 * @returns {Object} Validation result with isValid and error message
 */
function validateMonthYear(month, year) {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'Month must be a number between 1 and 12'
    };
  }

  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return {
      isValid: false,
      error: 'Year must be a valid number between 2000 and 2100'
    };
  }

  return { isValid: true };
}

/**
 * Format file name for export with timestamp
 * @param {String} prefix - File name prefix
 * @param {String} extension - File extension (without dot)
 * @returns {String} Formatted filename
 */
function generateFileName(prefix, extension) {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Convert attendance data to CSV format structure
 * @param {Array} attendances - Array of attendance objects
 * @returns {Array} Array of objects ready for CSV conversion
 */
function prepareCSVData(attendances) {
  return attendances.map(att => ({
    'User ID': att.UserId,
    'Employee Name': att.User?.name || '-',
    'Email': att.User?.email || '-',
    'Position': att.User?.position || '-',
    'Department': att.User?.department || '-',
    'Date': formatDate(att.date),
    'Clock In': formatDateTime(att.clockIn),
    'Clock Out': formatDateTime(att.clockOut),
    'Status': att.status,
    'Work Hours': calculateWorkHours(att.clockIn, att.clockOut)
  }));
}

// ============================================
// ADVANCED REPORT GENERATORS
// ============================================

/**
 * A. ATTENDANCE REPORT - Most used report
 */
async function generateAttendanceReport(attendances, format = 'excel') {
  const ExcelJS = require('exceljs');
  const { Parser } = require('json2csv');
  
  if (format === 'excel') {
    return await generateAttendanceExcel(attendances);
  } else if (format === 'csv') {
    return generateAttendanceCSV(attendances);
  } else if (format === 'pdf') {
    throw new Error('PDF format not implemented yet');
  }
}

async function generateAttendanceExcel(attendances) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Title
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '📊 ATTENDANCE REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Department',
    'Position',
    'Date',
    'Clock In',
    'Clock Out',
    'Work Hours',
    'Late (min)',
    'Location',
    'Status'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Column widths
  worksheet.columns = [
    { key: 'name', width: 25 },
    { key: 'department', width: 20 },
    { key: 'position', width: 20 },
    { key: 'date', width: 15 },
    { key: 'clockIn', width: 18 },
    { key: 'clockOut', width: 18 },
    { key: 'workHours', width: 12 },
    { key: 'lateMinutes', width: 12 },
    { key: 'location', width: 30 },
    { key: 'status', width: 15 }
  ];

  // Data rows
  attendances.forEach(att => {
    const workHours = calculateWorkHours(att.clockIn, att.clockOut);
    const lateMinutes = calculateLateMinutes(att.clockIn, att.shift);
    
    const row = worksheet.addRow({
      name: att.User?.name || 'N/A',
      department: att.User?.department || 'N/A',
      position: att.User?.position || 'N/A',
      date: formatDate(att.date),
      clockIn: att.clockIn ? formatTime(att.clockIn) : '-',
      clockOut: att.clockOut ? formatTime(att.clockOut) : '-',
      workHours: workHours || '-',
      lateMinutes: lateMinutes > 0 ? lateMinutes : 0,
      location: att.office_location?.name || att.clockInLatitude ? `GPS: ${att.clockInLatitude}, ${att.clockInLongitude}` : '-',
      status: att.status || 'N/A'
    });

    // Status color coding
    const statusCell = row.getCell(10);
    if (att.status === 'ON_TIME') {
      statusCell.font = { color: { argb: 'FF28A745' }, bold: true };
    } else if (att.status === 'LATE') {
      statusCell.font = { color: { argb: 'FFFFC107' }, bold: true };
    } else if (att.status === 'ABSENT') {
      statusCell.font = { color: { argb: 'FFDC3545' }, bold: true };
    }

    // Borders
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  return await workbook.xlsx.writeBuffer();
}

function generateAttendanceCSV(attendances) {
  const { Parser } = require('json2csv');
  const data = attendances.map(att => ({
    'Employee Name': att.User?.name || 'N/A',
    'Department': att.User?.department || 'N/A',
    'Position': att.User?.position || 'N/A',
    'Date': formatDate(att.date),
    'Clock In': att.clockIn ? formatTime(att.clockIn) : '-',
    'Clock Out': att.clockOut ? formatTime(att.clockOut) : '-',
    'Work Hours': calculateWorkHours(att.clockIn, att.clockOut) || '-',
    'Late (minutes)': calculateLateMinutes(att.clockIn, att.shift),
    'Location': att.office_location?.name || (att.clockInLatitude ? `GPS: ${att.clockInLatitude}, ${att.clockInLongitude}` : '-'),
    'Status': att.status || 'N/A'
  }));

  const parser = new Parser();
  return parser.parse(data);
}

/**
 * B. MONTHLY RECAP REPORT - For Payroll
 */
async function generateMonthlyRecapReport(attendances, overtimes, leaveRequests, groupBy = 'employee') {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  
  if (groupBy === 'employee') {
    const worksheet = workbook.addWorksheet('Monthly Recap by Employee');
    
    // Group data by employee
    const employeeData = groupAttendancesByEmployee(attendances, overtimes, leaveRequests);
    
    // Title
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 MONTHLY RECAP REPORT - BY EMPLOYEE';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF28A745' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Headers
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Employee Name',
      'Department',
      'Total Present',
      'Total Late',
      'Total Absent',
      'Total Work Hours',
      'Overtime Hours',
      'Leave Days'
    ]);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Data
    Object.values(employeeData).forEach(emp => {
      worksheet.addRow([
        emp.name,
        emp.department,
        emp.totalPresent,
        emp.totalLate,
        emp.totalAbsent,
        emp.totalWorkHours.toFixed(2),
        emp.overtimeHours.toFixed(2),
        emp.leaveDays
      ]);
    });

    // Column widths
    worksheet.columns = [
      { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 18 }, { width: 15 }, { width: 15 }
    ];

  } else if (groupBy === 'department') {
    const worksheet = workbook.addWorksheet('Monthly Recap by Department');
    
    // Group data by department
    const deptData = groupAttendancesByDepartment(attendances, overtimes, leaveRequests);
    
    // Similar structure for department view
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 MONTHLY RECAP REPORT - BY DEPARTMENT';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF28A745' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Department',
      'Total Employees',
      'Avg Attendance',
      'Total Late',
      'Total Absent',
      'Total Work Hours',
      'Overtime Hours'
    ]);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    Object.values(deptData).forEach(dept => {
      worksheet.addRow([
        dept.name,
        dept.employeeCount,
        dept.avgAttendance.toFixed(2) + '%',
        dept.totalLate,
        dept.totalAbsent,
        dept.totalWorkHours.toFixed(2),
        dept.overtimeHours.toFixed(2)
      ]);
    });

    worksheet.columns = [
      { width: 25 }, { width: 18 }, { width: 18 }, { width: 15 },
      { width: 15 }, { width: 18 }, { width: 15 }
    ];
  }

  return await workbook.xlsx.writeBuffer();
}

/**
 * C. OVERTIME REPORT
 */
async function generateOvertimeReport(overtimes) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Overtime Report');

  // Title
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '⏰ OVERTIME REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Department',
    'Date',
    'Overtime Hours',
    'Reason',
    'Approved By',
    'Status'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data
  overtimes.forEach(ot => {
    const row = worksheet.addRow([
      ot.employee?.name || 'N/A',
      ot.employee?.department || 'N/A',
      formatDate(ot.overtimeDate),
      ot.actualHours || ot.requestedHours,
      ot.reason,
      ot.approver?.name || '-',
      ot.status
    ]);

    // Status color
    const statusCell = row.getCell(7);
    if (ot.status === 'approved') {
      statusCell.font = { color: { argb: 'FF28A745' }, bold: true };
    } else if (ot.status === 'pending') {
      statusCell.font = { color: { argb: 'FFFFC107' }, bold: true };
    } else if (ot.status === 'rejected') {
      statusCell.font = { color: { argb: 'FFDC3545' }, bold: true };
    }
  });

  worksheet.columns = [
    { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 },
    { width: 35 }, { width: 20 }, { width: 15 }
  ];

  return await workbook.xlsx.writeBuffer();
}

/**
 * D. LEAVE REPORT
 */
async function generateLeaveReport(leaveRequests) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Leave Report');

  // Title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '🏖️ LEAVE REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C5CE7' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Department',
    'Leave Type',
    'Start Date',
    'End Date',
    'Duration (days)',
    'Status',
    'Remaining Leave'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data
  leaveRequests.forEach(leave => {
    const duration = calculateLeaveDuration(leave.startDate, leave.endDate);
    const row = worksheet.addRow([
      leave.employee?.name || 'N/A',
      leave.employee?.department || 'N/A',
      leave.leaveType,
      formatDate(leave.startDate),
      formatDate(leave.endDate),
      duration,
      leave.status,
      leave.employee?.remainingLeaveQuota || 0
    ]);

    // Status color
    const statusCell = row.getCell(7);
    if (leave.status === 'APPROVED') {
      statusCell.font = { color: { argb: 'FF28A745' }, bold: true };
    } else if (leave.status === 'PENDING') {
      statusCell.font = { color: { argb: 'FFFFC107' }, bold: true };
    } else if (leave.status === 'REJECTED') {
      statusCell.font = { color: { argb: 'FFDC3545' }, bold: true };
    }
  });

  worksheet.columns = [
    { width: 25 }, { width: 20 }, { width: 18 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 15 }, { width: 18 }
  ];

  return await workbook.xlsx.writeBuffer();
}

/**
 * E. PAYROLL SUPPORT REPORT
 */
async function generatePayrollSupportReport(attendances, overtimes, leaveRequests, period) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payroll Support');

  // Group by employee
  const employeeData = {};

  attendances.forEach(att => {
    const userId = att.UserId;
    if (!employeeData[userId]) {
      employeeData[userId] = {
        name: att.User?.name,
        department: att.User?.department,
        position: att.User?.position,
        totalWorkingDays: 0,
        totalWorkHours: 0,
        overtimeHours: 0,
        lateCount: 0,
        lateTotalMinutes: 0,
        absentDays: 0,
        unpaidLeaveDays: 0
      };
    }

    if (att.status === 'ON_TIME' || att.status === 'LATE') {
      employeeData[userId].totalWorkingDays++;
      const hours = calculateWorkHours(att.clockIn, att.clockOut);
      if (hours) employeeData[userId].totalWorkHours += parseFloat(hours);
    }

    if (att.status === 'LATE') {
      employeeData[userId].lateCount++;
      const lateMin = calculateLateMinutes(att.clockIn, att.shift);
      employeeData[userId].lateTotalMinutes += lateMin;
    }

    if (att.status === 'ABSENT') {
      employeeData[userId].absentDays++;
    }
  });

  // Add overtime data
  overtimes.forEach(ot => {
    if (ot.status === 'approved' && employeeData[ot.UserId]) {
      employeeData[ot.UserId].overtimeHours += parseFloat(ot.actualHours || ot.requestedHours);
    }
  });

  // Add leave data (unpaid leave)
  leaveRequests.forEach(leave => {
    if (leave.status === 'APPROVED' && leave.leaveType === 'unpaid_leave' && employeeData[leave.UserId]) {
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);
      employeeData[leave.UserId].unpaidLeaveDays += duration;
    }
  });

  // Title
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '💰 PAYROLL SUPPORT REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2ECC71' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Period info
  worksheet.addRow([]);
  const periodRow = worksheet.addRow([`Period: ${period || 'N/A'}`]);
  periodRow.font = { italic: true, bold: true };

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Department',
    'Position',
    'Total Working Days',
    'Total Work Hours',
    'Overtime Hours',
    'Late Count',
    'Late Penalty (min)',
    'Absent Days',
    'Unpaid Leave Days'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data
  Object.values(employeeData).forEach(emp => {
    worksheet.addRow([
      emp.name,
      emp.department,
      emp.position,
      emp.totalWorkingDays,
      emp.totalWorkHours.toFixed(2),
      emp.overtimeHours.toFixed(2),
      emp.lateCount,
      emp.lateTotalMinutes,
      emp.absentDays,
      emp.unpaidLeaveDays
    ]);
  });

  worksheet.columns = [
    { width: 25 }, { width: 20 }, { width: 20 }, { width: 18 },
    { width: 18 }, { width: 15 }, { width: 12 }, { width: 18 },
    { width: 15 }, { width: 18 }
  ];

  return await workbook.xlsx.writeBuffer();
}

/**
 * F. LOCATION & GPS REPORT
 */
async function generateLocationGPSReport(attendances) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Location & GPS Report');

  // Title
  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '📍 LOCATION & GPS REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFD79A8' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Date',
    'Clock In Location',
    'Clock In GPS',
    'Distance (m)',
    'Clock Out Location',
    'Clock Out GPS',
    'Validation Status',
    'Status'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data
  attendances.forEach(att => {
    const clockInGPS = att.clockInLatitude && att.clockInLongitude 
      ? `${att.clockInLatitude}, ${att.clockInLongitude}` 
      : '-';
    
    const clockOutGPS = att.clockOutLatitude && att.clockOutLongitude 
      ? `${att.clockOutLatitude}, ${att.clockOutLongitude}` 
      : '-';

    const row = worksheet.addRow([
      att.User?.name || 'N/A',
      formatDate(att.date),
      att.office_location?.name || '-',
      clockInGPS,
      att.distance || '-',
      att.office_location?.name || '-',
      clockOutGPS,
      att.locationValidationStatus || 'not_checked',
      att.locationValidationStatus === 'inside_radius' ? 'Inside' : 
      att.locationValidationStatus === 'outside_radius' ? 'Outside' : 'N/A'
    ]);

    // Status color
    const statusCell = row.getCell(9);
    if (att.locationValidationStatus === 'inside_radius') {
      statusCell.font = { color: { argb: 'FF28A745' }, bold: true };
    } else if (att.locationValidationStatus === 'outside_radius') {
      statusCell.font = { color: { argb: 'FFDC3545' }, bold: true };
    }
  });

  worksheet.columns = [
    { width: 25 }, { width: 15 }, { width: 25 }, { width: 25 },
    { width: 15 }, { width: 25 }, { width: 25 }, { width: 20 }, { width: 15 }
  ];

  return await workbook.xlsx.writeBuffer();
}

/**
 * G. AUDIT LOG REPORT (ENTERPRISE)
 */
async function generateAuditLogReport(auditLogs) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Audit Log Report');

  // Title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '🔒 AUDIT LOG REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'User',
    'Action',
    'Module',
    'Record ID',
    'Before',
    'After',
    'Timestamp',
    'IP Address'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data
  auditLogs.forEach(log => {
    worksheet.addRow([
      log.user?.name || 'System',
      log.action,
      log.tableName,
      log.recordId || '-',
      log.oldData ? JSON.stringify(log.oldData).substring(0, 100) : '-',
      log.newData ? JSON.stringify(log.newData).substring(0, 100) : '-',
      formatDateTime(log.createdAt),
      log.ipAddress || '-'
    ]);
  });

  worksheet.columns = [
    { width: 20 }, { width: 15 }, { width: 20 }, { width: 15 },
    { width: 30 }, { width: 30 }, { width: 20 }, { width: 18 }
  ];

  return await workbook.xlsx.writeBuffer();
}

/**
 * H. COMPLIANCE / VIOLATION REPORT
 */
async function generateComplianceReport(attendances, config = {}) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Compliance Report');

  const violations = [];

  // Group by employee
  const employeeViolations = {};

  attendances.forEach(att => {
    const userId = att.UserId;
    if (!employeeViolations[userId]) {
      employeeViolations[userId] = {
        name: att.User?.name,
        department: att.User?.department,
        lateCount: 0,
        consecutiveAbsent: 0,
        noPhotoCount: 0,
        suspiciousGPS: 0
      };
    }

    // Count late
    if (att.status === 'LATE') {
      employeeViolations[userId].lateCount++;
    }

    // Check photo
    if (!att.photoCheckIn && (att.status === 'ON_TIME' || att.status === 'LATE')) {
      employeeViolations[userId].noPhotoCount++;
    }

    // Check GPS anomaly
    if (att.locationValidationStatus === 'outside_radius') {
      employeeViolations[userId].suspiciousGPS++;
    }
  });

  // Title
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '⚠️ COMPLIANCE / VIOLATION REPORT';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC3545' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Headers
  worksheet.addRow([]);
  const headerRow = worksheet.addRow([
    'Employee Name',
    'Department',
    'Late Count',
    'Clock-in w/o Photo',
    'GPS Violations',
    'Risk Level'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Data with risk level
  Object.values(employeeViolations).forEach(emp => {
    const totalViolations = emp.lateCount + emp.noPhotoCount + emp.suspiciousGPS;
    let riskLevel = 'Low';
    if (totalViolations > 10) riskLevel = 'High';
    else if (totalViolations > 5) riskLevel = 'Medium';

    const row = worksheet.addRow([
      emp.name,
      emp.department,
      emp.lateCount,
      emp.noPhotoCount,
      emp.suspiciousGPS,
      riskLevel
    ]);

    // Risk level color
    const riskCell = row.getCell(6);
    if (riskLevel === 'High') {
      riskCell.font = { color: { argb: 'FFDC3545' }, bold: true };
    } else if (riskLevel === 'Medium') {
      riskCell.font = { color: { argb: 'FFFFC107' }, bold: true };
    } else {
      riskCell.font = { color: { argb: 'FF28A745' }, bold: true };
    }
  });

  worksheet.columns = [
    { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 },
    { width: 18 }, { width: 15 }
  ];

  return await workbook.xlsx.writeBuffer();
}

// ============================================
// ADVANCED REPORT HELPER FUNCTIONS
// ============================================

function calculateLateMinutes(clockIn, shift) {
  if (!clockIn || !shift) return 0;
  
  const clockInTime = new Date(clockIn);
  const shiftStart = new Date(clockIn);
  const [hours, minutes] = (shift.startTime || '09:00').split(':');
  shiftStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const diff = clockInTime - shiftStart;
  const lateMinutes = Math.floor(diff / (1000 * 60));
  
  return lateMinutes > 0 ? lateMinutes : 0;
}

function calculateLeaveDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}

function groupAttendancesByEmployee(attendances, overtimes, leaveRequests) {
  const employeeData = {};

  attendances.forEach(att => {
    const userId = att.UserId;
    if (!employeeData[userId]) {
      employeeData[userId] = {
        name: att.User?.name,
        department: att.User?.department,
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalWorkHours: 0,
        overtimeHours: 0,
        leaveDays: 0
      };
    }

    if (att.status === 'ON_TIME') employeeData[userId].totalPresent++;
    if (att.status === 'LATE') {
      employeeData[userId].totalPresent++;
      employeeData[userId].totalLate++;
    }
    if (att.status === 'ABSENT') employeeData[userId].totalAbsent++;

    const hours = calculateWorkHours(att.clockIn, att.clockOut);
    if (hours) employeeData[userId].totalWorkHours += parseFloat(hours);
  });

  overtimes?.forEach(ot => {
    if (ot.status === 'approved' && employeeData[ot.UserId]) {
      employeeData[ot.UserId].overtimeHours += parseFloat(ot.actualHours || ot.requestedHours);
    }
  });

  leaveRequests?.forEach(leave => {
    if (leave.status === 'APPROVED' && employeeData[leave.UserId]) {
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);
      employeeData[leave.UserId].leaveDays += duration;
    }
  });

  return employeeData;
}

function groupAttendancesByDepartment(attendances, overtimes, leaveRequests) {
  const deptData = {};

  attendances.forEach(att => {
    const dept = att.User?.department || 'N/A';
    if (!deptData[dept]) {
      deptData[dept] = {
        name: dept,
        employeeCount: new Set(),
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalWorkHours: 0,
        overtimeHours: 0,
        avgAttendance: 0
      };
    }

    deptData[dept].employeeCount.add(att.UserId);

    if (att.status === 'ON_TIME' || att.status === 'LATE') deptData[dept].totalPresent++;
    if (att.status === 'LATE') deptData[dept].totalLate++;
    if (att.status === 'ABSENT') deptData[dept].totalAbsent++;

    const hours = calculateWorkHours(att.clockIn, att.clockOut);
    if (hours) deptData[dept].totalWorkHours += parseFloat(hours);
  });

  // Calculate average attendance
  Object.keys(deptData).forEach(dept => {
    const total = deptData[dept].totalPresent + deptData[dept].totalAbsent;
    deptData[dept].avgAttendance = total > 0 ? (deptData[dept].totalPresent / total) * 100 : 0;
    deptData[dept].employeeCount = deptData[dept].employeeCount.size;
  });

  return deptData;
}

function formatTime(datetime) {
  if (!datetime) return '-';
  return new Date(datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

module.exports = {
  calculateWorkHours,
  formatDate,
  formatDateTime,
  getMonthName,
  calculateAttendanceStats,
  groupAttendancesByUser,
  calculateStatusBreakdown,
  getCurrentMonthRange,
  getMonthRange,
  validateMonthYear,
  generateFileName,
  prepareCSVData,
  // Advanced report generators
  generateAttendanceReport,
  generateMonthlyRecapReport,
  generateOvertimeReport,
  generateLeaveReport,
  generatePayrollSupportReport,
  generateLocationGPSReport,
  generateAuditLogReport,
  generateComplianceReport,
  // Advanced helper functions
  calculateLateMinutes,
  calculateLeaveDuration,
  groupAttendancesByEmployee,
  groupAttendancesByDepartment,
  formatTime
};
