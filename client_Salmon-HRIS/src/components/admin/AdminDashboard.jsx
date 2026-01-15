import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayPresent: 0,
    todayLate: 0,
    todayAbsent: 0,
    todayOnProgress: 0,
    todayLeave: 0,
    todayRemote: 0,
    todayOnsite: 0,
    validLocation: 0,
    outsideRadius: 0,
  });
  
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  
  const [topLateEmployees, setTopLateEmployees] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState({
    leave: 0,
    overtime: 0,
  });
  const [locationViolations, setLocationViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState(7); // 7 or 30 days

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        employeesRes,
        todayAttendanceRes,
        allAttendanceRes,
        leaveRequestsRes,
        overtimeRes,
        auditLogsRes,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/users/admin`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/attendances/admin/today-attendance`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/attendances/admin/all-attendance?startDate=${getDateDaysAgo(chartPeriod)}&endDate=${today}`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/leave-requests/admin/all`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/overtimes/admin/requests`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/audit-logs?limit=20`, config).catch(() => ({ data: { data: [] } })),
      ]);

      const employees = employeesRes.data.data || [];
      const todayAtt = todayAttendanceRes.data.data || [];
      const allAtt = allAttendanceRes.data.data || [];
      const leaveReqs = leaveRequestsRes.data.data || [];
      const overtimeReqs = overtimeRes.data.data || [];
      const auditLogs = auditLogsRes.data.data || [];

      // Calculate KPI stats
      const activeEmployees = employees.filter(e => e.isActive).length;
      const todayPresent = todayAtt.filter(a => a.status === 'ON_TIME').length;
      const todayLate = todayAtt.filter(a => a.status === 'LATE').length;
      const todayAbsent = todayAtt.filter(a => a.status === 'ABSENT').length;
      const todayOnProgress = todayAtt.filter(a => a.status === 'ON_PROGRESS').length;
      const todayLeave = todayAtt.filter(a => ['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(a.status)).length;
      
      // Location based stats
      const validLocation = todayAtt.filter(a => a.locationValidationStatus === 'valid').length;
      const outsideRadius = todayAtt.filter(a => a.locationValidationStatus === 'outside_radius').length;
      
      // Remote vs Onsite (based on location validation)
      const todayOnsite = validLocation;
      const todayRemote = todayAtt.filter(a => 
        a.locationValidationStatus === 'not_checked' && 
        (a.status === 'ON_TIME' || a.status === 'LATE' || a.status === 'ON_PROGRESS')
      ).length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees,
        todayPresent,
        todayLate,
        todayAbsent,
        todayOnProgress,
        todayLeave,
        todayRemote,
        todayOnsite,
        validLocation,
        outsideRadius,
      });

      // Calculate top late employees (last 30 days)
      const lateAttendances = allAtt.filter(a => a.status === 'LATE');
      const lateCount = {};
      lateAttendances.forEach(att => {
        const userId = att.UserId;
        lateCount[userId] = (lateCount[userId] || 0) + 1;
      });
      
      const topLate = Object.entries(lateCount)
        .map(([userId, count]) => {
          const user = employees.find(e => e.id === parseInt(userId));
          return {
            userId: parseInt(userId),
            name: user?.name || 'Unknown',
            email: user?.email || '',
            position: user?.position || '',
            lateCount: count,
          };
        })
        .sort((a, b) => b.lateCount - a.lateCount)
        .slice(0, 5);
      
      setTopLateEmployees(topLate);

      // Location violations
      const violations = todayAtt
        .filter(a => a.locationValidationStatus === 'outside_radius')
        .map(a => ({
          id: a.id,
          employeeName: a.User?.name || 'Unknown',
          time: a.clockIn,
          status: a.locationValidationStatus,
        }))
        .slice(0, 5);
      
      setLocationViolations(violations);

      // Prepare chart data
      prepareChartData(allAtt, chartPeriod);

      // Recent activity from audit logs
      const activities = auditLogs
        .filter(log => log.action !== 'READ')
        .slice(0, 10)
        .map(log => ({
          id: log.id,
          time: log.createdAt,
          user: log.User?.name || 'System',
          action: formatAuditAction(log),
          type: log.action,
        }));
      
      setRecentActivity(activities);

      // Pending approvals
      const pendingLeave = leaveReqs.filter(r => r.status === 'PENDING').length;
      const pendingOvertime = overtimeReqs.filter(r => r.status === 'PENDING').length;
      
      setPendingApprovals({
        leave: pendingLeave,
        overtime: pendingOvertime,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const prepareChartData = (attendances, period) => {
    const dates = [];
    const presentData = [];
    const lateData = [];
    const absentData = [];

    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));

      const dayAtt = attendances.filter(a => a.date.startsWith(dateStr));
      presentData.push(dayAtt.filter(a => a.status === 'ON_TIME').length);
      lateData.push(dayAtt.filter(a => a.status === 'LATE').length);
      absentData.push(dayAtt.filter(a => a.status === 'ABSENT').length);
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Hadir',
          data: presentData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Telat',
          data: lateData,
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Absent',
          data: absentData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
      ],
    });
  };

  const formatAuditAction = (log) => {
    const entity = log.entityType?.replace('s', '') || 'Record';
    const action = log.action?.toLowerCase() || 'modified';
    return `${entity} ${action}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const locationChartData = {
    labels: ['Valid Location', 'Outside Radius', 'Not Checked'],
    datasets: [
      {
        data: [stats.validLocation, stats.outsideRadius, stats.todayRemote],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time HR Analytics & Monitoring</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      {/* A. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Employees</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</h3>
              <p className="text-xs text-green-600 mt-1">
                {stats.activeEmployees} active
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Hadir Hari Ini</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.todayPresent}</h3>
              <p className="text-xs text-gray-500 mt-1">
                On time
              </p>
            </div>
            <div className="text-4xl">🟢</div>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Terlambat</p>
              <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.todayLate}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Late clock-in
              </p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>

        {/* Absen */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tidak Clock-in</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.todayAbsent}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Absent today
              </p>
            </div>
            <div className="text-4xl">🔴</div>
          </div>
        </div>

        {/* On Progress */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Clock-in Only</p>
              <h3 className="text-3xl font-bold text-indigo-600 mt-1">{stats.todayOnProgress}</h3>
              <p className="text-xs text-gray-500 mt-1">
                No clock-out yet
              </p>
            </div>
            <div className="text-4xl">🔵</div>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">On Leave</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.todayLeave}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Approved leave
              </p>
            </div>
            <div className="text-4xl">🏠</div>
          </div>
        </div>
      </div>

      {/* Location-based KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">📍 On-site (Valid Location)</p>
              <h3 className="text-3xl font-bold text-green-700 mt-1">{stats.todayOnsite}</h3>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">🏠 Remote / WFH</p>
              <h3 className="text-3xl font-bold text-blue-700 mt-1">{stats.todayRemote}</h3>
            </div>
            <div className="text-4xl">💻</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">⚠️ Outside Radius</p>
              <h3 className="text-3xl font-bold text-red-700 mt-1">{stats.outsideRadius}</h3>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* B. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📊 Attendance Overview</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartPeriod(7)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === 7 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartPeriod(30)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === 30 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
          <div className="h-80">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Location Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Location Status</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut 
              data={locationChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* C. Late & Violation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Late Employees */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⏰ Top 5 Karyawan Sering Telat</h2>
          <div className="space-y-3">
            {topLateEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-2xl mb-2">🎉</p>
                <p>No late records!</p>
              </div>
            ) : (
              topLateEmployees.map((emp, index) => (
                <div key={emp.userId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.position || 'No position'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{emp.lateCount}x</p>
                    <p className="text-xs text-gray-500">Late</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Location Violations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">❌ Clock-in Outside Radius (Today)</h2>
          <div className="space-y-3">
            {locationViolations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-2xl mb-2">✅</p>
                <p>All clock-ins are valid!</p>
              </div>
            ) : (
              locationViolations.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-semibold text-gray-900">{violation.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(violation.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-red-600">
                    <span className="px-3 py-1 bg-red-100 rounded-full text-xs font-semibold">
                      Outside Radius
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* D. Today Activity & E. Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🔔 Today's Activity (Live Feed)</h2>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-500">Real-time</span>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'CREATE' && <span className="text-green-500">➕</span>}
                    {activity.type === 'UPDATE' && <span className="text-blue-500">✏️</span>}
                    {activity.type === 'DELETE' && <span className="text-red-500">🗑️</span>}
                    {activity.type === 'APPROVE' && <span className="text-green-500">✅</span>}
                    {activity.type === 'REJECT' && <span className="text-red-500">❌</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{formatTime(activity.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⏳ Pending Approvals</h2>
          <div className="space-y-4">
            {/* Leave Requests */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📝</span>
                  <span className="font-semibold text-gray-900">Leave Requests</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-blue-600">{pendingApprovals.leave}</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Review →
                </button>
              </div>
            </div>

            {/* Overtime Requests */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌙</span>
                  <span className="font-semibold text-gray-900">Overtime Requests</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-purple-600">{pendingApprovals.overtime}</p>
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Review →
                </button>
              </div>
            </div>

            {/* Total Pending */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-1">Total Pending</p>
              <p className="text-5xl font-bold text-orange-600">
                {pendingApprovals.leave + pendingApprovals.overtime}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                {pendingApprovals.leave + pendingApprovals.overtime > 0 
                  ? '⚠️ Action required' 
                  : '✅ All clear'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Today's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="opacity-80">Attendance Rate</p>
                <p className="text-2xl font-bold">
                  {stats.activeEmployees > 0 
                    ? Math.round(((stats.todayPresent + stats.todayLate + stats.todayOnProgress) / stats.activeEmployees) * 100) 
                    : 0}%
                </p>
              </div>
              <div>
                <p className="opacity-80">On-time Rate</p>
                <p className="text-2xl font-bold">
                  {(stats.todayPresent + stats.todayLate) > 0 
                    ? Math.round((stats.todayPresent / (stats.todayPresent + stats.todayLate)) * 100) 
                    : 0}%
                </p>
              </div>
              <div>
                <p className="opacity-80">Location Valid</p>
                <p className="text-2xl font-bold">
                  {stats.todayOnsite + stats.outsideRadius > 0 
                    ? Math.round((stats.todayOnsite / (stats.todayOnsite + stats.outsideRadius)) * 100) 
                    : 0}%
                </p>
              </div>
              <div>
                <p className="opacity-80">Status</p>
                <p className="text-2xl font-bold">
                  {pendingApprovals.leave + pendingApprovals.overtime === 0 ? '✅' : '⏳'}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block text-6xl opacity-20">
            📊
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
