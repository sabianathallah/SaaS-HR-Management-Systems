const { Attendance, User, Overtime, LeaveRequest, AuditLog, OfficeLocation, Shift } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const AuditLogger = require('../helpers/auditLogger');
const {
  calculateWorkHours,
  formatDate,
  formatDateTime,
  getMonthName,
  calculateStatusBreakdown,
  prepareCSVData,
  generateFileName,
  // Advanced report generators
  generateAttendanceReport,
  generateMonthlyRecapReport,
  generateOvertimeReport,
  generateLeaveReport,
  generatePayrollSupportReport,
  generateLocationGPSReport,
  generateAuditLogReport,
  generateComplianceReport
} = require('../helpers/report');

// Export to Excel
exports.exportAttendanceExcel = async (req, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.date = { [Op.lte]: new Date(endDate) };
    }
    
    if (userId) where.UserId = userId;
    if (status) where.status = status;
    
    const attendances = await Attendance.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'position', 'department']
      }],
      order: [['date', 'DESC'], ['clockIn', 'DESC']]
    });
    
    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No attendance data found'
      });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');
    workbook.creator = 'HR Management System';
    workbook.created = new Date();
    
    // Add title section
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'ATTENDANCE REPORT';
    titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E75B6' }
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;
    
    // Add filter info
    worksheet.mergeCells('A2:H2');
    const filterCell = worksheet.getCell('A2');
    const filterInfo = [];
    if (startDate) filterInfo.push(`Start: ${formatDate(startDate)}`);
    if (endDate) filterInfo.push(`End: ${formatDate(endDate)}`);
    if (userId) filterInfo.push(`User ID: ${userId}`);
    if (status) filterInfo.push(`Status: ${status}`);
    filterCell.value = filterInfo.length > 0 ? `Filters: ${filterInfo.join(' | ')}` : 'No filters applied';
    filterCell.font = { italic: true, color: { argb: 'FF666666' } };
    filterCell.alignment = { horizontal: 'center' };
    
    // Add generated date
    worksheet.mergeCells('A3:H3');
    const dateCell = worksheet.getCell('A3');
    dateCell.value = `Generated: ${formatDateTime(new Date())}`;
    dateCell.font = { size: 10, color: { argb: 'FF666666' } };
    dateCell.alignment = { horizontal: 'center' };
    worksheet.getRow(3).height = 18;
    
    // Add empty row
    worksheet.addRow([]);
    
    // Define columns with headers
    worksheet.columns = [
      { header: 'User ID', key: 'userId', width: 12 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Clock In', key: 'clockIn', width: 18 },
      { header: 'Clock Out', key: 'clockOut', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Work Hours', key: 'workHours', width: 14 }
    ];
    
    // Style header row (row 5)
    const headerRow = worksheet.getRow(5);
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;
    
    // Add borders to header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Freeze header rows
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 5 }
    ];
    
    // Add auto-filter
    worksheet.autoFilter = {
      from: 'A5',
      to: 'I5'
    };
    
    // Add data rows
    let totalWorkHours = 0;
    const statusCount = {};
    
    attendances.forEach((att, index) => {
      const workHours = calculateWorkHours(att.clockIn, att.clockOut);
      totalWorkHours += parseFloat(workHours);
      
      // Count status
      statusCount[att.status] = (statusCount[att.status] || 0) + 1;
      
      const row = worksheet.addRow({
        userId: att.UserId,
        employeeName: att.User?.name || '-',
        position: att.User?.position || '-',
        department: att.User?.department || '-',
        date: formatDate(att.date),
        clockIn: formatDateTime(att.clockIn),
        clockOut: formatDateTime(att.clockOut),
        status: att.status,
        workHours: parseFloat(workHours)
      });
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      }
      
      // Center align certain columns
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(9).alignment = { horizontal: 'right' };
      
      // Number format for work hours
      row.getCell(9).numFmt = '#,##0.00';
      
      // Conditional formatting for status
      const statusCell = row.getCell(8);
      statusCell.font = { bold: true };
      
      switch(att.status) {
        case 'ON_TIME':
          statusCell.font.color = { argb: 'FF008000' };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F4EA' }
          };
          break;
        case 'LATE':
          statusCell.font.color = { argb: 'FFFF8C00' };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF4E6' }
          };
          break;
        case 'ABSENT':
          statusCell.font.color = { argb: 'FFDC3545' };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEAEA' }
          };
          break;
        case 'LEAVE':
        case 'SICK_LEAVE':
        case 'PERMISSION':
          statusCell.font.color = { argb: 'FF6C757D' };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
          break;
      }
      
      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    });
    
    // Add summary section
    const summaryStartRow = worksheet.rowCount + 2;
    
    // Summary title
    worksheet.mergeCells(`A${summaryStartRow}:I${summaryStartRow}`);
    const summaryTitle = worksheet.getCell(`A${summaryStartRow}`);
    summaryTitle.value = 'SUMMARY';
    summaryTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    summaryTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E75B6' }
    };
    summaryTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(summaryStartRow).height = 25;
    
    // Total records
    const totalRecordsRow = summaryStartRow + 1;
    worksheet.mergeCells(`A${totalRecordsRow}:B${totalRecordsRow}`);
    worksheet.getCell(`A${totalRecordsRow}`).value = 'Total Records:';
    worksheet.getCell(`A${totalRecordsRow}`).font = { bold: true };
    worksheet.getCell(`C${totalRecordsRow}`).value = attendances.length;
    worksheet.getCell(`C${totalRecordsRow}`).numFmt = '#,##0';
    
    // Total work hours
    const totalHoursRow = totalRecordsRow + 1;
    worksheet.mergeCells(`A${totalHoursRow}:B${totalHoursRow}`);
    worksheet.getCell(`A${totalHoursRow}`).value = 'Total Work Hours:';
    worksheet.getCell(`A${totalHoursRow}`).font = { bold: true };
    worksheet.getCell(`C${totalHoursRow}`).value = totalWorkHours;
    worksheet.getCell(`C${totalHoursRow}`).numFmt = '#,##0.00';
    
    // Average work hours
    const avgHoursRow = totalHoursRow + 1;
    worksheet.mergeCells(`A${avgHoursRow}:B${avgHoursRow}`);
    worksheet.getCell(`A${avgHoursRow}`).value = 'Average Work Hours:';
    worksheet.getCell(`A${avgHoursRow}`).font = { bold: true };
    worksheet.getCell(`C${avgHoursRow}`).value = totalWorkHours / attendances.length;
    worksheet.getCell(`C${avgHoursRow}`).numFmt = '#,##0.00';
    
    // Status breakdown
    const statusRow = avgHoursRow + 2;
    worksheet.mergeCells(`A${statusRow}:C${statusRow}`);
    worksheet.getCell(`A${statusRow}`).value = 'Status Breakdown:';
    worksheet.getCell(`A${statusRow}`).font = { bold: true, size: 12 };
    
    let currentRow = statusRow + 1;
    Object.entries(statusCount).forEach(([status, count]) => {
      worksheet.getCell(`A${currentRow}`).value = status;
      worksheet.getCell(`B${currentRow}`).value = count;
      worksheet.getCell(`B${currentRow}`).numFmt = '#,##0';
      worksheet.getCell(`C${currentRow}`).value = (count / attendances.length) * 100;
      worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00"%"';
      currentRow++;
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { action: 'export_to_excel', recordCount: attendances.length },
      ipAddress: req.ip
    });
    
    const fileName = `Attendance_Report_${formatDate(new Date()).replace(/\//g, '-')}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to export attendance data to Excel',
      error: error.message
    });
  }
};

// Export to CSV
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.date = { [Op.lte]: new Date(endDate) };
    }
    
    if (userId) where.UserId = userId;
    if (status) where.status = status;
    
    const attendances = await Attendance.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'position', 'department']
      }],
      order: [['date', 'DESC'], ['clockIn', 'DESC']]
    });
    
    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No attendance data found'
      });
    }
    
    const data = prepareCSVData(attendances);
    
    const fields = [
      'User ID', 
      'Employee Name', 
      'Email',
      'Position',
      'Department',
      'Date', 
      'Clock In', 
      'Clock Out', 
      'Status', 
      'Work Hours'
    ];
    
    const json2csvParser = new Parser({ 
      fields,
      delimiter: ',',
      quote: '"',
      header: true
    });
    const csv = json2csvParser.parse(data);
    
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { action: 'export_to_csv', recordCount: attendances.length },
      ipAddress: req.ip
    });
    
    const fileName = `Attendance_Report_${formatDate(new Date()).replace(/\//g, '-')}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Add BOM for proper Excel UTF-8 support
    return res.send('\ufeff' + csv);
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to export attendance data to CSV',
      error: error.message
    });
  }
};

