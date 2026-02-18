import Button from '../../../shared/components/button-reusable.jsx'
import { Eye, EyeOff } from 'lucide-react'

export default function ProfileTab({
  loading,
  profile,
  showPasswordForm,
  setShowPasswordForm,
  showEditProfileForm,
  setShowEditProfileForm,
  profileForm,
  setProfileForm,
  passwordForm,
  setPasswordForm,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleUpdateProfile,
  handleChangePassword,
  handleLogout
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>

        {/* Profile Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Nama:</span>
              <span className="text-gray-900">{profile.name || 'Employee Name'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Email:</span>
              <span className="text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Role:</span>
              <span className="text-gray-900">{profile.role || 'Employee'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Jabatan:</span>
              <span className="text-gray-900">{profile.position || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Divisi:</span>
              <span className="text-gray-900">{profile.department || '-'}</span>
            </div>
          </div>
        </div>

        {/* Edit / Change Password Buttons */}
        <div className="flex gap-4 mb-4">
          <Button
            nameProp={showEditProfileForm ? 'Sembunyikan Form' : 'Edit Profile'}
            onClick={() => {
              setShowEditProfileForm(!showEditProfileForm)
              if (!showEditProfileForm) setProfileForm({ name: profile.name })
            }}
            variant="primary"
          />
          <Button
            nameProp={showPasswordForm ? 'Sembunyikan Form' : 'Ubah Password'}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            variant="primary"
          />
        </div>

        {/* Edit Profile Form */}
        {showEditProfileForm && (
          <form onSubmit={handleUpdateProfile} className="bg-blue-50 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button nameProp={loading ? 'Menyimpan...' : 'Simpan Perubahan'} type="submit" variant="primary" disabled={loading} />
                <Button nameProp="Batal" type="button" onClick={() => setShowEditProfileForm(false)} variant="secondary" />
              </div>
            </div>
          </form>
        )}

        {/* Change Password Form */}
        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="bg-gray-50 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ubah Password</h3>
            <div className="space-y-4">
              {[
                { label: 'Password Lama', field: 'oldPassword', show: showOldPassword, setShow: setShowOldPassword },
                { label: 'Password Baru', field: 'newPassword', show: showNewPassword, setShow: setShowNewPassword },
                { label: 'Konfirmasi Password Baru', field: 'confirmPassword', show: showConfirmPassword, setShow: setShowConfirmPassword }
              ].map(({ label, field, show, setShow }) => (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold mb-2">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-4">
                <Button nameProp={loading ? 'Menyimpan...' : 'Simpan Password'} type="submit" variant="primary" disabled={loading} />
                <Button nameProp="Batal" type="button" onClick={() => setShowPasswordForm(false)} variant="secondary" />
              </div>
            </div>
          </form>
        )}

        {/* Logout */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Button nameProp="Logout" onClick={handleLogout} variant="danger" />
        </div>
      </div>
    </div>
  )
}
