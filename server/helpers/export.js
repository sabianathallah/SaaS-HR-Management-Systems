const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

/**
 * Export data attendance ke Excel
 * @param {Array} attendances - Data attendance yang akan di-export
 * @param {Object} options - Options untuk customize export
 * @returns {Buffer} Excel file buffer
 */
async function exportToExcel(attendances, options = {}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || 'Attendance Report');

  // Set properties
  workbook.creator = 'HR Management System';
  workbook.created = new Date();

  // Define columns
  worksheet.columns = [
    { header: 'Employee ID', key: 'userId', width: 15 },
    { header: 'Employee Name', key: 'userName', width: 25 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Check In', key: 'checkIn', width: 20 },
    { header: 'Check Out', key: 'checkOut', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Work Hours', key: 'workHours', width: 12 },
    { header: 'Overtime Hours', key: 'overtimeHours', width: 15 },
    { header: 'Shift', key: 'shiftName', width: 20 },
    { header: 'Location (Check In)', key: 'checkInLocation', width: 30 },
    { header: 'Location (Check Out)', key: 'checkOutLocation', width: 30 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  attendances.forEach(attendance => {
    const row = {
      userId: attendance.userId,
      userName: attendance['User.name'] || attendance.User?.name || '-',
      date: formatDate(attendance.date),
      checkIn: formatDateTime(attendance.checkInTime),
      checkOut: formatDateTime(attendance.checkOutTime),
      status: attendance.status,
      workHours: attendance.workHours ? parseFloat(attendance.workHours).toFixed(2) : '0.00',
      overtimeHours: attendance.overtimeHours ? parseFloat(attendance.overtimeHours).toFixed(2) : '0.00',
      shiftName: attendance['WorkSchedule.name'] || attendance.WorkSchedule?.name || '-',
      checkInLocation: attendance.checkInLocation || '-',
      checkOutLocation: attendance.checkOutLocation || '-',
      notes: attendance.notes || '-'
    };
    worksheet.addRow(row);
  });

  // Auto-fit columns (approximate)
  worksheet.columns.forEach(column => {
    if (column.width < 10) column.width = 10;
  });

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Add summary at the end if requested
  if (options.includeSummary) {
    const summaryRowNumber = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${summaryRowNumber}:B${summaryRowNumber}`);
    worksheet.getCell(`A${summaryRowNumber}`).value = 'Total Records:';
    worksheet.getCell(`C${summaryRowNumber}`).value = attendances.length;
    worksheet.getCell(`A${summaryRowNumber}`).font = { bold: true };
    
    const totalWorkHours = attendances.reduce((sum, att) => sum + (parseFloat(att.workHours) || 0), 0);
    const totalOvertimeHours = attendances.reduce((sum, att) => sum + (parseFloat(att.overtimeHours) || 0), 0);
    
    worksheet.mergeCells(`A${summaryRowNumber + 1}:B${summaryRowNumber + 1}`);
    worksheet.getCell(`A${summaryRowNumber + 1}`).value = 'Total Work Hours:';
    worksheet.getCell(`C${summaryRowNumber + 1}`).value = totalWorkHours.toFixed(2);
    worksheet.getCell(`A${summaryRowNumber + 1}`).font = { bold: true };
    
    worksheet.mergeCells(`A${summaryRowNumber + 2}:B${summaryRowNumber + 2}`);
    worksheet.getCell(`A${summaryRowNumber + 2}`).value = 'Total Overtime Hours:';
    worksheet.getCell(`C${summaryRowNumber + 2}`).value = totalOvertimeHours.toFixed(2);
    worksheet.getCell(`A${summaryRowNumber + 2}`).font = { bold: true };
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/**
 * Export data attendance ke CSV
 * @param {Array} attendances - Data attendance yang akan di-export
 * @param {Object} options - Options untuk customize export
 * @returns {String} CSV string
 */
function exportToCSV(attendances, options = {}) {
  const fields = [
    { label: 'Employee ID', value: 'userId' },
    { label: 'Employee Name', value: row => row['User.name'] || row.User?.name || '-' },
    { label: 'Date', value: row => formatDate(row.date) },
    { label: 'Check In', value: row => formatDateTime(row.checkInTime) },
    { label: 'Check Out', value: row => formatDateTime(row.checkOutTime) },
    { label: 'Status', value: 'status' },
    { label: 'Work Hours', value: row => row.workHours ? parseFloat(row.workHours).toFixed(2) : '0.00' },
    { label: 'Overtime Hours', value: row => row.overtimeHours ? parseFloat(row.overtimeHours).toFixed(2) : '0.00' },
    { label: 'Shift', value: row => row['WorkSchedule.name'] || row.WorkSchedule?.name || '-' },
    { label: 'Location (Check In)', value: row => row.checkInLocation || '-' },
    { label: 'Location (Check Out)', value: row => row.checkOutLocation || '-' },
    { label: 'Notes', value: row => row.notes || '-' }
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(attendances);
  
  return csv;
}

/**
 * Generate monthly report dengan statistik
 * @param {Array} attendances - Data attendance untuk bulan tertentu
 * @param {Object} userStats - Statistik per user
 * @returns {Buffer} Excel file buffer
 */
async function generateMonthlyReport(attendances, userStats, month, year) {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary Statistics
  const summarySheet = workbook.addWorksheet('Monthly Summary');
  
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = `Monthly Attendance Report - ${getMonthName(month)} ${year}`;
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };
  
  summarySheet.addRow([]);
  summarySheet.addRow(['Summary Statistics']);
  summarySheet.getCell('A3').font = { bold: true, size: 12 };
  
  // Overall statistics
  const totalRecords = attendances.length;
  const uniqueEmployees = new Set(attendances.map(a => a.userId)).size;
  const totalWorkHours = attendances.reduce((sum, att) => sum + (parseFloat(att.workHours) || 0), 0);
  const totalOvertimeHours = attendances.reduce((sum, att) => sum + (parseFloat(att.overtimeHours) || 0), 0);
  
  const statusCounts = attendances.reduce((acc, att) => {
    acc[att.status] = (acc[att.status] || 0) + 1;
    return acc;
  }, {});
  
  summarySheet.addRow(['Total Attendance Records:', totalRecords]);
  summarySheet.addRow(['Total Employees:', uniqueEmployees]);
  summarySheet.addRow(['Total Work Hours:', totalWorkHours.toFixed(2)]);
  summarySheet.addRow(['Total Overtime Hours:', totalOvertimeHours.toFixed(2)]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Attendance Status Breakdown:']);
  summarySheet.getCell('A9').font = { bold: true };
  
  let rowNum = 10;
  Object.entries(statusCounts).forEach(([status, count]) => {
    summarySheet.addRow([status, count, '', `${((count/totalRecords)*100).toFixed(2)}%`]);
    rowNum++;
  });
  
  summarySheet.columns = [
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];
  
  // Sheet 2: Employee Statistics
  const employeeSheet = workbook.addWorksheet('Employee Statistics');
  
  employeeSheet.columns = [
    { header: 'Employee ID', key: 'userId', width: 15 },
    { header: 'Employee Name', key: 'userName', width: 25 },
    { header: 'Total Days', key: 'totalDays', width: 12 },
    { header: 'Present', key: 'present', width: 10 },
    { header: 'Late', key: 'late', width: 10 },
    { header: 'Absent', key: 'absent', width: 10 },
    { header: 'Work Hours', key: 'workHours', width: 12 },
    { header: 'Overtime Hours', key: 'overtimeHours', width: 15 },
    { header: 'Attendance Rate', key: 'attendanceRate', width: 15 }
  ];
  
  employeeSheet.getRow(1).font = { bold: true };
  employeeSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  
  userStats.forEach(stat => {
    employeeSheet.addRow({
      userId: stat.userId,
      userName: stat.userName,
      totalDays: stat.totalDays,
      present: stat.present,
      late: stat.late,
      absent: stat.absent,
      workHours: parseFloat(stat.workHours).toFixed(2),
      overtimeHours: parseFloat(stat.overtimeHours).toFixed(2),
      attendanceRate: `${stat.attendanceRate}%`
    });
  });
  
  // Sheet 3: Detailed Attendance
  const detailSheet = workbook.addWorksheet('Detailed Attendance');
  
  detailSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Employee ID', key: 'userId', width: 15 },
    { header: 'Employee Name', key: 'userName', width: 25 },
    { header: 'Check In', key: 'checkIn', width: 20 },
    { header: 'Check Out', key: 'checkOut', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Work Hours', key: 'workHours', width: 12 },
    { header: 'Overtime Hours', key: 'overtimeHours', width: 15 }
  ];
  
  detailSheet.getRow(1).font = { bold: true };
  detailSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  };
  
  attendances.forEach(attendance => {
    detailSheet.addRow({
      date: formatDate(attendance.date),
      userId: attendance.userId,
      userName: attendance['User.name'] || attendance.User?.name || '-',
      checkIn: formatDateTime(attendance.checkInTime),
      checkOut: formatDateTime(attendance.checkOutTime),
      status: attendance.status,
      workHours: attendance.workHours ? parseFloat(attendance.workHours).toFixed(2) : '0.00',
      overtimeHours: attendance.overtimeHours ? parseFloat(attendance.overtimeHours).toFixed(2) : '0.00'
    });
  });
  
  // Apply borders to all sheets
  [summarySheet, employeeSheet, detailSheet].forEach(sheet => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/**
 * Helper functions
 */
function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

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

function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

module.exports = {
  exportToExcel,
  exportToCSV,
  generateMonthlyReport
};
