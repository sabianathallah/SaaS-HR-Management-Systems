const fs = require('fs');
const path = require('path');

/**
 * Payslip Generator Service
 * Generates PDF payslips for employees
 * 
 * Note: This is a simplified HTML/text-based version.
 * For production PDF generation, install pdfkit or puppeteer:
 * npm install pdfkit
 * npm install puppeteer
 */
class PayslipGeneratorService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads/payslips');
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  ensureUploadDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generate payslip (HTML version for now)
   * @param {Object} payrollData - Payroll data
   * @param {Object} periodData - Period information
   * @returns {Promise<string>} Path to generated payslip
   */
  async generatePayslip(payrollData, periodData) {
    try {
      const filename = `payslip_${payrollData.employee.id}_${periodData.periodName.replace(/\s/g, '_')}.html`;
      const filepath = path.join(this.uploadsDir, filename);

      const html = this.generatePayslipHTML(payrollData, periodData);

      fs.writeFileSync(filepath, html, 'utf8');

      return `/uploads/payslips/${filename}`;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }

  /**
   * Generate payslip HTML
   * @param {Object} payrollData - Payroll data
   * @param {Object} periodData - Period information
   * @returns {string} HTML content
   */
  generatePayslipHTML(payrollData, periodData) {
    const { employee, salary, overtime, allowances, bonuses, thr, gross, deductions, net, details } = payrollData;
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slip Gaji - ${employee.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        
        .payslip {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .period {
            color: #7f8c8d;
            font-size: 16px;
        }
        
        .employee-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 8px;
        }
        
        .info-item {
            display: flex;
        }
        
        .info-label {
            font-weight: bold;
            width: 140px;
            color: #34495e;
        }
        
        .info-value {
            color: #2c3e50;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            background: #3498db;
            color: white;
            padding: 10px 15px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        
        .earnings .section-title {
            background: #27ae60;
        }
        
        .deductions .section-title {
            background: #e74c3c;
        }
        
        .summary .section-title {
            background: #2c3e50;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        table th {
            text-align: left;
            padding: 10px;
            background: #ecf0f1;
            color: #2c3e50;
            font-weight: bold;
        }
        
        table td {
            padding: 10px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        table tr:hover {
            background: #f8f9fa;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .total-row {
            font-weight: bold;
            font-size: 18px;
            background: #ecf0f1 !important;
        }
        
        .net-salary {
            background: #27ae60 !important;
            color: white !important;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
        }
        
        .bank-info {
            margin-top: 30px;
            padding: 15px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }
        
        .bank-info h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .payslip {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="payslip">
        <div class="header">
            <h1>SLIP GAJI</h1>
            <p class="period">Periode: ${periodData.periodName}</p>
            <p class="period">${formatDate(periodData.periodStart)} - ${formatDate(periodData.periodEnd)}</p>
        </div>
        
        <div class="employee-info">
            <div class="info-item">
                <span class="info-label">Nama:</span>
                <span class="info-value">${employee.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${employee.email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Jabatan:</span>
                <span class="info-value">${employee.position || '-'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Departemen:</span>
                <span class="info-value">${employee.department || '-'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${employee.employmentStatus || '-'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Hari Kerja:</span>
                <span class="info-value">${salary.workingDays} dari ${salary.totalDaysInPeriod} hari</span>
            </div>
        </div>
        
        <div class="section earnings">
            <div class="section-title">PENGHASILAN</div>
            <table>
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th class="amount">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Gaji Pokok ${salary.workingDays < salary.totalDaysInPeriod ? '(Pro-rata)' : ''}</td>
                        <td class="amount">${formatCurrency(salary.proratedSalary)}</td>
                    </tr>
                    ${overtime.hours > 0 ? `
                    <tr>
                        <td>Uang Lembur (${overtime.hours} jam)</td>
                        <td class="amount">${formatCurrency(overtime.pay)}</td>
                    </tr>
                    ` : ''}
                    ${allowances > 0 ? `
                    <tr>
                        <td>Tunjangan</td>
                        <td class="amount">${formatCurrency(allowances)}</td>
                    </tr>
                    ` : ''}
                    ${bonuses > 0 ? `
                    <tr>
                        <td>Bonus</td>
                        <td class="amount">${formatCurrency(bonuses)}</td>
                    </tr>
                    ` : ''}
                    ${thr > 0 ? `
                    <tr>
                        <td>THR</td>
                        <td class="amount">${formatCurrency(thr)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>TOTAL PENGHASILAN BRUTO</td>
                        <td class="amount">${formatCurrency(gross)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section deductions">
            <div class="section-title">POTONGAN</div>
            <table>
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th class="amount">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    ${deductions.bpjsHealthEmployee > 0 ? `
                    <tr>
                        <td>BPJS Kesehatan (Karyawan)</td>
                        <td class="amount">${formatCurrency(deductions.bpjsHealthEmployee)}</td>
                    </tr>
                    ` : ''}
                    ${deductions.bpjsEmploymentEmployee > 0 ? `
                    <tr>
                        <td>BPJS Ketenagakerjaan (Karyawan)</td>
                        <td class="amount">${formatCurrency(deductions.bpjsEmploymentEmployee)}</td>
                    </tr>
                    ` : ''}
                    ${deductions.incomeTax > 0 ? `
                    <tr>
                        <td>PPh 21</td>
                        <td class="amount">${formatCurrency(deductions.incomeTax)}</td>
                    </tr>
                    ` : ''}
                    ${deductions.other > 0 ? `
                    <tr>
                        <td>Potongan Lainnya</td>
                        <td class="amount">${formatCurrency(deductions.other)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>TOTAL POTONGAN</td>
                        <td class="amount">${formatCurrency(deductions.total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section summary">
            <div class="section-title">RINGKASAN</div>
            <table>
                <tbody>
                    <tr>
                        <td>Total Penghasilan Bruto</td>
                        <td class="amount">${formatCurrency(gross)}</td>
                    </tr>
                    <tr>
                        <td>Total Potongan</td>
                        <td class="amount">${formatCurrency(deductions.total)}</td>
                    </tr>
                    <tr class="total-row net-salary">
                        <td>GAJI BERSIH (TAKE HOME PAY)</td>
                        <td class="amount">${formatCurrency(net)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        ${employee.bankAccountNumber ? `
        <div class="bank-info">
            <h4>📝 Informasi Transfer</h4>
            <p><strong>Bank:</strong> ${employee.bankName || '-'}</p>
            <p><strong>Nomor Rekening:</strong> ${employee.bankAccountNumber}</p>
            <p><strong>Atas Nama:</strong> ${employee.bankAccountHolderName || employee.name}</p>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Slip gaji ini digenerate secara otomatis oleh sistem.</p>
            <p>Dicetak pada: ${formatDate(new Date())}</p>
            <p>&copy; ${new Date().getFullYear()} HR Management System - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate batch payslips
   * @param {Array} payrollsData - Array of payroll data
   * @param {Object} periodData - Period information
   * @returns {Promise<Array>} Array of generated payslip paths
   */
  async generateBatchPayslips(payrollsData, periodData) {
    const results = [];

    for (const payrollData of payrollsData) {
      try {
        const filepath = await this.generatePayslip(payrollData, periodData);
        results.push({
          employeeId: payrollData.employee.id,
          employeeName: payrollData.employee.name,
          filepath,
          success: true
        });
      } catch (error) {
        results.push({
          employeeId: payrollData.employee.id,
          employeeName: payrollData.employee.name,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }
}

module.exports = new PayslipGeneratorService();
