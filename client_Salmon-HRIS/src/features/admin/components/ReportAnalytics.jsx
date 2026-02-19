import { useState, useEffect } from 'react';
import axios from '../../../shared/config/axios';
import { BarChart3, CalendarDays, Clock, Calendar, DollarSign, MapPin, Lock, AlertTriangle } from 'lucide-react';

const ReportAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [metadata, setMetadata] = useState(null);
  
  // Filters untuk berbagai report
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    locationId: '',
    status: '',
    format: 'excel'
  });

  const [monthlyFilters, setMonthlyFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    groupBy: 'employee'
  });

  const [overtimeFilters, setOvertimeFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    userId: '',
    department: ''
  });

  const [leaveFilters, setLeaveFilters] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    status: '',
    userId: '',
    department: ''
  });

  const [payrollFilters, setPayrollFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [locationFilters, setLocationFilters] = useState({
    startDate: '',
    endDate: '',
    validationStatus: ''
  });

  const [auditFilters, setAuditFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    module: '',
    action: ''
  });

  const [complianceFilters, setComplianceFilters] = useState({
    startDate: '',
    endDate: '',
    department: ''
  });

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/reports/metadata`
      );
      setMetadata(response.data.data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  // Generic download function
  const handleDownload = async (endpoint, filters, filename) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/reports/${endpoint}?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setLoading(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(error.response?.data?.message || 'Failed to download report');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'attendance', name: 'Attendance', Icon: BarChart3, color: 'blue' },
    { id: 'monthly', name: 'Monthly Recap', Icon: CalendarDays, color: 'green' },
    { id: 'overtime', name: 'Overtime', Icon: Clock, color: 'orange' },
    { id: 'leave', name: 'Leave', Icon: Calendar, color: 'purple' },
    { id: 'payroll', name: 'Payroll Support', Icon: DollarSign, color: 'emerald' },
    { id: 'location', name: 'Location & GPS', Icon: MapPin, color: 'pink' },
    { id: 'audit', name: 'Audit Log', Icon: Lock, color: 'gray' },
    { id: 'compliance', name: 'Compliance', Icon: AlertTriangle, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 size={24} className="text-blue-600" /> Advanced Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive reporting system untuk semua kebutuhan HR</p>
      </div>

      {/* Metadata Summary */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total Attendances</div>
            <div className="text-2xl font-bold text-blue-900">{metadata.summary?.totalAttendances || 0}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Total Employees</div>
            <div className="text-2xl font-bold text-green-900">{metadata.summary?.totalEmployees || 0}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Total Overtimes</div>
            <div className="text-2xl font-bold text-orange-900">{metadata.summary?.totalOvertimes || 0}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Total Leaves</div>
            <div className="text-2xl font-bold text-purple-900">{metadata.summary?.totalLeaves || 0}</div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="text-sm text-pink-600 font-medium">Departments</div>
            <div className="text-2xl font-bold text-pink-900">{metadata.summary?.totalDepartments || 0}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.Icon size={14} className="inline mr-1.5 -mt-0.5" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border rounded-lg p-6">
        
        {/* A. ATTENDANCE REPORT */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500" /> Attendance Report</h3>
            <p className="text-sm text-gray-600">Most frequently used report. Export attendance dengan filters lengkap.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={attendanceFilters.startDate}
                  onChange={(e) => setAttendanceFilters({...attendanceFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={attendanceFilters.endDate}
                  onChange={(e) => setAttendanceFilters({...attendanceFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={attendanceFilters.department}
                  onChange={(e) => setAttendanceFilters({...attendanceFilters, department: e.target.value})}
                  placeholder="e.g., IT, HR"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={attendanceFilters.status}
                  onChange={(e) => setAttendanceFilters({...attendanceFilters, status: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="ON_TIME">On Time</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  value={attendanceFilters.format}
                  onChange={(e) => setAttendanceFilters({...attendanceFilters, format: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownload('attendance', attendanceFilters, `Attendance_Report_${Date.now()}.${attendanceFilters.format === 'csv' ? 'csv' : 'xlsx'}`)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Downloading...' : 'Download Report'}
              </button>
            </div>
          </div>
        )}

        {/* B. MONTHLY RECAP REPORT */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><CalendarDays size={20} className="text-green-500" /> Monthly Recap Report</h3>
            <p className="text-sm text-gray-600">Rekap bulanan untuk payroll. Total hadir, telat, alpha, jam kerja, overtime per employee/department.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={monthlyFilters.month}
                  onChange={(e) => setMonthlyFilters({...monthlyFilters, month: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('en', {month: 'long'})}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={monthlyFilters.year}
                  onChange={(e) => setMonthlyFilters({...monthlyFilters, year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <select
                  value={monthlyFilters.groupBy}
                  onChange={(e) => setMonthlyFilters({...monthlyFilters, groupBy: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="employee">Per Employee</option>
                  <option value="department">Per Department</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleDownload('monthly-recap', monthlyFilters, `Monthly_Recap_${monthlyFilters.month}_${monthlyFilters.year}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Monthly Recap'}
            </button>
          </div>
        )}

        {/* C. OVERTIME REPORT */}
        {activeTab === 'overtime' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Clock size={20} className="text-orange-500" /> Overtime Report</h3>
            <p className="text-sm text-gray-600">Laporan lembur: tanggal, jam lembur, alasan, approved by, status.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={overtimeFilters.startDate}
                  onChange={(e) => setOvertimeFilters({...overtimeFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={overtimeFilters.endDate}
                  onChange={(e) => setOvertimeFilters({...overtimeFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={overtimeFilters.status}
                  onChange={(e) => setOvertimeFilters({...overtimeFilters, status: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={overtimeFilters.department}
                  onChange={(e) => setOvertimeFilters({...overtimeFilters, department: e.target.value})}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleDownload('overtime', overtimeFilters, `Overtime_Report_${Date.now()}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Overtime Report'}
            </button>
          </div>
        )}

        {/* D. LEAVE REPORT */}
        {activeTab === 'leave' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Calendar size={20} className="text-purple-500" /> Leave Report</h3>
            <p className="text-sm text-gray-600">Laporan cuti: jenis cuti, tanggal, durasi, status, remaining leave.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={leaveFilters.startDate}
                  onChange={(e) => setLeaveFilters({...leaveFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={leaveFilters.endDate}
                  onChange={(e) => setLeaveFilters({...leaveFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={leaveFilters.leaveType}
                  onChange={(e) => setLeaveFilters({...leaveFilters, leaveType: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="annual_leave">Annual Leave</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="permission">Permission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={leaveFilters.status}
                  onChange={(e) => setLeaveFilters({...leaveFilters, status: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleDownload('leave', leaveFilters, `Leave_Report_${Date.now()}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Leave Report'}
            </button>
          </div>
        )}

        {/* E. PAYROLL SUPPORT REPORT */}
        {activeTab === 'payroll' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><DollarSign size={20} className="text-emerald-500" /> Payroll Support Report</h3>
            <p className="text-sm text-gray-600">Export data untuk integrasi ke software payroll eksternal. Total working days, overtime hours, late penalty, unpaid leave.</p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-emerald-800">
                <strong>Info:</strong> Report ini dirancang untuk diexport dan diupload ke software payroll seperti Talenta, Gadjian, dll.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={payrollFilters.month}
                  onChange={(e) => setPayrollFilters({...payrollFilters, month: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('en', {month: 'long'})}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={payrollFilters.year}
                  onChange={(e) => setPayrollFilters({...payrollFilters, year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleDownload('payroll-support', payrollFilters, `Payroll_Support_${payrollFilters.month}_${payrollFilters.year}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Payroll Support'}
            </button>
          </div>
        )}

        {/* F. LOCATION & GPS REPORT */}
        {activeTab === 'location' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MapPin size={20} className="text-pink-500" /> Location & GPS Report</h3>
            <p className="text-sm text-gray-600">Premium feature: Clock-in location, distance, GPS coordinates, inside/outside radius status.</p>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-pink-800">
                <strong>Premium Feature:</strong> Fitur ini membedakan HRIS Anda dari kompetitor!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={locationFilters.startDate}
                  onChange={(e) => setLocationFilters({...locationFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={locationFilters.endDate}
                  onChange={(e) => setLocationFilters({...locationFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validation Status</label>
                <select
                  value={locationFilters.validationStatus}
                  onChange={(e) => setLocationFilters({...locationFilters, validationStatus: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">All Status</option>
                  <option value="inside_radius">Inside Radius</option>
                  <option value="outside_radius">Outside Radius</option>
                  <option value="not_checked">Not Checked</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleDownload('location-gps', locationFilters, `Location_GPS_Report_${Date.now()}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download GPS Report'}
            </button>
          </div>
        )}

        {/* G. AUDIT LOG REPORT */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Lock size={20} className="text-gray-500" /> Audit Log Report</h3>
            <p className="text-sm text-gray-600">Enterprise feature: User activities, actions (CREATE/UPDATE/DELETE), before/after data, timestamps.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800">
                <strong>Enterprise Feature:</strong> Ini yang bikin HRIS Anda berbeda dari yang murahan. Full audit trail!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={auditFilters.startDate}
                  onChange={(e) => setAuditFilters({...auditFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={auditFilters.endDate}
                  onChange={(e) => setAuditFilters({...auditFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                <select
                  value={auditFilters.module}
                  onChange={(e) => setAuditFilters({...auditFilters, module: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">All Modules</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Users">Employee</option>
                  <option value="LeaveRequests">Leave</option>
                  <option value="Overtimes">Overtime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={auditFilters.action}
                  onChange={(e) => setAuditFilters({...auditFilters, action: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="EXPORT">Export</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleDownload('audit-log', auditFilters, `Audit_Log_Report_${Date.now()}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Audit Log'}
            </button>
          </div>
        )}

        {/* H. COMPLIANCE / VIOLATION REPORT */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500" /> Compliance / Violation Report</h3>
            <p className="text-sm text-gray-600">Deteksi pelanggaran: Telat berulang, alpha berturut-turut, clock-in tanpa foto, suspicious GPS.</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Smart Detection:</strong> Otomatis deteksi anomali dan pelanggaran untuk early warning!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={complianceFilters.startDate}
                  onChange={(e) => setComplianceFilters({...complianceFilters, startDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={complianceFilters.endDate}
                  onChange={(e) => setComplianceFilters({...complianceFilters, endDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={complianceFilters.department}
                  onChange={(e) => setComplianceFilters({...complianceFilters, department: e.target.value})}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleDownload('compliance', complianceFilters, `Compliance_Report_${Date.now()}.xlsx`)}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Generating...' : 'Download Compliance Report'}
            </button>
          </div>
        )}

      </div>

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-800">
          <strong>Pro Tips:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Gunakan <strong>Date Filters</strong> untuk membatasi data dan mempercepat proses</li>
          <li><strong>Attendance Report</strong> bisa export Excel atau CSV untuk fleksibilitas</li>
          <li><strong>Monthly Recap</strong> cocok untuk persiapan payroll bulanan</li>
          <li><strong>Payroll Support</strong> bisa langsung diupload ke software payroll eksternal</li>
          <li><strong>Audit Log</strong> sangat berguna untuk investigasi dan compliance</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportAnalytics;
