import { useState, useEffect } from 'react'
import axios from '../../config/axios'

export default function SuperAdminDashboard() {
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
      setStats({ companies: {}, users: {} }) // Set default values
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of all companies and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Companies */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.companies?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <span className="text-green-600">●</span>
            <span className="text-gray-600">{stats?.companies?.active || 0} Active</span>
            <span className="text-yellow-600">●</span>
            <span className="text-gray-600">{stats?.companies?.suspended || 0} Suspended</span>
          </div>
        </div>

        {/* Active Companies */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Companies</p>
              <p className="text-3xl font-bold text-green-600">{stats?.companies?.active || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${((stats?.companies?.active || 0) / (stats?.companies?.total || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <span>{stats?.users?.companyAdmins || 0} Admins</span>
            <span>{stats?.users?.employees || 0} Employees</span>
          </div>
        </div>

        {/* Company Admins */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Company Admins</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.users?.companyAdmins || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/super-admin/companies?action=create'}
            className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">➕</div>
            <h3 className="font-semibold text-gray-900">Create New Company</h3>
            <p className="text-sm text-gray-600">Add a new company to the platform</p>
          </button>

          <button
            onClick={() => window.location.href = '/super-admin/companies'}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">View All Companies</h3>
            <p className="text-sm text-gray-600">Manage existing companies</p>
          </button>

          <button
            onClick={() => window.location.href = '/super-admin/users'}
            className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage all users</p>
          </button>
        </div>
      </div>
    </div>
  )
}