// Monthly Report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Month and year parameters are required'
      });
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        status: 'error',
        message: 'Month must be between 1 and 12'
      });
    }
    
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
    
    const attendances = await Attendance.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'position', 'department']
      }],
      order: [['date', 'ASC']]
    });
    
    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No attendance data found for ${month}/${year}`
      });
    }
    
    const userStatsMap = {};
    
    attendances.forEach(att => {
      const userId = att.UserId;
      
      if (!userStatsMap[userId]) {
        userStatsMap[userId] = {
          userId: userId,
          userName: att.User?.name || 'Unknown',
          position: att.User?.position || '-',
          department: att.User?.department || '-',
          totalDays: 0,
          present: 0,
          late: 0,
          absent: 0,
          leave: 0,
          workHours: 0
        };
      }
      
      const stats = userStatsMap[userId];
      stats.totalDays++;
      
      if (att.status === 'ON_TIME') stats.present++;
      else if (att.status === 'LATE') { stats.late++; stats.present++; }
      else if (att.status === 'ABSENT') stats.absent++;
      else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) stats.leave++;
      
      stats.workHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
    });
    
    const userStats = Object.values(userStatsMap).map(stats => {
      const workingDays = stats.totalDays - stats.leave;
      const attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100) : 0;
      return { 
        ...stats, 
        workHours: parseFloat(stats.workHours.toFixed(2)), 
        attendanceRate: parseFloat(attendanceRate.toFixed(2))
      };
    });
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HR Management System';
    workbook.created = new Date();
    
    // ===== SUMMARY SHEET =====
    const summarySheet = workbook.addWorksheet('Monthly Summary');
    
    // Title
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `MONTHLY ATTENDANCE REPORT - ${getMonthName(monthNum).toUpperCase()} ${yearNum}`;
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getRow(1).height = 35;
    
    // Period Info
    summarySheet.mergeCells('A2:F2');
    const periodCell = summarySheet.getCell('A2');
    periodCell.value = `Period: ${formatDate(startDate)} - ${formatDate(endDate)}`;
    periodCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
    periodCell.alignment = { horizontal: 'center' };
    summarySheet.getRow(2).height = 20;
    
    // Generated Date
    summarySheet.mergeCells('A3:F3');
    const genCell = summarySheet.getCell('A3');
    genCell.value = `Generated: ${formatDateTime(new Date())}`;
    genCell.font = { size: 10, color: { argb: 'FF999999' } };
    genCell.alignment = { horizontal: 'center' };
    
    summarySheet.addRow([]);
    
    // Overall Statistics Section
    summarySheet.mergeCells('A5:F5');
    const overallTitle = summarySheet.getCell('A5');
    overallTitle.value = 'OVERALL STATISTICS';
    overallTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    overallTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    overallTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(5).height = 25;
    
    const totalWorkHours = attendances.reduce((sum, att) => sum + parseFloat(calculateWorkHours(att.clockIn, att.clockOut)), 0);
    const avgWorkHours = attendances.length > 0 ? totalWorkHours / attendances.length : 0;
    
    const statsData = [
      ['Total Records:', attendances.length],
      ['Total Employees:', userStats.length],
      ['Total Work Hours:', totalWorkHours.toFixed(2)],
      ['Average Work Hours:', avgWorkHours.toFixed(2)],
      ['Working Days:', new Date(yearNum, monthNum, 0).getDate()]
    ];
    
    let currentRow = 6;
    statsData.forEach(([label, value]) => {
      summarySheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const labelCell = summarySheet.getCell(`A${currentRow}`);
      labelCell.value = label;
      labelCell.font = { bold: true, size: 11 };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      
      summarySheet.mergeCells(`D${currentRow}:F${currentRow}`);
      const valueCell = summarySheet.getCell(`D${currentRow}`);
      valueCell.value = value;
      valueCell.font = { size: 11 };
      valueCell.numFmt = typeof value === 'number' ? '#,##0.00' : '@';
      valueCell.alignment = { horizontal: 'right' };
      
      currentRow++;
    });
    
    // Status Breakdown Section
    currentRow += 1;
    summarySheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const statusTitle = summarySheet.getCell(`A${currentRow}`);
    statusTitle.value = 'STATUS BREAKDOWN';
    statusTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    statusTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    statusTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(currentRow).height = 25;
    
    currentRow++;
    const statusCounts = attendances.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {});
    
    // Status header
    summarySheet.getCell(`A${currentRow}`).value = 'Status';
    summarySheet.getCell(`B${currentRow}`).value = 'Count';
    summarySheet.getCell(`C${currentRow}`).value = 'Percentage';
    summarySheet.getRow(currentRow).font = { bold: true };
    summarySheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    
    currentRow++;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = (count / attendances.length) * 100;
      summarySheet.getCell(`A${currentRow}`).value = status;
      summarySheet.getCell(`B${currentRow}`).value = count;
      summarySheet.getCell(`B${currentRow}`).numFmt = '#,##0';
      summarySheet.getCell(`C${currentRow}`).value = percentage / 100;
      summarySheet.getCell(`C${currentRow}`).numFmt = '0.00%';
      
      // Color coding
      let bgColor = 'FFFFFFFF';
      switch(status) {
        case 'ON_TIME': bgColor = 'FFE6F4EA'; break;
        case 'LATE': bgColor = 'FFFFF4E6'; break;
        case 'ABSENT': bgColor = 'FFFFEAEA'; break;
        case 'LEAVE':
        case 'SICK_LEAVE':
        case 'PERMISSION': bgColor = 'FFF8F9FA'; break;
      }
      
      summarySheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      currentRow++;
    });
    
    // Set column widths
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 15;
    summarySheet.getColumn(3).width = 15;
    summarySheet.getColumn(4).width = 15;
    summarySheet.getColumn(5).width = 15;
    summarySheet.getColumn(6).width = 15;
    
    // ===== EMPLOYEE STATISTICS SHEET =====
    const employeeSheet = workbook.addWorksheet('Employee Statistics');
    
    // Title
    employeeSheet.mergeCells('A1:I1');
    const empTitleCell = employeeSheet.getCell('A1');
    empTitleCell.value = 'EMPLOYEE STATISTICS';
    empTitleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    empTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    empTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    employeeSheet.getRow(1).height = 30;
    
    employeeSheet.addRow([]);
    employeeSheet.addRow([]);
    
    // Define columns
    employeeSheet.columns = [
      { header: 'Employee ID', key: 'userId', width: 12 },
      { header: 'Employee Name', key: 'userName', width: 25 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Late', key: 'late', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: 'Work Hours', key: 'workHours', width: 12 },
      { header: 'Attendance %', key: 'attendanceRate', width: 14 }
    ];
    
    // Style header row (row 3)
    const empHeaderRow = employeeSheet.getRow(3);
    empHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    empHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    empHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    empHeaderRow.height = 25;
    
    empHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Freeze header
    employeeSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];
    
    // Add auto-filter
    employeeSheet.autoFilter = { from: 'A3', to: 'J3' };
    
    // Add data
    userStats.forEach((stats, index) => {
      const row = employeeSheet.addRow({
        ...stats,
        attendanceRate: stats.attendanceRate / 100
      });
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
      
      // Alignment
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(9).alignment = { horizontal: 'right' };
      row.getCell(10).alignment = { horizontal: 'right' };
      
      // Number formatting
      row.getCell(9).numFmt = '#,##0.00';
      row.getCell(10).numFmt = '0.00%';
      
      // Conditional formatting for attendance rate
      const attendanceCell = row.getCell(10);
      if (stats.attendanceRate >= 95) {
        attendanceCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (stats.attendanceRate >= 80) {
        attendanceCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
      } else {
        attendanceCell.font = { color: { argb: 'FFDC3545' }, bold: true };
      }
      
      // Borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    });
    
    // ===== DETAILED ATTENDANCE SHEET =====
    const detailSheet = workbook.addWorksheet('Detailed Attendance');
    
    // Title
    detailSheet.mergeCells('A1:I1');
    const detailTitleCell = detailSheet.getCell('A1');
    detailTitleCell.value = 'DETAILED ATTENDANCE';
    detailTitleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    detailTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    detailTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    detailSheet.getRow(1).height = 30;
    
    detailSheet.addRow([]);
    detailSheet.addRow([]);
    
    detailSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User ID', key: 'userId', width: 12 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Clock In', key: 'clockIn', width: 18 },
      { header: 'Clock Out', key: 'clockOut', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Work Hours', key: 'workHours', width: 12 }
    ];
    
    // Style header row (row 3)
    const detailHeaderRow = detailSheet.getRow(3);
    detailHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    detailHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    detailHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    detailHeaderRow.height = 25;
    
    detailHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Freeze header
    detailSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];
    
    // Add auto-filter
    detailSheet.autoFilter = { from: 'A3', to: 'I3' };
    
    attendances.forEach((att, index) => {
      const workHours = parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
      const row = detailSheet.addRow({
        date: formatDate(att.date),
        userId: att.UserId,
        employeeName: att.User?.name || '-',
        position: att.User?.position || '-',
        department: att.User?.department || '-',
        clockIn: formatDateTime(att.clockIn),
        clockOut: formatDateTime(att.clockOut),
        status: att.status,
        workHours: workHours
      });
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
      
      // Alignment
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(9).alignment = { horizontal: 'right' };
      
      // Number formatting
      row.getCell(9).numFmt = '#,##0.00';
      
      // Status color coding
      const statusCell = row.getCell(8);
      statusCell.font = { bold: true };
      
      switch(att.status) {
        case 'ON_TIME':
          statusCell.font.color = { argb: 'FF008000' };
          break;
        case 'LATE':
          statusCell.font.color = { argb: 'FFFF8C00' };
          break;
        case 'ABSENT':
          statusCell.font.color = { argb: 'FFDC3545' };
          break;
        default:
          statusCell.font.color = { argb: 'FF6C757D' };
      }
      
      // Borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { action: 'generate_monthly_report', month: monthNum, year: yearNum, recordCount: attendances.length },
      ipAddress: req.ip
    });
    
    const fileName = `Monthly_Report_${getMonthName(monthNum)}_${yearNum}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);
    
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate monthly report',
      error: error.message
    });
  }
};

