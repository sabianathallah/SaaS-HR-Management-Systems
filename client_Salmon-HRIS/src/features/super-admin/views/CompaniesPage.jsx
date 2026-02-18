import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import { Plus, Eye, Pencil, X, Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
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
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
        style={{ '--tw-ring-color': TEAL }}
      />
    </div>
  )
}

function SelectField({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
        style={{ '--tw-ring-color': TEAL }}
      >
        {children}
      </select>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active: { bg: '#f0fdf4', color: '#16a34a', label: 'Active' },
    suspended: { bg: '#fffbeb', color: '#d97706', label: 'Suspended' },
    inactive: { bg: '#fef2f2', color: '#dc2626', label: 'Inactive' },
  }
  const s = map[status] || map.inactive
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function PlanBadge({ plan }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: TEAL_LIGHT, color: TEAL }}>
      {plan}
    </span>
  )
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
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
        <span className="font-semibold text-gray-700">{totalItems}</span> companies
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

export default function CompaniesPage() {
  const location = useLocation()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companyDetail, setCompanyDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const emptyCreate = {
    name: '', slug: '', email: '', phoneNumber: '', address: '',
    industry: '', subscriptionPlan: 'basic',
    adminName: '', adminEmail: '', adminPassword: '', adminPhoneNumber: ''
  }
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editForm, setEditForm] = useState({
    name: '', email: '', phoneNumber: '', address: '',
    website: '', industry: '', status: 'active',
    subscriptionPlan: 'basic', subscriptionExpiresAt: ''
  })

  useEffect(() => {
    fetchCompanies()
    if (location.state?.openCreate) setShowCreateModal(true)
  }, [])

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter])

  async function fetchCompanies() {
    try {
      const { data } = await axios.get('/companies')
      setCompanies(data.data.companies)
    } catch {
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  async function handleViewCompany(company) {
    setSelectedCompany(company)
    setShowViewModal(true)
    setDetailLoading(true)
    try {
      const { data } = await axios.get(`/companies/${company.id}`)
      setCompanyDetail(data.data)
    } catch {
      toast.error('Failed to load company details')
    } finally {
      setDetailLoading(false)
    }
  }

  function handleEditClick(company) {
    setSelectedCompany(company)
    setEditForm({
      name: company.name || '',
      email: company.email || '',
      phoneNumber: company.phoneNumber || '',
      address: company.address || '',
      website: company.website || '',
      industry: company.industry || '',
      status: company.status || 'active',
      subscriptionPlan: company.subscriptionPlan || 'basic',
      subscriptionExpiresAt: company.subscriptionExpiresAt ? company.subscriptionExpiresAt.split('T')[0] : ''
    })
    setShowEditModal(true)
  }

  async function handleCreateCompany(e) {
    e.preventDefault()
    try {
      await axios.post('/companies', createForm)
      toast.success('Company created successfully!')
      setShowCreateModal(false)
      setCreateForm(emptyCreate)
      fetchCompanies()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create company')
    }
  }

  async function handleUpdateCompany(e) {
    e.preventDefault()
    try {
      await axios.put(`/companies/${selectedCompany.id}`, editForm)
      toast.success('Company updated successfully!')
      setShowEditModal(false)
      setSelectedCompany(null)
      fetchCompanies()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update company')
    }
  }

  function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  // Derived data
  const filteredCompanies = companies.filter(c => {
    const matchSearch = !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE)
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const PILLS = [
    { key: 'all', label: 'Total', value: companies.length, color: TEAL, bg: TEAL_LIGHT },
    { key: 'active', label: 'Active', value: companies.filter(c => c.status === 'active').length, color: '#16a34a', bg: '#f0fdf4' },
    { key: 'suspended', label: 'Suspended', value: companies.filter(c => c.status === 'suspended').length, color: '#d97706', bg: '#fffbeb' },
    { key: 'inactive', label: 'Inactive', value: companies.filter(c => c.status === 'inactive').length, color: '#dc2626', bg: '#fef2f2' },
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all companies on the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-shadow"
          style={{ background: TEAL }}
          onMouseEnter={e => e.currentTarget.style.background = '#158888'}
          onMouseLeave={e => e.currentTarget.style.background = TEAL}
        >
          <Plus size={16} />
          Create Company
        </button>
      </div>

      {/* Interactive status pills */}
      <div className="flex gap-3 flex-wrap">
        {PILLS.map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all"
            style={statusFilter === item.key
              ? { background: item.color, color: '#fff', borderColor: item.color }
              : { background: item.bg, color: item.color, borderColor: item.color + '33' }}
          >
            <span className="text-xl font-bold">{item.value}</span>
            <span className="font-medium opacity-90">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company name, email, or slug..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: TEAL_LIGHT }}>
                {['Company', 'Contact', 'Employees', 'Plan', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: TEAL }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <Building2 size={48} className="mx-auto mb-2" style={{ color: '#d1d5db' }} />
                    <p>{searchTerm || statusFilter !== 'all' ? 'No companies match your filters' : 'No companies yet'}</p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <button onClick={() => { setSearchTerm(''); setStatusFilter('all') }}
                        className="mt-2 text-sm font-medium" style={{ color: TEAL }}>
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : paginatedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: TEAL }}>
                        {company.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-400">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-700">{company.email || '-'}</p>
                    <p className="text-xs text-gray-400">{company.phoneNumber || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-gray-900">{company.employeeCount}</span>
                  </td>
                  <td className="px-5 py-4">
                    <PlanBadge plan={company.subscriptionPlan} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={company.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewCompany(company)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                        style={{ color: TEAL, borderColor: TEAL + '44', background: TEAL_LIGHT }}
                        onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL }}>
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => handleEditClick(company)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                        <Pencil size={13} /> Edit
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
          totalItems={filteredCompanies.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ── VIEW MODAL ── */}
      {showViewModal && selectedCompany && (
        <Modal title={selectedCompany.name} onClose={() => { setShowViewModal(false); setCompanyDetail(null) }}>
          {detailLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: TEAL }}></div>
            </div>
          ) : companyDetail ? (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Employees', value: companyDetail.stats.totalEmployees, color: TEAL, bg: TEAL_LIGHT },
                  { label: 'Active', value: companyDetail.stats.activeEmployees, color: '#16a34a', bg: '#f0fdf4' },
                  { label: 'Admins', value: companyDetail.stats.admins, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {[
                  { label: 'Email', value: companyDetail.company.email },
                  { label: 'Phone', value: companyDetail.company.phoneNumber },
                  { label: 'Address', value: companyDetail.company.address },
                  { label: 'Industry', value: companyDetail.company.industry },
                  { label: 'Website', value: companyDetail.company.website },
                  { label: 'Plan', value: companyDetail.company.subscriptionPlan },
                  { label: 'Status', value: companyDetail.company.status },
                  {
                    label: 'Subscription Expires',
                    value: companyDetail.company.subscriptionExpiresAt
                      ? new Date(companyDetail.company.subscriptionExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : null
                  }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="text-gray-900 font-semibold text-right max-w-xs truncate">{value || '-'}</span>
                  </div>
                ))}
              </div>

              {companyDetail.company.users?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Users</p>
                  <div className="space-y-2">
                    {companyDetail.company.users.map(user => (
                      <div key={user.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: user.role === 'COMPANY_ADMIN' ? '#2563eb' : TEAL }}>
                            {user.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={user.role === 'COMPANY_ADMIN'
                            ? { background: '#eff6ff', color: '#2563eb' }
                            : { background: TEAL_LIGHT, color: TEAL }}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setShowViewModal(false); setCompanyDetail(null); handleEditClick(selectedCompany) }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
                  style={{ background: TEAL }}
                  onMouseEnter={e => e.currentTarget.style.background = '#158888'}
                  onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                  <Pencil size={14} /> Edit Company
                </button>
                <button onClick={() => { setShowViewModal(false); setCompanyDetail(null) }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && selectedCompany && (
        <Modal title={`Edit — ${selectedCompany.name}`} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateCompany} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Company Name" required type="text" value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              <InputField label="Email" type="email" value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              <InputField label="Phone" type="tel" value={editForm.phoneNumber}
                onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
              <InputField label="Website" type="url" placeholder="https://..." value={editForm.website}
                onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
              <InputField label="Industry" type="text" placeholder="e.g., Technology" value={editForm.industry}
                onChange={e => setEditForm({ ...editForm, industry: e.target.value })} />
              <SelectField label="Subscription Plan" value={editForm.subscriptionPlan}
                onChange={e => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </SelectField>
              <SelectField label="Status" value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </SelectField>
              <InputField label="Subscription Expires" type="date" value={editForm.subscriptionExpiresAt}
                onChange={e => setEditForm({ ...editForm, subscriptionExpiresAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={editForm.address} rows={2}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 resize-none" />
            </div>
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
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <Modal title="Create New Company" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Company Name" required type="text" value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value, slug: generateSlug(e.target.value) })} />
              <InputField label="Slug" required type="text" value={createForm.slug}
                onChange={e => setCreateForm({ ...createForm, slug: e.target.value })} />
              <InputField label="Email" type="email" value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
              <InputField label="Phone" type="tel" value={createForm.phoneNumber}
                onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })} />
              <InputField label="Industry" type="text" placeholder="e.g., Technology" value={createForm.industry}
                onChange={e => setCreateForm({ ...createForm, industry: e.target.value })} />
              <SelectField label="Subscription Plan" value={createForm.subscriptionPlan}
                onChange={e => setCreateForm({ ...createForm, subscriptionPlan: e.target.value })}>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={createForm.address} rows={2}
                onChange={e => setCreateForm({ ...createForm, address: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 resize-none" />
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Company Admin Account</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Admin Name" required type="text" value={createForm.adminName}
                  onChange={e => setCreateForm({ ...createForm, adminName: e.target.value })} />
                <InputField label="Admin Email" required type="email" value={createForm.adminEmail}
                  onChange={e => setCreateForm({ ...createForm, adminEmail: e.target.value })} />
                <InputField label="Admin Password" required type="password" value={createForm.adminPassword}
                  onChange={e => setCreateForm({ ...createForm, adminPassword: e.target.value })} />
                <InputField label="Admin Phone" type="tel" value={createForm.adminPhoneNumber}
                  onChange={e => setCreateForm({ ...createForm, adminPhoneNumber: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
                style={{ background: TEAL }}
                onMouseEnter={e => e.currentTarget.style.background = '#158888'}
                onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                Create Company
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
