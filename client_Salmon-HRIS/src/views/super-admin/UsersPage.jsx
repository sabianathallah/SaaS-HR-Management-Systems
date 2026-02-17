import { useState, useEffect } from 'react'
import axios from '../../config/axios'
import { toast } from 'react-toastify'

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('employee') // 'admin' or 'employee'
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    role: 'EMPLOYEE',
    isActive: true
  })

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Fetch users when company or tab changes
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminUsers()
    } else if (selectedCompany) {
      fetchEmployeeUsers()
    } else {
      setUsers([])
      setFilteredUsers([])
    }
  }, [activeTab, selectedCompany])

  // Filter users when search or status changes
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  async function fetchCompanies() {
    try {
      const { data } = await axios.get('/companies')
      setCompanies(data.data.companies || [])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      toast.error('Failed to load companies')
    }
  }

  async function fetchAdminUsers() {
    setLoading(true)
    try {
      const { data } = await axios.get('/users/admin')
      // Filter only COMPANY_ADMIN (exclude SUPER_ADMIN)
      const admins = data.data.filter(user => 
        user.role === 'COMPANY_ADMIN'
      )
      setUsers(admins)
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
      toast.error('Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  async function fetchEmployeeUsers() {
    if (!selectedCompany) return
    
    setLoading(true)
    try {
      const { data } = await axios.get('/users/admin')
      // Filter only employees from selected company
      const employees = data.data.filter(user => {
        console.log('User:', user.name, 'Role:', user.role, 'CompanyId:', user.companyId, 'Selected:', selectedCompany.id)
        return user.role === 'EMPLOYEE' && user.companyId === parseInt(selectedCompany.id)
      })
      console.log('Filtered employees:', employees.length)
      setUsers(employees)
    } catch (error) {
      console.error('Failed to fetch employee users:', error)
      toast.error('Failed to load employee users')
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => 
        statusFilter === 'ACTIVE' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedCompany(null)
    setSearchTerm('')
    setStatusFilter('ALL')
    setUsers([])
    setFilteredUsers([])
  }

  function handleCompanyChange(companyId) {
    const company = companies.find(c => c.id === parseInt(companyId))
    setSelectedCompany(company)
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  function handleEditClick(user) {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      position: user.position || '',
      department: user.department || '',
      role: user.role || 'EMPLOYEE',
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  async function handleUpdateUser(e) {
    e.preventDefault()
    try {
      await axios.put(`/users/admin/${selectedUser.id}`, formData)
      toast.success('User updated successfully!')
      setShowEditModal(false)
      // Re-fetch based on current tab
      if (activeTab === 'admin') {
        fetchAdminUsers()
      } else {
        fetchEmployeeUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  async function handleToggleStatus(userId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return
    }

    try {
      await axios.patch(`/users/admin/${userId}/status`, {
        isActive: !currentStatus
      })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      // Re-fetch based on current tab
      if (activeTab === 'admin') {
        fetchAdminUsers()
      } else {
        fetchEmployeeUsers()
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      toast.error('Failed to update user status')
    }
  }

  function getRoleBadgeColor(role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'COMPANY_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats based on current view
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.isActive).length,
    inactive: filteredUsers.filter(u => !u.isActive).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage administrators and employees</p>
      </div>

      {/* Tab Selection */}
      <div className="bg-white rounded-lg shadow p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange('employee')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'employee'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 Employees
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👨‍💼 Administrators
          </button>
        </div>
      </div>

      {/* Company Selector - Only for Employee Tab */}
      {activeTab === 'employee' && (
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Company *
          </label>
          <select
            value={selectedCompany?.id || ''}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">-- Select a company to view employees --</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name} {company.isActive ? '✅' : '❌'}
              </option>
            ))}
          </select>
          {!selectedCompany && (
            <p className="mt-2 text-sm text-gray-500">
              ℹ️ Please select a company first to view employee list
            </p>
          )}
        </div>
      )}

      {/* Show content only if admins tab OR employee tab with company selected */}
      {(activeTab === 'admin' || (activeTab === 'employee' && selectedCompany)) && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'admin' ? 'Total Admins' : 'Total Employees'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {activeTab === 'employee' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Quota
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          {activeTab === 'employee' && selectedCompany ? (
                            <>
                              <div className="text-4xl mb-2">📭</div>
                              <p>No employees found in {selectedCompany.name}</p>
                            </>
                          ) : (
                            <>
                              <div className="text-4xl mb-2">🔍</div>
                              <p>No {activeTab === 'admin' ? 'administrators' : 'employees'} found</p>
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phoneNumber || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.position || '-'}</div>
                            <div className="text-sm text-gray-500">{user.department || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {activeTab === 'employee' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>{user.usedLeaveQuota || 0} / {user.annualLeaveQuota || 0}</div>
                              <div className="text-xs text-gray-500">
                                Remaining: {user.remainingLeaveQuota || 0}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                className={`${
                                  user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                }`}
                              >
                                {user.isActive ? '🚫 Deactivate' : '✅ Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
