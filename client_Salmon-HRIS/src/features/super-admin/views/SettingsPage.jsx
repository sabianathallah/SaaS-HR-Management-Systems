import { useState, useEffect } from 'react'
import { User, Lock, Save, Eye, EyeOff, Shield } from 'lucide-react'
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

export default function SettingsPage() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')

  const [profileForm, setProfileForm] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

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

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-gray-50 focus:bg-white transition-colors'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and view platform information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Profile + Password ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={User} iconBg={TEAL_LIGHT} iconColor={TEAL} title="Profile Information" />
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {/* Avatar + name display */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: TEAL_LIGHT }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: TEAL }}>
                  {profileForm.name?.charAt(0) || 'SA'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{profileForm.name || 'Super Admin'}</p>
                  <p className="text-sm text-gray-500">{profileForm.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: TEAL, color: '#fff' }}>
                    SUPER ADMIN
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
                <Field label="Phone Number">
                  <input type="tel" value={profileForm.phoneNumber}
                    onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    placeholder="+62..."
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
        </div>

        {/* ── Right: System Info ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <SectionHeader Icon={Shield} iconBg="#f5f3ff" iconColor="#7c3aed" title="System Information" />
            <div className="p-6 space-y-3">
              {[
                { label: 'Platform', value: 'Salmon HRIS' },
                { label: 'Version', value: 'v1.0.0' },
                { label: 'Role', value: 'Super Admin' },
                { label: 'Last Login', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
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
