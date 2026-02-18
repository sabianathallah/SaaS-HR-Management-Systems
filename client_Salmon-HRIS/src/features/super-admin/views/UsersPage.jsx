import { useState, useEffect } from 'react'
import { Users, User, UserCog, UserCheck, UserX, Pencil, X, Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import axios from '../../../shared/config/axios'
import { toast } from 'react-toastify'

const TEAL = '#1A9B9A'
const TEAL_LIGHT = '#E6F7F7'
const PAGE_SIZE = 10

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function InputField({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 focus:bg-white transition-colors"
      />
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    SUPER_ADMIN: { bg: '#f5f3ff', color: '#7c3aed' },
    COMPANY_ADMIN: { bg: '#eff6ff', color: '#2563eb' },
    EMPLOYEE: { bg: TEAL_LIGHT, color: TEAL },
  }
  const s = map[role] || { bg: '#f3f4f6', color: '#374151' }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {role}
    </span>
  )
}

function Pagination({ currentPage, totalPages, totalItems, label, onPageChange }) {
  if (totalPages <= 1) return null
  const start = (currentPage - 1) * PAGE_SIZE + 1
  const end = Math.min(currentPage * PAGE_SIZE, totalItems)

  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('…')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{start}–{end}</span> of{' '}
        <span className="font-semibold text-gray-700">{totalItems}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600">
          <ChevronLeft size={16} />
        </button>
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`el-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none">···</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={currentPage === p ? { background: TEAL, color: '#fff' } : { color: '#374151' }}
              onMouseEnter={e => { if (currentPage !== p) e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={e => { if (currentPage !== p) e.currentTarget.style.background = '' }}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('employee')
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', phoneNumber: '',
    role: 'EMPLOYEE', companyId: '', position: '', department: ''
  })
  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', position: '',
    department: '', role: 'EMPLOYEE', isActive: true
  })

  useEffect(() => { fetchCompanies() }, [])

  useEffect(() => {
    if (activeTab === 'admin') fetchAdminUsers()
    else if (selectedCompany) fetchEmployeeUsers()
    else { setUsers([]); setFilteredUsers([]) }
  }, [activeTab, selectedCompany])

  useEffect(() => { filterUsers() }, [users, searchTerm, statusFilter])

  // Reset page when filtered list changes
  useEffect(() => { setCurrentPage(1) }, [filteredUsers])

  async function fetchCompanies() {
    try {
      const { data } = await axios.get('/companies')
      setCompanies(data.data.companies || [])
    } catch {
      toast.error('Failed to load companies')
    }
  }

  async function fetchAdminUsers() {
    setLoading(true)
    try {
      const { data } = await axios.get('/users/admin')
      setUsers(data.data.filter(u => u.role === 'COMPANY_ADMIN'))
    } catch {
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
      setUsers(data.data.filter(u => u.role === 'EMPLOYEE' && u.companyId === parseInt(selectedCompany.id)))
    } catch {
      toast.error('Failed to load employee users')
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = [...users]
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(u => statusFilter === 'ACTIVE' ? u.isActive : !u.isActive)
    }
    setFilteredUsers(filtered)
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedCompany(null)
    setSearchTerm('')
    setStatusFilter('ALL')
    setCurrentPage(1)
    setUsers([])
    setFilteredUsers([])
  }

  function handleEditClick(user) {
    setSelectedUser(user)
    setFormData({
      name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '',
      position: user.position || '', department: user.department || '',
      role: user.role || 'EMPLOYEE', isActive: user.isActive
    })
    setShowEditModal(true)
  }

  async function handleUpdateUser(e) {
    e.preventDefault()
    try {
      await axios.put(`/users/admin/${selectedUser.id}`, formData)
      toast.success('User updated successfully!')
      setShowEditModal(false)
      activeTab === 'admin' ? fetchAdminUsers() : fetchEmployeeUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  function openCreateModal() {
    setCreateForm({
      name: '', email: '', password: '', phoneNumber: '',
      role: activeTab === 'admin' ? 'COMPANY_ADMIN' : 'EMPLOYEE',
      companyId: selectedCompany?.id || '',
      position: '', department: ''
    })
    setShowCreateModal(true)
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    try {
      await axios.post('/register', {
        ...createForm,
        companyId: createForm.companyId ? parseInt(createForm.companyId) : null
      })
      toast.success('User created successfully!')
      setShowCreateModal(false)
      activeTab === 'admin' ? fetchAdminUsers() : fetchEmployeeUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    }
  }

  async function handleToggleStatus(userId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return
    try {
      await axios.patch(`/users/admin/${userId}/status`, { isActive: !currentStatus })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      activeTab === 'admin' ? fetchAdminUsers() : fetchEmployeeUsers()
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.isActive).length,
    inactive: filteredUsers.filter(u => !u.isActive).length,
  }

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const TABS = [
    { key: 'employee', label: 'Employees', Icon: User },
    { key: 'admin', label: 'Administrators', Icon: UserCog },
  ]

  const STAT_CARDS = [
    { label: activeTab === 'admin' ? 'Total Admins' : 'Total Employees', value: stats.total, color: TEAL, bg: TEAL_LIGHT, Icon: Users },
    { label: 'Active', value: stats.active, color: '#16a34a', bg: '#f0fdf4', Icon: UserCheck },
    { label: 'Inactive', value: stats.inactive, color: '#dc2626', bg: '#fef2f2', Icon: UserX },
  ]

  const tableLabel = activeTab === 'admin' ? 'administrators' : 'employees'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage administrators and employees across companies</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-shadow"
          style={{ background: TEAL }}
          onMouseEnter={e => e.currentTarget.style.background = '#158888'}
          onMouseLeave={e => e.currentTarget.style.background = TEAL}
        >
          <UserPlus size={16} />
          Create User
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => handleTabChange(key)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === key
              ? { background: TEAL, color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }
              : { color: '#6b7280' }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Company Selector */}
      {activeTab === 'employee' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Company</label>
          <select
            value={selectedCompany?.id || ''}
            onChange={e => setSelectedCompany(companies.find(c => c.id === parseInt(e.target.value)) || null)}
            className="w-full max-w-sm px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50"
          >
            <option value="">— Select a company to view employees —</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!selectedCompany && (
            <p className="mt-2 text-xs text-gray-400">Please select a company first to view employee list</p>
          )}
        </div>
      )}

      {/* Content */}
      {(activeTab === 'admin' || (activeTab === 'employee' && selectedCompany)) && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {STAT_CARDS.map(({ label, value, color, bg, Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-48 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, position..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50"
                />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50">
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: TEAL }}></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100" style={{ background: TEAL_LIGHT }}>
                      {['User', 'Contact', 'Position', 'Role', 'Status', ...(activeTab === 'employee' ? ['Leave Quota'] : []), 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: TEAL }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                          <Search size={48} className="mx-auto mb-2" style={{ color: '#d1d5db' }} />
                          <p>No {tableLabel} found</p>
                          {(searchTerm || statusFilter !== 'ALL') && (
                            <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL') }}
                              className="mt-2 text-sm font-medium" style={{ color: TEAL }}>
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : paginatedUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: user.role === 'COMPANY_ADMIN' ? '#2563eb' : TEAL }}>
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phoneNumber || '-'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700">{user.position || '-'}</p>
                          <p className="text-xs text-gray-400">{user.department || '-'}</p>
                        </td>
                        <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={user.isActive
                              ? { background: '#f0fdf4', color: '#16a34a' }
                              : { background: '#fef2f2', color: '#dc2626' }}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {activeTab === 'employee' && (
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {user.usedLeaveQuota || 0} / {user.annualLeaveQuota || 0}
                            </p>
                            <p className="text-xs text-gray-400">Remaining: {user.remainingLeaveQuota || 0}</p>
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditClick(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                              <Pencil size={13} /> Edit
                            </button>
                            <button onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                user.isActive
                                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                  : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                              }`}>
                              {user.isActive
                                ? <><UserX size={13} /> Deactivate</>
                                : <><UserCheck size={13} /> Activate</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                label={tableLabel}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal title="Create New User" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Full Name" required type="text" value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              <InputField label="Email" required type="email" value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
              <InputField label="Password" required type="password" value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })} />
              <InputField label="Phone Number" type="tel" value={createForm.phoneNumber}
                onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select required value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <select required value={createForm.companyId}
                  onChange={e => setCreateForm({ ...createForm, companyId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50">
                  <option value="">— Select Company —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <InputField label="Position" type="text" value={createForm.position}
                onChange={e => setCreateForm({ ...createForm, position: e.target.value })} />
              <InputField label="Department" type="text" value={createForm.department}
                onChange={e => setCreateForm({ ...createForm, department: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
                style={{ background: TEAL }}
                onMouseEnter={e => e.currentTarget.style.background = '#158888'}
                onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                <UserPlus size={15} />
                Create User
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <Modal title={`Edit User — ${selectedUser.name}`} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Name" required type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <InputField label="Email" required type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <InputField label="Phone Number" type="tel" value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
              <InputField label="Position" type="text" value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })} />
              <InputField label="Department" type="text" value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select required value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded" style={{ accentColor: TEAL }} />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
                style={{ background: TEAL }}
                onMouseEnter={e => e.currentTarget.style.background = '#158888'}
                onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                Update User
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
