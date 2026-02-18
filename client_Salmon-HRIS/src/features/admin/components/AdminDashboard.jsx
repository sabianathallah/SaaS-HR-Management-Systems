import { useState, useEffect } from 'react'
import axios from '../../../shared/config/axios'
import {
  Users, CheckCircle2, Clock, XCircle, Calendar, MapPin, Home,
  AlertTriangle, BarChart3, Bell, Plus, Pencil, Trash2, Activity,
} from 'lucide-react'
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
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

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
)

const TEAL = '#1A9B9A'

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
  })

  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [topLateEmployees, setTopLateEmployees] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState({ leave: 0, overtime: 0 })
  const [locationViolations, setLocationViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState(7)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [chartPeriod])

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const [
        employeesRes,
        todayAttendanceRes,
        allAttendanceRes,
        leaveRequestsRes,
        overtimeRes,
        auditLogsRes,
      ] = await Promise.all([
        axios.get('/users/admin'),
        axios.get('/attendances/admin/today-attendance'),
        axios.get(`/attendances/admin/all-attendance?startDate=${getDateDaysAgo(chartPeriod)}&endDate=${today}`),
        axios.get('/leave-requests/admin/all'),
        axios.get('/overtimes/admin/requests'),
        axios.get('/audit-logs?limit=20').catch(() => ({ data: { data: [] } })),
      ])

      const employees = employeesRes.data.data || []
      const todayAtt = todayAttendanceRes.data.data || []
      const allAtt = allAttendanceRes.data.data || []
      const leaveReqs = leaveRequestsRes.data.data || []
      const overtimeReqs = overtimeRes.data.data || []
      const auditLogs = Array.isArray(auditLogsRes.data.data) ? auditLogsRes.data.data : []

      const activeEmployees = employees.filter(e => e.isActive).length
      const todayPresent = todayAtt.filter(a => a.status === 'ON_TIME').length
      const todayLate = todayAtt.filter(a => a.status === 'LATE').length
      const todayAbsent = todayAtt.filter(a => a.status === 'ABSENT').length
      const todayOnProgress = todayAtt.filter(a => a.status === 'ON_PROGRESS').length
      const todayLeave = todayAtt.filter(a => ['LEAVE', 'SICK_LEAVE', 'PERMISSION'].includes(a.status)).length
      const validLocation = todayAtt.filter(a => a.locationValidationStatus === 'valid').length
      const outsideRadius = todayAtt.filter(a => a.locationValidationStatus === 'outside_radius').length
      const todayOnsite = validLocation
      const todayRemote = todayAtt.filter(a =>
        a.locationValidationStatus === 'not_checked' &&
        (a.status === 'ON_TIME' || a.status === 'LATE' || a.status === 'ON_PROGRESS')
      ).length

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
      })

      const lateAttendances = allAtt.filter(a => a.status === 'LATE')
      const lateCount = {}
      lateAttendances.forEach(att => {
        lateCount[att.UserId] = (lateCount[att.UserId] || 0) + 1
      })
      setTopLateEmployees(
        Object.entries(lateCount)
          .map(([userId, count]) => {
            const user = employees.find(e => e.id === parseInt(userId))
            return { userId: parseInt(userId), name: user?.name || 'Unknown', position: user?.position || '', lateCount: count }
          })
          .sort((a, b) => b.lateCount - a.lateCount)
          .slice(0, 5)
      )

      setLocationViolations(
        todayAtt
          .filter(a => a.locationValidationStatus === 'outside_radius')
          .map(a => ({ id: a.id, employeeName: a.User?.name || 'Unknown', time: a.clockIn }))
          .slice(0, 5)
      )

      prepareChartData(allAtt, chartPeriod)

      setRecentActivity(
        auditLogs
          .filter(log => log.action !== 'READ')
          .slice(0, 10)
          .map(log => ({
            id: log.id,
            time: log.createdAt,
            user: log.User?.name || 'System',
            action: formatAuditAction(log),
            type: log.action,
          }))
      )

      setPendingApprovals({
        leave: leaveReqs.filter(r => r.status === 'PENDING').length,
        overtime: overtimeReqs.filter(r => r.status === 'PENDING').length,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const getDateDaysAgo = (days) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  const prepareChartData = (attendances, period) => {
    const dates = [], presentData = [], lateData = [], absentData = []
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dates.push(date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }))
      const dayAtt = attendances.filter(a => a.date.startsWith(dateStr))
      presentData.push(dayAtt.filter(a => a.status === 'ON_TIME').length)
      lateData.push(dayAtt.filter(a => a.status === 'LATE').length)
      absentData.push(dayAtt.filter(a => a.status === 'ABSENT').length)
    }
    setChartData({
      labels: dates,
      datasets: [
        { label: 'Present', data: presentData, borderColor: 'rgb(34,197,94)', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4 },
        { label: 'Late', data: lateData, borderColor: 'rgb(234,179,8)', backgroundColor: 'rgba(234,179,8,0.1)', tension: 0.4 },
        { label: 'Absent', data: absentData, borderColor: 'rgb(239,68,68)', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4 },
      ],
    })
  }

  const formatAuditAction = (log) => {
    const entity = log.entityType?.replace('s', '') || 'Record'
    const action = log.action?.toLowerCase() || 'modified'
    return `${entity} ${action}`
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const diffMins = Math.floor((new Date() - date) / 60000)
    const diffHours = Math.floor(diffMins / 60)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const locationChartData = {
    labels: ['Valid Location', 'Outside Radius', 'Not Checked'],
    datasets: [{
      data: [stats.validLocation, stats.outsideRadius, stats.todayRemote],
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(239,68,68,0.8)', 'rgba(156,163,175,0.8)'],
      borderColor: ['rgb(34,197,94)', 'rgb(239,68,68)', 'rgb(156,163,175)'],
      borderWidth: 2,
    }],
  }

  const ActivityIcon = ({ type }) => {
    if (type === 'CREATE') return <Plus size={14} className="text-green-500" />
    if (type === 'UPDATE') return <Pencil size={14} className="text-blue-500" />
    if (type === 'DELETE') return <Trash2 size={14} className="text-red-500" />
    if (type === 'APPROVE') return <CheckCircle2 size={14} className="text-green-500" />
    if (type === 'REJECT') return <XCircle size={14} className="text-red-500" />
    return <Activity size={14} className="text-gray-400" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: TEAL }}></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Real-time HR analytics & monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, sub: `${stats.activeEmployees} active`, Icon: Users, color: '#2563eb', bg: '#eff6ff', border: '#3b82f6' },
          { label: 'Present Today', value: stats.todayPresent, sub: 'On time', Icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#22c55e' },
          { label: 'Late', value: stats.todayLate, sub: 'Late clock-in', Icon: Clock, color: '#ca8a04', bg: '#fefce8', border: '#eab308' },
          { label: 'Not Clocked In', value: stats.todayAbsent, sub: 'Absent today', Icon: XCircle, color: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
          { label: 'Clock-in Only', value: stats.todayOnProgress, sub: 'No clock-out yet', Icon: Clock, color: '#4f46e5', bg: '#eef2ff', border: '#6366f1' },
          { label: 'On Leave', value: stats.todayLeave, sub: 'Approved leave', Icon: Calendar, color: '#7c3aed', bg: '#f5f3ff', border: '#8b5cf6' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            style={{ borderLeft: `4px solid ${card.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-xs font-medium">{card.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <card.Icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Location KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
            <MapPin size={22} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">On-site (Valid Location)</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayOnsite}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
            <Home size={22} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remote / WFH</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayRemote}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
            <AlertTriangle size={22} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Outside Radius</p>
            <p className="text-3xl font-bold text-gray-900">{stats.outsideRadius}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: TEAL }} />
              <h2 className="text-base font-bold text-gray-900">Attendance Overview</h2>
            </div>
            <div className="flex gap-2">
              {[7, 30].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={chartPeriod === p
                    ? { background: TEAL, color: '#fff' }
                    : { background: '#f3f4f6', color: '#374151' }
                  }
                >
                  {p} Days
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <Line data={chartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} style={{ color: TEAL }} />
            <h2 className="text-base font-bold text-gray-900">Location Status</h2>
          </div>
          <div className="h-72 flex items-center justify-center">
            <Doughnut data={locationChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
            }} />
          </div>
        </div>
      </div>

      {/* Late & Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: '#ca8a04' }} />
            <h2 className="text-base font-bold text-gray-900">Top 5 Frequently Late</h2>
          </div>
          <div className="space-y-3">
            {topLateEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm">No late records!</p>
              </div>
            ) : (
              topLateEmployees.map((emp, index) => (
                <div key={emp.userId} className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>{index + 1}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.position || 'No position'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">{emp.lateCount}x</p>
                    <p className="text-xs text-gray-400">Late</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
            <h2 className="text-base font-bold text-gray-900">Clock-in Outside Radius (Today)</h2>
          </div>
          <div className="space-y-3">
            {locationViolations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm">All clock-ins are valid!</p>
              </div>
            ) : (
              locationViolations.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{v.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(v.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                    Outside Radius
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={18} style={{ color: TEAL }} />
              <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time
            </div>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-500">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">{formatTime(activity.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: TEAL }} />
            <h2 className="text-base font-bold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Leave Requests</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-blue-600">{pendingApprovals.leave}</p>
                <span className="text-xs text-blue-500 font-medium">Review →</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Overtime Requests</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-purple-600">{pendingApprovals.overtime}</p>
                <span className="text-xs text-purple-500 font-medium">Review →</span>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: '#E6F7F7', border: '1px solid #1A9B9A33' }}>
              <p className="text-sm font-medium mb-1" style={{ color: TEAL }}>Total Pending</p>
              <p className="text-4xl font-bold" style={{ color: TEAL }}>
                {pendingApprovals.leave + pendingApprovals.overtime}
              </p>
              <p className="text-xs mt-2" style={{ color: TEAL }}>
                {pendingApprovals.leave + pendingApprovals.overtime > 0 ? 'Action required' : 'All clear'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="rounded-xl shadow-sm p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0D3535 0%, #1A9B9A 100%)' }}>
        <h3 className="text-lg font-bold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Attendance Rate</p>
            <p className="text-2xl font-bold">
              {stats.activeEmployees > 0
                ? Math.round(((stats.todayPresent + stats.todayLate + stats.todayOnProgress) / stats.activeEmployees) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>On-time Rate</p>
            <p className="text-2xl font-bold">
              {(stats.todayPresent + stats.todayLate) > 0
                ? Math.round((stats.todayPresent / (stats.todayPresent + stats.todayLate)) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Location Valid</p>
            <p className="text-2xl font-bold">
              {stats.todayOnsite + stats.outsideRadius > 0
                ? Math.round((stats.todayOnsite / (stats.todayOnsite + stats.outsideRadius)) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Pending Actions</p>
            <p className="text-2xl font-bold">{pendingApprovals.leave + pendingApprovals.overtime}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