// Preview Report
exports.getReportPreview = async (req, res) => {
  try {
    const { startDate, endDate, userId, status, limit = 100 } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.date = { [Op.lte]: new Date(endDate) };
    }
    
    if (userId) where.UserId = userId;
    if (status) where.status = status;
    
    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['date', 'DESC'], ['clockIn', 'DESC']],
      limit: parseInt(limit)
    });
    
    const summary = {
      totalRecords: count,
      previewRecords: rows.length,
      totalWorkHours: rows.reduce((sum, att) => sum + parseFloat(calculateWorkHours(att.clockIn, att.clockOut)), 0).toFixed(2),
      statusBreakdown: calculateStatusBreakdown(rows)
    };
    
    return res.status(200).json({
      status: 'success',
      message: 'Report preview retrieved successfully',
      data: { summary, attendances: rows, filters: { startDate, endDate, userId, status } }
    });
    
  } catch (error) {
    console.error('Error getting report preview:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get report preview',
      error: error.message
    });
  }
};

// Employee Performance
exports.getEmployeePerformanceReport = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const where = { UserId: userId };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      where.date = { [Op.between]: [firstDay, lastDay] };
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const attendances = await Attendance.findAll({
      where,
      order: [['date', 'ASC']]
    });
    
    const stats = {
      totalDays: attendances.length,
      onTime: 0,
      late: 0,
      absent: 0,
      leave: 0,
      totalWorkHours: 0,
      averageWorkHours: 0,
      attendanceRate: 0
    };
    
    attendances.forEach(att => {
      if (att.status === 'ON_TIME') stats.onTime++;
      else if (att.status === 'LATE') stats.late++;
      else if (att.status === 'ABSENT') stats.absent++;
      else if (['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(att.status)) stats.leave++;
      
      stats.totalWorkHours += parseFloat(calculateWorkHours(att.clockIn, att.clockOut));
    });
    
    const workingDays = stats.totalDays - stats.leave;
    const presentDays = stats.onTime + stats.late;
    
    stats.averageWorkHours = workingDays > 0 ? (stats.totalWorkHours / workingDays).toFixed(2) : '0.00';
    stats.attendanceRate = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(2) : '0.00';
    stats.totalWorkHours = stats.totalWorkHours.toFixed(2);
    
    return res.status(200).json({
      status: 'success',
      message: 'Employee performance report retrieved successfully',
      data: {
        employee: user,
        period: { startDate: where.date[Op.between][0], endDate: where.date[Op.between][1] },
        statistics: stats,
        attendances
      }
    });
    
  } catch (error) {
    console.error('Error getting employee performance report:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get employee performance report',
      error: error.message
    });
  }
};

