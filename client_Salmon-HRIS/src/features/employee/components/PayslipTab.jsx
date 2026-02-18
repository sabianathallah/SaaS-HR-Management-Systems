import Button from '../../../shared/components/button-reusable.jsx'
import Modal from '../../../shared/components/Modal.jsx'
import { DollarSign, TrendingUp, Building, FileText, Eye, Download } from 'lucide-react'

export default function PayslipTab({
  loading,
  payslips,
  payslipSummary,
  selectedPayslip,
  showPayslipDetail,
  setShowPayslipDetail,
  setSelectedPayslip,
  viewPayslipDetail,
  handleDownloadPayslip,
  formatCurrency,
  getPayslipStatusColor,
  getPayslipStatusLabel
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Payslips</h2>

        {/* Summary Cards */}
        {payslipSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Latest Salary', value: formatCurrency(payslipSummary.latestSalary), color: 'green', icon: <DollarSign size={20} /> },
              { label: 'YTD Earnings', value: formatCurrency(payslipSummary.ytdEarnings), color: 'blue', icon: <TrendingUp size={20} /> },
              { label: 'YTD Tax Paid', value: formatCurrency(payslipSummary.ytdTax), color: 'orange', icon: <Building size={20} /> },
              { label: 'Total Payslips', value: payslipSummary.totalPayslips, color: 'purple', icon: <FileText size={20} /> }
            ].map(({ label, value, color, icon }) => (
              <div key={label} className={`bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-lg p-4`}>
                <div className="flex items-center space-x-3">
                  <div className={`bg-${color}-500 text-white p-3 rounded-lg`}>{icon}</div>
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-lg font-bold text-${color}-600`}>{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payslips List */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Payslip History</h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading payslips...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No payslips available yet</p>
              <p className="text-gray-400 text-sm mt-2">Your payslips will appear here after payroll processing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payslips.map((payslip) => (
                <div
                  key={payslip.id}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-3">
                      <p className="font-bold text-gray-800 text-lg">{payslip.period?.periodName || 'Unknown Period'}</p>
                      <p className="text-xs text-gray-500">
                        Payment: {payslip.period?.paymentDate
                          ? new Date(payslip.period.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Gross Salary</p>
                      <p className="font-semibold text-gray-700">{formatCurrency(payslip.totalEarnings)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Deductions</p>
                      <p className="font-semibold text-red-600">-{formatCurrency(payslip.totalDeductions)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Net Salary</p>
                      <p className="font-bold text-green-600 text-lg">{formatCurrency(payslip.netSalary)}</p>
                    </div>
                    <div className="md:col-span-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPayslipStatusColor(payslip.status)}`}>
                        {getPayslipStatusLabel(payslip.status)}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex space-x-2 justify-end">
                      <button
                        onClick={() => viewPayslipDetail(payslip.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <Eye size={14} className="inline mr-1" /> View
                      </button>
                      {payslip.status === 'paid' && (
                        <button
                          onClick={() => handleDownloadPayslip(payslip.id, payslip.period?.periodName)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <Download size={14} className="inline mr-1" /> Download
                        </button>
                      )}
                    </div>
                  </div>

                  {payslip.status === 'paid' && payslip.paidAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-600">
                        <Building size={16} className="inline mr-2" />
                        <span>
                          Transferred to {payslip.bankName} - {payslip.bankAccountNumber} on{' '}
                          {new Date(payslip.paidAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Download your payslips every month for your records.
            You can use them for loan applications, visa applications, or annual tax reporting (SPT).
          </p>
        </div>
      </div>

      {/* Payslip Detail Modal */}
      {showPayslipDetail && selectedPayslip && (
        <Modal
          title="Payslip Detail"
          onClose={() => { setShowPayslipDetail(false); setSelectedPayslip(null) }}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedPayslip.period?.periodName}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Payment Date: {selectedPayslip.period?.paymentDate
                    ? new Date(selectedPayslip.period.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPayslipStatusColor(selectedPayslip.status)}`}>
                  {getPayslipStatusLabel(selectedPayslip.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Employee Name', value: selectedPayslip.employeeName },
                { label: 'Position', value: selectedPayslip.employeePosition || '-' },
                { label: 'Department', value: selectedPayslip.employeeDepartment || '-' },
                { label: 'Working Days', value: `${selectedPayslip.workingDays} / ${selectedPayslip.totalDaysInPeriod} days` }
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-700 mb-3">EARNINGS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Salary</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.proratedSalary)}</span>
                  </div>
                  {selectedPayslip.overtimeHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime ({selectedPayslip.overtimeHours}h)</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.overtimePay)}</span>
                    </div>
                  )}
                  {selectedPayslip.totalAllowances > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Allowances</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.totalAllowances)}</span>
                    </div>
                  )}
                  {selectedPayslip.totalBonuses > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bonuses</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.totalBonuses)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                    <span>Total Earnings</span>
                    <span>{formatCurrency(selectedPayslip.totalEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-bold text-red-700 mb-3">DEDUCTIONS</h4>
                <div className="space-y-2">
                  {selectedPayslip.bpjsHealthEmployee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">BPJS Health</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.bpjsHealthEmployee)}</span>
                    </div>
                  )}
                  {selectedPayslip.bpjsEmploymentEmployee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">BPJS Employment</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.bpjsEmploymentEmployee)}</span>
                    </div>
                  )}
                  {selectedPayslip.incomeTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Income Tax (PPh21)</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.incomeTax)}</span>
                    </div>
                  )}
                  {selectedPayslip.otherDeductions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Other Deductions</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-red-700">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">NET SALARY</p>
                  <p className="text-xs opacity-75 mt-1">Amount to be transferred</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(selectedPayslip.netSalary)}</p>
              </div>
            </div>

            {selectedPayslip.status === 'paid' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Transferred to:</p>
                <p className="font-bold text-gray-800">{selectedPayslip.bankName} - {selectedPayslip.bankAccountNumber}</p>
                <p className="text-sm text-gray-600">a.n. {selectedPayslip.bankAccountHolderName}</p>
                {selectedPayslip.paidAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Payment Date: {new Date(selectedPayslip.paidAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              {selectedPayslip.status === 'paid' && (
                <Button
                  nameProp="Download Payslip"
                  onClick={() => handleDownloadPayslip(selectedPayslip.id, selectedPayslip.period?.periodName)}
                  variant="success"
                />
              )}
              <Button
                nameProp="Close"
                onClick={() => { setShowPayslipDetail(false); setSelectedPayslip(null) }}
                variant="secondary"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
