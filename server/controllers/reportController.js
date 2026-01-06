const { Attendance, User } = require('../models');
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
  generateFileName
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
        attributes: ['id', 'name', 'email']
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
    
    worksheet.columns = [
      { header: 'User ID', key: 'userId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Clock In', key: 'clockIn', width: 20 },
      { header: 'Clock Out', key: 'clockOut', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Work Hours', key: 'workHours', width: 12 }
    ];
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    
    let totalWorkHours = 0;
    attendances.forEach(att => {
      const workHours = calculateWorkHours(att.clockIn, att.clockOut);
      totalWorkHours += parseFloat(workHours);
      
      worksheet.addRow({
        userId: att.UserId,
        employeeName: att.User?.name || '-',
        date: formatDate(att.date),
        clockIn: formatDateTime(att.clockIn),
        clockOut: formatDateTime(att.clockOut),
        status: att.status,
        workHours: workHours
      });
    });
    
    const summaryRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
    worksheet.getCell(`A${summaryRow}`).value = 'Total Records:';
    worksheet.getCell(`C${summaryRow}`).value = attendances.length;
    worksheet.getCell(`A${summaryRow}`).font = { bold: true };
    
    worksheet.mergeCells(`A${summaryRow + 1}:B${summaryRow + 1}`);
    worksheet.getCell(`A${summaryRow + 1}`).value = 'Total Work Hours:';
    worksheet.getCell(`C${summaryRow + 1}`).value = totalWorkHours.toFixed(2);
    worksheet.getCell(`A${summaryRow + 1}`).font = { bold: true };
    
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
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
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.xlsx`);
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
        attributes: ['id', 'name', 'email']
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
    
    const fields = ['User ID', 'Employee Name', 'Date', 'Clock In', 'Clock Out', 'Status', 'Work Hours'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { action: 'export_to_csv', recordCount: attendances.length },
      ipAddress: req.ip
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.csv`);
    return res.send(csv);
    
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
        attributes: ['id', 'name', 'email']
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
      const attendanceRate = workingDays > 0 ? ((stats.present / workingDays) * 100).toFixed(2) : '0.00';
      return { ...stats, workHours: stats.workHours.toFixed(2), attendanceRate };
    });
    
    const workbook = new ExcelJS.Workbook();
    
    const summarySheet = workbook.addWorksheet('Monthly Summary');
    summarySheet.mergeCells('A1:D1');
    summarySheet.getCell('A1').value = `Monthly Attendance Report - ${getMonthName(monthNum)} ${yearNum}`;
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    
    const totalWorkHours = attendances.reduce((sum, att) => sum + parseFloat(calculateWorkHours(att.clockIn, att.clockOut)), 0);
    const statusCounts = attendances.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {});
    
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Records:', attendances.length]);
    summarySheet.addRow(['Total Employees:', userStats.length]);
    summarySheet.addRow(['Total Work Hours:', totalWorkHours.toFixed(2)]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Status Breakdown:']);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      summarySheet.addRow([status, count, '', `${((count/attendances.length)*100).toFixed(2)}%`]);
    });
    
    const employeeSheet = workbook.addWorksheet('Employee Statistics');
    employeeSheet.columns = [
      { header: 'Employee ID', key: 'userId', width: 15 },
      { header: 'Employee Name', key: 'userName', width: 25 },
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Late', key: 'late', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: 'Work Hours', key: 'workHours', width: 12 },
      { header: 'Attendance Rate', key: 'attendanceRate', width: 15 }
    ];
    
    employeeSheet.getRow(1).font = { bold: true };
    employeeSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    
    userStats.forEach(stats => {
      employeeSheet.addRow({ ...stats, attendanceRate: `${stats.attendanceRate}%` });
    });
    
    const detailSheet = workbook.addWorksheet('Detailed Attendance');
    detailSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User ID', key: 'userId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 25 },
      { header: 'Clock In', key: 'clockIn', width: 20 },
      { header: 'Clock Out', key: 'clockOut', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Work Hours', key: 'workHours', width: 12 }
    ];
    
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    
    attendances.forEach(att => {
      detailSheet.addRow({
        date: formatDate(att.date),
        userId: att.UserId,
        employeeName: att.User?.name || '-',
        clockIn: formatDateTime(att.clockIn),
        clockOut: formatDateTime(att.clockOut),
        status: att.status,
        workHours: calculateWorkHours(att.clockIn, att.clockOut)
      });
    });
    
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
    
    await AuditLogger.log({
      userId: req.user.id,
      action: 'EXPORT',
      tableName: 'Attendance',
      recordId: null,
      newData: { action: 'generate_monthly_report', month: monthNum, year: yearNum, recordCount: attendances.length },
      ipAddress: req.ip
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=monthly_report_${monthNum}_${yearNum}.xlsx`);
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