/**
 * ============================================
 * ADVANCED REPORT METHODS
 * ============================================
 */

/**
 * A. ATTENDANCE REPORT
 * GET /reports/attendance
 * Most frequently used report
 */
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, locationId, status, format = 'excel' } = req.query;
    
    const where = {};
    
    // Date filter
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.date = { [Op.lte]: new Date(endDate) };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Location filter
    if (locationId) {
      where.OfficeLocationId = locationId;
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'position', 'department'],
          where: department ? { department } : undefined,
          required: false
        },
        {
          model: OfficeLocation,
          as: 'office_location',
          attributes: ['id', 'name', 'address'],
          required: false
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name', 'startTime', 'endTime'],
          required: false
        }
      ],
      order: [['date', 'DESC'], ['clockIn', 'DESC']]
    });

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No attendance data found for the specified criteria'
      });
    }

    // Generate report
    const buffer = await generateAttendanceReport(attendances, format);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { 
        reportType: 'attendance',
        format,
        recordCount: attendances.length,
        filters: { startDate, endDate, department, locationId, status }
      },
      ipAddress: req.ip
    });

    const fileName = `Attendance_Report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.send(buffer);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.send(buffer);
    }

  } catch (error) {
    console.error('Error generating attendance report:', error);
    next(error);
  }
};

/**
 * B. MONTHLY RECAP REPORT
 * GET /reports/monthly-recap
 * For payroll processing
 */
exports.getMonthlyRecapReport = async (req, res, next) => {
  try {
    const { month, year, groupBy = 'employee' } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Month and year are required'
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        status: 'error',
        message: 'Month must be between 1 and 12'
      });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Fetch all data for the month
    const attendances = await Attendance.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'position', 'department'],
          required: false
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name', 'startTime', 'endTime'],
          required: false
        }
      ]
    });

    const overtimes = await Overtime.findAll({
      where: { 
        overtimeDate: { [Op.between]: [startDate, endDate] },
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'name', 'department']
        }
      ]
    });

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        status: 'APPROVED',
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'name', 'department'],
          required: false
        }
      ]
    });

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No attendance data found for ${month}/${year}`
      });
    }

    // Generate report
    const buffer = await generateMonthlyRecapReport(attendances, overtimes, leaveRequests, groupBy);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { 
        reportType: 'monthly-recap',
        month: monthNum,
        year: yearNum,
        groupBy,
        recordCount: attendances.length
      },
      ipAddress: req.ip
    });

    const fileName = `Monthly_Recap_${month}_${year}_${groupBy}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating monthly recap report:', error);
    next(error);
  }
};

/**
 * C. OVERTIME REPORT
 * GET /reports/overtime
 */
exports.getOvertimeReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, userId, department } = req.query;

    const where = {};

    // Date filter
    if (startDate && endDate) {
      where.overtimeDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.overtimeDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.overtimeDate = { [Op.lte]: new Date(endDate) };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // User filter
    if (userId) {
      where.UserId = userId;
    }

    const overtimes = await Overtime.findAll({
      where,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'position', 'department'],
          where: department ? { department } : undefined,
          required: false
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['overtimeDate', 'DESC']]
    });

    if (overtimes.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No overtime data found'
      });
    }

    // Generate report
    const buffer = await generateOvertimeReport(overtimes);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Overtimes',
      recordId: null,
      newData: { 
        reportType: 'overtime',
        recordCount: overtimes.length,
        filters: { startDate, endDate, status, userId, department }
      },
      ipAddress: req.ip
    });

    const fileName = `Overtime_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating overtime report:', error);
    next(error);
  }
};

