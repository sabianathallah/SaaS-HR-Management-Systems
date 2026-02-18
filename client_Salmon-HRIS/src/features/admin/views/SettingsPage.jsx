import { useState } from 'react'
import { User, Lock, Building2, Clock, Save, Eye, EyeOff, Shield, ToggleLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from '../../../shared/config/axios'

const TEAL = '#1A9B9A'
const TEAL_LIGHT = '#E6F7F7'

function SectionHeader({ Icon, iconBg, iconColor, title }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const ATTENDANCE_KEY = 'admin_attendance_settings'

const defaultAttendance = {
  allowLateClockIn: true,
  requirePhoto: true,
  requireGPS: true,
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
}

export default function SettingsPage() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  const companyData = JSON.parse(localStorage.getItem('company') || 'null')
  const savedAtt = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || 'null')

  const [profileForm, setProfileForm] = useState({
    name: userData.name || '',
    email: userData.email || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [companyForm, setCompanyForm] = useState({
    name: companyData?.name || '',
  })
  const [attendanceForm, setAttendanceForm] = useState(savedAtt || defaultAttendance)

  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 focus:bg-white transition-colors'

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await axios.put(`/users/admin/${userData.id}`, { name: profileForm.name, email: profileForm.email })
      const updated = { ...userData, name: profileForm.name, email: profileForm.email }
      localStorage.setItem('user', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('userUpdated'))
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      await axios.put('/profile/change-password', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleSaveCompany(e) {
    e.preventDefault()
    if (!companyData?.id) {
      toast.error('Company data not found')
      return
    }
    setSavingCompany(true)
    try {
      await axios.put(`/companies/${companyData.id}`, { name: companyForm.name })
      const updated = { ...companyData, name: companyForm.name }
      localStorage.setItem('company', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('userUpdated'))
      toast.success('Company settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save company settings')
    } finally {
      setSavingCompany(false)
    }
  }

  function handleSaveAttendance(e) {
    e.preventDefault()
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceForm))
    toast.success('Attendance settings saved!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, company, and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={User} iconBg={TEAL_LIGHT} iconColor={TEAL} title="Profile Information" />
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: TEAL_LIGHT }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: TEAL }}>
                  {profileForm.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{profileForm.name || 'Admin'}</p>
                  <p className="text-sm text-gray-500">{profileForm.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: TEAL, color: '#fff' }}>
                    COMPANY ADMIN
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input type="text" value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
                  style={{ background: TEAL }}
                  onMouseEnter={e => { if (!savingProfile) e.currentTarget.style.background = '#158888' }}
                  onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                  <Save size={15} />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={Lock} iconBg="#fef3c7" iconColor="#d97706" title="Change Password" />
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {[
                { key: 'current', label: 'Current Password', field: 'currentPassword' },
                { key: 'new', label: 'New Password', field: 'newPassword' },
                { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
              ].map(({ key, label, field }) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={e => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                      className={inputClass + ' pr-10'}
                    />
                    <button type="button"
                      onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              ))}
              <p className="text-xs text-gray-400">Minimum 6 characters</p>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={savingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
                  style={{ background: '#d97706' }}
                  onMouseEnter={e => { if (!savingPassword) e.currentTarget.style.background = '#b45309' }}
                  onMouseLeave={e => e.currentTarget.style.background = '#d97706'}>
                  <Lock size={15} />
                  {savingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Company Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={Building2} iconBg="#eff6ff" iconColor="#2563eb" title="Company Settings" />
            <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
              <Field label="Company Name">
                <input type="text" value={companyForm.name}
                  onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className={inputClass} />
              </Field>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={savingCompany}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
                  style={{ background: '#2563eb' }}
                  onMouseEnter={e => { if (!savingCompany) e.currentTarget.style.background = '#1d4ed8' }}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                  <Save size={15} />
                  {savingCompany ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>

          {/* Attendance Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={ToggleLeft} iconBg="#f0fdf4" iconColor="#16a34a" title="Attendance Settings" />
            <form onSubmit={handleSaveAttendance} className="p-6 space-y-5">
              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Work Start Time">
                  <input type="time" value={attendanceForm.workingHoursStart}
                    onChange={e => setAttendanceForm({ ...attendanceForm, workingHoursStart: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Work End Time">
                  <input type="time" value={attendanceForm.workingHoursEnd}
                    onChange={e => setAttendanceForm({ ...attendanceForm, workingHoursEnd: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              {/* Toggles */}
              {[
                { key: 'allowLateClockIn', label: 'Allow Late Clock-In', desc: 'Employees can clock in after working hours start' },
                { key: 'requirePhoto', label: 'Require Photo', desc: 'Employees must upload a photo when clocking in/out' },
                { key: 'requireGPS', label: 'Require GPS Location', desc: 'Verify employee location when clocking in/out' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                    <input type="checkbox" checked={attendanceForm[key]}
                      onChange={e => setAttendanceForm({ ...attendanceForm, [key]: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                      peer-checked:after:translate-x-full peer-checked:after:border-white
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                      after:bg-white after:border-gray-300 after:border after:rounded-full
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                  style={{ background: '#16a34a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
                  <Save size={15} />
                  Save Attendance Settings
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right: System Info */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={Shield} iconBg="#f5f3ff" iconColor="#7c3aed" title="System Information" />
            <div className="p-6 space-y-3">
              {[
                { label: 'Platform', value: 'Salmon HRIS' },
                { label: 'Version', value: 'v1.0.0' },
                { label: 'Role', value: 'Company Admin' },
                { label: 'Company', value: companyData?.name || '—' },
                { label: 'Last Login', value: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm py-0.5">
                  <p className="text-gray-500">{item.label}</p>
                  <p className="font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
