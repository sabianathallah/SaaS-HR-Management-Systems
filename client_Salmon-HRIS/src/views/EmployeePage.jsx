import { useState, useEffect } from 'react'
import axios from 'axios'
import baseUrl from '../constant/url.js'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import logoNavbar from '../assets/logo-navbar.png'
import Button from '../components/button-reusable.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import GPSLocation from '../components/GPSLocation.jsx'
import Modal from '../components/Modal.jsx'

export default function EmployeePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // Camera & GPS State
  const [showCamera, setShowCamera] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [gpsLocation, setGPSLocation] = useState(null)
  const [clockAction, setClockAction] = useState(null) // 'in' or 'out'
  
  // Dashboard State
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Attendance State
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  
  // Leave State
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: ''
  })
  
  // Overtime State
  const [overtimeRequests, setOvertimeRequests] = useState([])
  const [showOvertimeForm, setShowOvertimeForm] = useState(false)
  const [overtimeForm, setOvertimeForm] = useState({
    overtimeDate: '',
    requestedHours: '',
    reason: ''
  })
  
  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    position: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    
    if (activeTab === 'dashboard') {
      fetchDashboardData()
    } else if (activeTab === 'attendance') {
      fetchAttendanceHistory()
    } else if (activeTab === 'leave') {
      fetchLeaveData()
    } else if (activeTab === 'profile') {
      fetchProfile()
    }
  }, [activeTab, navigate])

  // ==================== DASHBOARD FUNCTIONS ====================
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const [todayRes, notifRes, countRes] = await Promise.all([
        axios.get(`${baseUrl}/attendances/today-attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseUrl}/notifications?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseUrl}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setTodayAttendance(todayRes.data.data)
      setNotifications(notifRes.data.data || [])
      setUnreadCount(countRes.data.data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ==================== CAMERA & GPS FUNCTIONS ====================
  const initClockIn = () => {
    console.log('🎬 Initiating Clock In flow')
    setClockAction('in')
    setShowCamera(true)
    setCapturedPhoto(null)
    setGPSLocation(null)
  }

  const initClockOut = () => {
    console.log('🎬 Initiating Clock Out flow')
    setClockAction('out')
    setShowCamera(true)
    setCapturedPhoto(null)
    setGPSLocation(null)
  }

  const handlePhotoCapture = (photo) => {
    console.log('📸 Photo captured:', photo)
    setCapturedPhoto(photo)
    setShowCamera(false)
  }

  const handleGPSCapture = (location) => {
    console.log('📍 GPS captured:', location)
    setGPSLocation(location)
  }

  const handleClockIn = async () => {
    if (!capturedPhoto || !gpsLocation) {
      toast.error('Foto dan lokasi GPS diperlukan!')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      console.log('🚀 Sending clock-in data:', {
        photo: capturedPhoto.name,
        photoSize: capturedPhoto.size,
        photoType: capturedPhoto.type,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude
      })
      
      // Prepare form data with photo and GPS
      const formData = new FormData()
      formData.append('photo', capturedPhoto, capturedPhoto.name)
      formData.append('latitude', String(gpsLocation.latitude))
      formData.append('longitude', String(gpsLocation.longitude))
      
      // Debug: log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value)
      }
      
      const { data } = await axios.post(`${baseUrl}/attendances/clock-in`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary
        }
      })
      
      console.log('✅ Clock-in response:', data)
      toast.success('Clock-in berhasil!')
      setTodayAttendance(data.data)
      
      // Reset states
      setCapturedPhoto(null)
      setGPSLocation(null)
      setClockAction(null)
      
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('❌ Error clock-in:', error)
      console.error('❌ Error response:', error.response?.data)
      
      // User-friendly error messages
      const errorMsg = error.response?.data?.message
      if (errorMsg === 'Already clocked in today') {
        toast.error('Anda sudah clock-in hari ini!')
        // Refresh data untuk update UI
        fetchDashboardData()
      } else if (errorMsg?.includes('Photo')) {
        toast.error('Foto diperlukan untuk clock-in')
      } else {
        toast.error(errorMsg || 'Gagal clock-in')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!capturedPhoto || !gpsLocation) {
      toast.error('Foto dan lokasi GPS diperlukan!')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      console.log('🚀 Sending clock-out data:', {
        photo: capturedPhoto.name,
        photoSize: capturedPhoto.size,
        photoType: capturedPhoto.type,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude
      })
      
      // Prepare form data with photo and GPS
      const formData = new FormData()
      formData.append('photo', capturedPhoto, capturedPhoto.name)
      formData.append('latitude', String(gpsLocation.latitude))
      formData.append('longitude', String(gpsLocation.longitude))
      
      // Debug: log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value)
      }
      
      // Clock-out menggunakan PUT untuk UPDATE record yang sudah ada
      const { data } = await axios.put(`${baseUrl}/attendances/clock-out`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary
        }
      })
      
      console.log('✅ Clock-out response:', data)
      toast.success('Clock-out berhasil!')
      setTodayAttendance(data.data)
      
      // Reset states
      setCapturedPhoto(null)
      setGPSLocation(null)
      setClockAction(null)
      
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('❌ Error clock-out:', error)
      console.error('❌ Error response:', error.response?.data)
      
      // User-friendly error messages
      const errorMsg = error.response?.data?.message
      if (errorMsg?.includes('No clock-in')) {
        toast.error('Anda belum clock-in hari ini!')
        // Refresh data untuk update UI
        fetchDashboardData()
      } else if (errorMsg?.includes('Photo')) {
        toast.error('Foto diperlukan untuk clock-out')
      } else {
        toast.error(errorMsg || 'Gagal clock-out')
      }
    } finally {
      setLoading(false)
    }
  }

  const cancelClockAction = () => {
    console.log('❌ Canceling clock action')
    setClockAction(null)
    setCapturedPhoto(null)
    setGPSLocation(null)
    setShowCamera(false)
  }

  const markNotificationAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.patch(`${baseUrl}/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error marking notification:', error)
    }
  }

  // ==================== ATTENDANCE FUNCTIONS ====================
  const fetchAttendanceHistory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.get(`${baseUrl}/attendances/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAttendanceHistory(data.data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Gagal memuat riwayat attendance')
    } finally {
      setLoading(false)
    }
  }

  const viewAttendanceDetail = (attendance) => {
    setSelectedAttendance(attendance)
    setShowAttendanceModal(true)
  }

  // ==================== LEAVE FUNCTIONS ====================
  const fetchLeaveData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const [requestsRes, balanceRes] = await Promise.all([
        axios.get(`${baseUrl}/leave-requests/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseUrl}/leave-requests/my-balance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setLeaveRequests(requestsRes.data.data || [])
      setLeaveBalance(balanceRes.data.data)
    } catch (error) {
      console.error('Error fetching leave data:', error)
      toast.error('Gagal memuat data cuti')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form fields
    if (!leaveForm.startDate) {
      toast.error('Tanggal mulai harus diisi')
      return
    }
    
    if (!leaveForm.endDate) {
      toast.error('Tanggal selesai harus diisi')
      return
    }
    
    if (!leaveForm.reason || !leaveForm.reason.trim()) {
      toast.error('Alasan harus diisi')
      return
    }
    
    // Validate end date is not before start date
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      console.log('Submitting leave request:', leaveForm)
      
      await axios.post(`${baseUrl}/leave-requests`, leaveForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Pengajuan cuti berhasil dikirim!')
      setShowLeaveForm(false)
      setLeaveForm({
        leaveType: 'ANNUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: ''
      })
      fetchLeaveData()
    } catch (error) {
      console.error('Error submitting leave:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || 'Gagal mengajukan cuti'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Yakin ingin membatalkan pengajuan ini?')) return
    
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`${baseUrl}/leave-requests/${leaveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Pengajuan berhasil dibatalkan')
      fetchLeaveData()
    } catch (error) {
      console.error('Error cancelling leave:', error)
      toast.error(error.response?.data?.message || 'Gagal membatalkan pengajuan')
    }
  }

  // ==================== OVERTIME FUNCTIONS ====================
  const fetchOvertimeData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.get(`${baseUrl}/overtimes/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setOvertimeRequests(data.data || [])
    } catch (error) {
      console.error('Error fetching overtime:', error)
      toast.error('Gagal memuat data overtime')
    } finally {
      setLoading(false)
    }
  }

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.post(`${baseUrl}/overtimes/request`, overtimeForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Pengajuan overtime berhasil dikirim!')
      setShowOvertimeForm(false)
      setOvertimeForm({
        overtimeDate: '',
        requestedHours: '',
        reason: ''
      })
      fetchOvertimeData()
    } catch (error) {
      console.error('Error submitting overtime:', error)
      toast.error(error.response?.data?.message || 'Gagal mengajukan overtime')
    } finally {
      setLoading(false)
    }
  }

  // ==================== PROFILE FUNCTIONS ====================
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      // Assuming there's a profile endpoint, adjust if different
      const { data } = await axios.get(`${baseUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProfile(data.data || profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set default profile from localStorage if available
      const userEmail = localStorage.getItem('user_email') || 'employee@example.com'
      setProfile({ ...profile, email: userEmail })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok!')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(`${baseUrl}/change-password`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Password berhasil diubah!')
      setShowPasswordForm(false)
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    toast.success('Logout berhasil')
    navigate('/login')
  }

  // ==================== RENDER FUNCTIONS ====================
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Employee</h2>
        
        {/* Clock Status */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Status Hari Ini</h3>
          
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clock In:</span>
                <span className="font-semibold text-green-600">
                  {new Date(todayAttendance.clockIn).toLocaleTimeString('id-ID')}
                </span>
              </div>
              
              {todayAttendance.clockOut ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clock Out:</span>
                    <span className="font-semibold text-red-600">
                      {new Date(todayAttendance.clockOut).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Durasi Kerja:</span>
                    <span className="font-semibold text-blue-600">
                      {todayAttendance.workDurationHours || 0} jam
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      todayAttendance.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                      todayAttendance.status === 'LATE' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {todayAttendance.status}
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <Button 
                    nameProp="📸 Clock Out" 
                    onClick={initClockOut}
                    variant="danger"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">Anda belum clock-in hari ini</p>
              <Button 
                nameProp="📸 Clock In" 
                onClick={initClockIn}
                variant="primary"
              />
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Notifikasi {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notif.isRead ? 'bg-white' : 'bg-blue-100 border-l-4 border-blue-500'
                  }`}
                  onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Tidak ada notifikasi</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderAttendance = () => (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            nameProp="📸 Clock In" 
            onClick={initClockIn}
            variant="primary"
            disabled={todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut}
          />
          <Button 
            nameProp="📸 Clock Out" 
            onClick={initClockOut}
            variant="danger"
            disabled={!todayAttendance || !todayAttendance.clockIn || todayAttendance.clockOut}
          />
        </div>

        {/* Attendance History */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Attendance</h3>
        
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : attendanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(att.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockIn ? new Date(att.clockIn).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockOut ? new Date(att.clockOut).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        att.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                        att.status === 'LATE' ? 'bg-red-200 text-red-800' :
                        att.status === 'ABSENT' ? 'bg-gray-200 text-gray-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewAttendanceDetail(att)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">Belum ada riwayat attendance</p>
        )}
      </div>

      {/* Attendance Detail Modal */}
      {showAttendanceModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Attendance</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold">
                  {new Date(selectedAttendance.date).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clock In:</span>
                <span className="font-semibold">
                  {selectedAttendance.clockIn 
                    ? new Date(selectedAttendance.clockIn).toLocaleTimeString('id-ID') 
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clock Out:</span>
                <span className="font-semibold">
                  {selectedAttendance.clockOut 
                    ? new Date(selectedAttendance.clockOut).toLocaleTimeString('id-ID') 
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi Kerja:</span>
                <span className="font-semibold">
                  {selectedAttendance.workDurationHours || 0} jam
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedAttendance.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                  selectedAttendance.status === 'LATE' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {selectedAttendance.status}
                </span>
              </div>
            </div>

            <Button 
              nameProp="Tutup" 
              onClick={() => setShowAttendanceModal(false)}
              variant="secondary"
              className="mt-4"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderLeave = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cuti & Izin</h2>

        {/* Leave Balance */}
        {leaveBalance && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Saldo Cuti</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Jatah</p>
                <p className="text-2xl font-bold text-blue-600">
                  {leaveBalance.annualLeaveQuota || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Terpakai</p>
                <p className="text-2xl font-bold text-red-600">
                  {leaveBalance.usedLeaveQuota || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Sisa</p>
                <p className="text-2xl font-bold text-green-600">
                  {leaveBalance.remainingLeaveQuota || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {leaveBalance.pendingLeaveDays || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Request Button */}
        <Button 
          nameProp="+ Ajukan Cuti/Izin" 
          onClick={() => setShowLeaveForm(!showLeaveForm)}
          variant="primary"
        />

        {/* Leave Request Form */}
        {showLeaveForm && (
          <form onSubmit={handleLeaveSubmit} className="bg-blue-50 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Pengajuan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Jenis Cuti/Izin
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="ANNUAL_LEAVE">Cuti Tahunan</option>
                  <option value="SICK_LEAVE">Sakit</option>
                  <option value="PERMISSION">Izin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Alasan
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Jelaskan alasan pengajuan..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  nameProp={loading ? "Mengirim..." : "Kirim Pengajuan"}
                  type="submit"
                  variant="primary"
                  disabled={loading}
                />
                <Button 
                  nameProp="Batal"
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  variant="secondary"
                />
              </div>
            </div>
          </form>
        )}

        {/* Leave History */}
        <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Riwayat Pengajuan</h3>
        
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : leaveRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.leaveType === 'ANNUAL_LEAVE' ? 'Cuti Tahunan' :
                       leave.leaveType === 'SICK_LEAVE' ? 'Sakit' : 'Izin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString('id-ID')} - {' '}
                      {new Date(leave.endDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.totalDays} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                        leave.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                        leave.status === 'CANCELLED' ? 'bg-gray-200 text-gray-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {leave.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelLeave(leave.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">Belum ada riwayat pengajuan</p>
        )}

        {/* Overtime Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Overtime (Lembur)</h3>
          
          <Button 
            nameProp="+ Request Overtime" 
            onClick={() => {
              setShowOvertimeForm(!showOvertimeForm)
              if (!showOvertimeForm) fetchOvertimeData()
            }}
            variant="primary"
          />

          {/* Overtime Request Form */}
          {showOvertimeForm && (
            <form onSubmit={handleOvertimeSubmit} className="bg-purple-50 rounded-lg p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Overtime</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tanggal Overtime
                  </label>
                  <input
                    type="date"
                    value={overtimeForm.overtimeDate}
                    onChange={(e) => setOvertimeForm({...overtimeForm, overtimeDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Jam Overtime (0.5 - 12 jam)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={overtimeForm.requestedHours}
                    onChange={(e) => setOvertimeForm({...overtimeForm, requestedHours: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Alasan Overtime
                  </label>
                  <textarea
                    value={overtimeForm.reason}
                    onChange={(e) => setOvertimeForm({...overtimeForm, reason: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    rows="3"
                    placeholder="Minimal 10 karakter..."
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    nameProp={loading ? "Mengirim..." : "Kirim Request"}
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  />
                  <Button 
                    nameProp="Batal"
                    type="button"
                    onClick={() => setShowOvertimeForm(false)}
                    variant="secondary"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Overtime History */}
          {overtimeRequests.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-3">Riwayat Overtime</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jam Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jam Approved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overtimeRequests.map((ot) => (
                      <tr key={ot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(ot.overtimeDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ot.requestedHours} jam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ot.actualHours || '-'} jam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ot.status === 'approved' ? 'bg-green-200 text-green-800' :
                            ot.status === 'rejected' ? 'bg-red-200 text-red-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {ot.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
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

        {/* Change Password */}
        <Button 
          nameProp={showPasswordForm ? "Sembunyikan Form" : "Ubah Password"}
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          variant="primary"
        />

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="bg-gray-50 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ubah Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  nameProp={loading ? "Menyimpan..." : "Simpan Password"}
                  type="submit"
                  variant="primary"
                  disabled={loading}
                />
                <Button 
                  nameProp="Batal"
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  variant="secondary"
                />
              </div>
            </div>
          </form>
        )}

        {/* Logout Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Button 
            nameProp="🚪 Logout"
            onClick={handleLogout}
            variant="danger"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white backdrop-blur-sm px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
            
            {/* LEFT */}
            <div className="flex items-center space-x-3">
            <img
                src={logoNavbar}
                alt="Company Logo"
                className="h-12"
            />
            <span className="text-black font-bold text-xl tracking-wide">
                Employee Dashboard
            </span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-4">
            <div className="relative">
                <button className="text-black hover:text-gray-600 transition-colors">
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                    </span>
                )}
                </button>
            </div>

            <span className="text-black">{profile.email}</span>
            </div>

        </div>
        </nav>


      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📅 Attendance
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'leave'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🏖️ Cuti & Izin
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              👤 Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'leave' && renderLeave()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Clock In/Out Confirmation Modal */}
      {clockAction && capturedPhoto && (
        <Modal
          isOpen={true}
          onClose={cancelClockAction}
          title={`Konfirmasi Clock ${clockAction === 'in' ? 'In' : 'Out'}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Photo Preview */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Foto Anda:</h4>
              <img 
                src={URL.createObjectURL(capturedPhoto)} 
                alt="Captured" 
                className="w-full rounded-lg border-2 border-gray-300"
              />
            </div>

            {/* GPS Location */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Lokasi GPS:</h4>
              <GPSLocation onLocationCapture={handleGPSCapture} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                nameProp={loading ? 'Memproses...' : `Konfirmasi Clock ${clockAction === 'in' ? 'In' : 'Out'}`}
                onClick={clockAction === 'in' ? handleClockIn : handleClockOut}
                variant="primary"
                disabled={loading || !gpsLocation}
              />
              <Button
                nameProp="Batal"
                onClick={cancelClockAction}
                variant="secondary"
                disabled={loading}
              />
            </div>

            {!gpsLocation && (
              <p className="text-yellow-600 text-sm text-center">
                ⚠️ Tunggu hingga lokasi GPS terdeteksi
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