/**
 * D. LEAVE REPORT
 * GET /reports/leave
 */
exports.getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, leaveType, status, userId, department } = req.query;

    const where = {};

    // Date filter
    if (startDate && endDate) {
      where[Op.or] = [
        { startDate: { [Op.between]: [new Date(startDate), new Date(endDate)] } },
        { endDate: { [Op.between]: [new Date(startDate), new Date(endDate)] } }
      ];
    }

    // Leave type filter
    if (leaveType) {
      where.leaveType = leaveType;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // User filter
    if (userId) {
      where.UserId = userId;
    }

    const leaveRequests = await LeaveRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'position', 'department', 'remainingLeaveQuota', 'annualLeaveQuota'],
          where: department ? { department } : undefined,
          required: false
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['startDate', 'DESC']]
    });

    if (leaveRequests.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No leave data found'
      });
    }

    // Generate report
    const buffer = await generateLeaveReport(leaveRequests);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'LeaveRequests',
      recordId: null,
      newData: { 
        reportType: 'leave',
        recordCount: leaveRequests.length,
        filters: { startDate, endDate, leaveType, status, userId, department }
      },
      ipAddress: req.ip
    });

    const fileName = `Leave_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating leave report:', error);
    next(error);
  }
};

/**
 * E. PAYROLL SUPPORT REPORT
 * GET /reports/payroll-support
 */
exports.getPayrollSupportReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Month and year are required'
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        status: 'error',
        message: 'Month must be between 1 and 12'
      });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Fetch all data
    const attendances = await Attendance.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'position', 'department'],
          required: false
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name', 'startTime', 'endTime'],
          required: false
        }
      ]
    });

    const overtimes = await Overtime.findAll({
      where: { 
        overtimeDate: { [Op.between]: [startDate, endDate] },
        status: 'approved'
      }
    });

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        status: 'APPROVED',
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } }
        ]
      }
    });

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No data found for payroll report'
      });
    }

    const period = `${monthNum}/${yearNum}`;
    const buffer = await generatePayrollSupportReport(attendances, overtimes, leaveRequests, period);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { 
        reportType: 'payroll-support',
        month: monthNum,
        year: yearNum,
        recordCount: attendances.length
      },
      ipAddress: req.ip
    });

    const fileName = `Payroll_Support_${month}_${year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating payroll support report:', error);
    next(error);
  }
};

