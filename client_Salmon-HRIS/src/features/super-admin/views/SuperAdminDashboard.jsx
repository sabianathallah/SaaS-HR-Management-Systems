import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Building2, CheckCircle2, Users, UserCog, Plus, LayoutList } from 'lucide-react'
import axios from '../../../shared/config/axios'

const TEAL = '#1A9B9A'
const TEAL_LIGHT = '#E6F7F7'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data } = await axios.get('/companies/stats')
      setStats(data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({ companies: {}, users: {} })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: TEAL }}></div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Companies',
      value: stats?.companies?.total ?? 0,
      Icon: Building2,
      color: TEAL,
      bg: TEAL_LIGHT,
      sub: `${stats?.companies?.active ?? 0} active · ${stats?.companies?.suspended ?? 0} suspended`
    },
    {
      label: 'Active Companies',
      value: stats?.companies?.active ?? 0,
      Icon: CheckCircle2,
      color: '#16a34a',
      bg: '#f0fdf4',
      sub: `${Math.round(((stats?.companies?.active ?? 0) / Math.max(stats?.companies?.total ?? 1, 1)) * 100)}% of total`
    },
    {
      label: 'Total Users',
      value: stats?.users?.total ?? 0,
      Icon: Users,
      color: '#2563eb',
      bg: '#eff6ff',
      sub: `${stats?.users?.companyAdmins ?? 0} admins · ${stats?.users?.employees ?? 0} employees`
    },
    {
      label: 'Company Admins',
      value: stats?.users?.companyAdmins ?? 0,
      Icon: UserCog,
      color: '#7c3aed',
      bg: '#f5f3ff',
      sub: 'Across all companies'
    },
  ]

  const quickActions = [
    {
      Icon: Plus,
      title: 'Create New Company',
      desc: 'Add a new company to the platform',
      onClick: () => navigate('/super-admin/companies', { state: { openCreate: true } }),
      color: TEAL,
      bg: TEAL_LIGHT,
    },
    {
      Icon: LayoutList,
      title: 'View All Companies',
      desc: 'Manage and monitor existing companies',
      onClick: () => navigate('/super-admin/companies'),
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      Icon: Users,
      title: 'Manage Users',
      desc: 'View and update all platform users',
      onClick: () => navigate('/super-admin/users'),
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview — all companies and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.Icon size={22} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>

            {/* progress bar for active companies */}
            {card.label === 'Active Companies' && (
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    background: card.color,
                    width: `${Math.round(((stats?.companies?.active ?? 0) / Math.max(stats?.companies?.total ?? 1, 1)) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className="group flex items-start gap-4 p-4 rounded-xl border-2 border-dashed hover:border-solid transition-all text-left"
              style={{ borderColor: action.color + '55' }}
              onMouseEnter={e => { e.currentTarget.style.background = action.bg; e.currentTarget.style.borderColor = action.color }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = action.color + '55' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: action.bg }}>
                <action.Icon size={20} style={{ color: action.color }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Companies', value: stats?.companies?.total ?? 0, color: TEAL },
            { label: 'Active Companies', value: stats?.companies?.active ?? 0, color: '#16a34a' },
            { label: 'Suspended', value: stats?.companies?.suspended ?? 0, color: '#d97706' },
            { label: 'Total Users', value: stats?.users?.total ?? 0, color: '#2563eb' },
            { label: 'Company Admins', value: stats?.users?.companyAdmins ?? 0, color: '#7c3aed' },
            { label: 'Employees', value: stats?.users?.employees ?? 0, color: '#0891b2' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: item.color + '10' }}>
              <p className="text-sm text-gray-600">{item.label}</p>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                style={{ color: item.color, background: item.color + '20' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
