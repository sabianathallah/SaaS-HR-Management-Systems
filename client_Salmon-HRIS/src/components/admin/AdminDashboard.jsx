import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    attendanceToday: {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
    },
    pendingApprovals: {
      leave: 0,
      overtime: 0,
    },
  });
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch multiple data in parallel
      const [employeesRes, todayAttendanceRes, leaveRequestsRes, overtimeRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/user/admin`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/attendance/admin/today-attendance`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/leave-request/admin/all`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/overtime/admin/all`, config),
      ]);

      // Calculate stats
      const employees = employeesRes.data.data || [];
      const todayAtt = todayAttendanceRes.data.data || [];
      const leaveReqs = leaveRequestsRes.data.data || [];
      const overtimeReqs = overtimeRes.data.data || [];

      // Count attendance status
      const attStats = {
        present: todayAtt.filter(a => a.status === 'ON_TIME').length,
        late: todayAtt.filter(a => a.status === 'LATE').length,
        absent: todayAtt.filter(a => a.status === 'ABSENT').length,
        onLeave: todayAtt.filter(a => a.status === 'LEAVE').length,
      };

      // Count pending approvals
      const pendingLeave = leaveReqs.filter(l => l.status === 'PENDING').length;
      const pendingOvertime = overtimeReqs.filter(o => o.status === 'PENDING').length;

      setStats({
        totalEmployees: employees.length,
        attendanceToday: attStats,
        pendingApprovals: {
          leave: pendingLeave,
          overtime: pendingOvertime,
        },
      });

      setTodayAttendance(todayAtt);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Quick insights of your organization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        {/* Attendance Today - Present */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Present Today</p>
              <p className="text-3xl font-bold mt-2">{stats.attendanceToday.present}</p>
              <p className="text-green-100 text-xs mt-1">On Time</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Late Today</p>
              <p className="text-3xl font-bold mt-2">{stats.attendanceToday.late}</p>
              <p className="text-yellow-100 text-xs mt-1">Need attention</p>
            </div>
            <div className="text-4xl opacity-80">⚠️</div>
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Absent Today</p>
              <p className="text-3xl font-bold mt-2">{stats.attendanceToday.absent}</p>
              <p className="text-red-100 text-xs mt-1">Missing</p>
            </div>
            <div className="text-4xl opacity-80">❌</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Pending Leave Requests</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">
                {stats.pendingApprovals.leave}
              </p>
              <p className="text-sm text-gray-500 mt-1">Waiting for approval</p>
            </div>
            <div className="text-5xl">🏖️</div>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">Pending Overtime Requests</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {stats.pendingApprovals.overtime}
              </p>
              <p className="text-sm text-gray-500 mt-1">Waiting for approval</p>
            </div>
            <div className="text-5xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Attendance Summary</h3>
        
        {todayAttendance.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance data for today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAttendance.slice(0, 10).map((att) => (
                  <tr key={att.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {att.User?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {att.User?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockIn ? new Date(att.clockIn).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockOut ? new Date(att.clockOut).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${att.status === 'ON_TIME' ? 'bg-green-100 text-green-800' : ''}
                        ${att.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${att.status === 'ABSENT' ? 'bg-red-100 text-red-800' : ''}
                        ${att.status === 'LEAVE' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {att.locationValidationStatus === 'VALID' ? '✅ Valid' : 
                       att.locationValidationStatus === 'INVALID' ? '❌ Invalid' : 
                       att.locationValidationStatus === 'NOT_CHECKED' ? '⚠️ Not Checked' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {todayAttendance.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 10 of {todayAttendance.length} records
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-center transition-all">
            <div className="text-3xl mb-2">👤</div>
            <div className="text-sm font-medium">Add Employee</div>
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-center transition-all">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm font-medium">Manual Attendance</div>
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-center transition-all">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-sm font-medium">Approve Leave</div>
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4 text-center transition-all">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-medium">Export Reports</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