/**
 * F. LOCATION & GPS REPORT
 * GET /reports/location-gps
 */
exports.getLocationGPSReport = async (req, res, next) => {
  try {
    const { startDate, endDate, validationStatus } = req.query;

    const where = {};

    // Date filter
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // Only get records with GPS data
    where[Op.or] = [
      { clockInLatitude: { [Op.ne]: null } },
      { clockOutLatitude: { [Op.ne]: null } }
    ];

    // Validation status filter
    if (validationStatus) {
      where.locationValidationStatus = validationStatus;
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'position', 'department'],
          required: false
        },
        {
          model: OfficeLocation,
          as: 'office_location',
          attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'radius'],
          required: false
        }
      ],
      order: [['date', 'DESC']]
    });

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No GPS data found'
      });
    }

    // Generate report
    const buffer = await generateLocationGPSReport(attendances);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { 
        reportType: 'location-gps',
        recordCount: attendances.length,
        filters: { startDate, endDate, validationStatus }
      },
      ipAddress: req.ip
    });

    const fileName = `Location_GPS_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating location GPS report:', error);
    next(error);
  }
};

/**
 * G. AUDIT LOG REPORT
 * GET /reports/audit-log
 */
exports.getAuditLogReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId, module, action } = req.query;

    const where = {};

    // Date filter
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // User filter
    if (userId) {
      where.userId = userId;
    }

    // Module filter
    if (module) {
      where.tableName = module;
    }

    // Action filter
    if (action) {
      where.action = action;
    }

    const auditLogs = await AuditLog.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5000
    });

    if (auditLogs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No audit log data found'
      });
    }

    // Generate report
    const buffer = await generateAuditLogReport(auditLogs);

    // Audit log (recursive, tapi penting)
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'AuditLogs',
      recordId: null,
      newData: { 
        reportType: 'audit-log',
        recordCount: auditLogs.length,
        filters: { startDate, endDate, userId, module, action }
      },
      ipAddress: req.ip
    });

    const fileName = `Audit_Log_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating audit log report:', error);
    next(error);
  }
};

