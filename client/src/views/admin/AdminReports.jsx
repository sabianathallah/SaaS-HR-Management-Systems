import { useState } from 'react';
import { reportService } from '../../services/reportService';
import { Download } from 'lucide-react';

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (reportType) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select date range');
      return;
    }

    try {
      setIsExporting(true);
      const response = await reportService.exportAttendanceReport(dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export report: ' + err.response?.data?.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('attendance')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Download size={20} />
            Export Attendance
          </button>
          <button
            onClick={() => handleExport('leave')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
          >
            <Download size={20} />
            Export Leave
          </button>
          <button
            onClick={() => handleExport('overtime')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
          >
            <Download size={20} />
            Export Overtime
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Employees" value="Loading..." color="blue" />
          <StatCard title="Today's Attendance" value="Loading..." color="green" />
          <StatCard title="Pending Requests" value="Loading..." color="yellow" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`${colors[color]} rounded-lg p-6`}>
      <p className="text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