/**
 * H. COMPLIANCE / VIOLATION REPORT
 * GET /reports/compliance
 */
exports.getComplianceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;

    const where = {};

    // Date filter
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'position', 'department'],
          where: department ? { department } : undefined,
          required: false
        },
        {
          model: OfficeLocation,
          as: 'office_location',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['date', 'DESC']]
    });

    if (attendances.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No data found for compliance report'
      });
    }

    // Generate report
    const buffer = await generateComplianceReport(attendances);

    // Audit log
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { 
        reportType: 'compliance-violation',
        recordCount: attendances.length,
        filters: { startDate, endDate, department }
      },
      ipAddress: req.ip
    });

    const fileName = `Compliance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    return res.send(buffer);

  } catch (error) {
    console.error('Error generating compliance report:', error);
    next(error);
  }
};

/**
 * GET REPORT METADATA / PREVIEW
 * GET /reports/metadata
 */
exports.getReportMetadata = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const [
      totalAttendances,
      totalOvertimes,
      totalLeaves,
      totalDepartments,
      totalEmployees
    ] = await Promise.all([
      Attendance.count({ where }),
      Overtime.count({
        where: startDate && endDate ? {
          overtimeDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        } : {}
      }),
      LeaveRequest.count({
        where: startDate && endDate ? {
          startDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
        } : {}
      }),
      User.count({
        distinct: true,
        col: 'department',
        where: { department: { [Op.ne]: null } }
      }),
      User.count({ where: { isActive: true } })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Report metadata retrieved successfully',
      data: {
        period: { startDate, endDate },
        summary: {
          totalAttendances,
          totalOvertimes,
          totalLeaves,
          totalDepartments,
          totalEmployees
        },
        availableReports: [
          { id: 'attendance', name: 'Attendance Report', icon: '📊' },
          { id: 'monthly-recap', name: 'Monthly Recap', icon: '📅' },
          { id: 'overtime', name: 'Overtime Report', icon: '⏰' },
          { id: 'leave', name: 'Leave Report', icon: '🏖️' },
          { id: 'payroll-support', name: 'Payroll Support', icon: '💰' },
          { id: 'location-gps', name: 'Location & GPS', icon: '📍' },
          { id: 'audit-log', name: 'Audit Log', icon: '🔒' },
          { id: 'compliance', name: 'Compliance', icon: '⚠️' }
        ]
      }
    });

  } catch (error) {
    console.error('Error getting report metadata:', error);
    next(error);
  }
};
