import { useState, useEffect } from 'react'
import axiosInstance from '../../../shared/config/axios'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import logoNavbar from '../../../assets/logo-navbar.png'
import backgroundImage from '../../../assets/background.png'
import { Bell } from 'lucide-react'

// Tab Components
import DashboardTab from '../components/DashboardTab.jsx'
import AttendanceTab from '../components/AttendanceTab.jsx'
import LeaveTab from '../components/LeaveTab.jsx'
import WorkLocationTab from '../components/WorkLocationTab.jsx'
import PayslipTab from '../components/PayslipTab.jsx'
import NotificationsTab from '../components/NotificationsTab.jsx'
import ProfileTab from '../components/ProfileTab.jsx'

// Shared Components
import CameraCapture from '../components/CameraCapture.jsx'
import GPSLocation from '../components/GPSLocation.jsx'
import Modal from '../../../shared/components/Modal.jsx'

export default function EmployeePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)

  // Camera & GPS State
  const [showCamera, setShowCamera] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [gpsLocation, setGPSLocation] = useState(null)
  const [clockAction, setClockAction] = useState(null)

  // Dashboard State
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Notifications State
  const [allNotifications, setAllNotifications] = useState([])
  const [notificationFilter, setNotificationFilter] = useState('all')

  // Attendance State
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceStatistics, setAttendanceStatistics] = useState(null)
  const [statisticsPeriod, setStatisticsPeriod] = useState('monthly')
  const [statisticsMonth, setStatisticsMonth] = useState(new Date().getMonth() + 1)
  const [statisticsYear, setStatisticsYear] = useState(new Date().getFullYear())
  const [showStatistics, setShowStatistics] = useState(false)

  // Leave State
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showLeaveHistory, setShowLeaveHistory] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL_LEAVE', startDate: '', endDate: '', reason: '', attachment: null
  })
  const [attachmentPreview, setAttachmentPreview] = useState(null)

  // Overtime State
  const [overtimeRequests, setOvertimeRequests] = useState([])
  const [overtimeHistory, setOvertimeHistory] = useState([])
  const [showOvertimeForm, setShowOvertimeForm] = useState(false)
  const [showOvertimeHistory, setShowOvertimeHistory] = useState(false)
  const [overtimeForm, setOvertimeForm] = useState({ overtimeDate: '', requestedHours: '', reason: '' })

  // Payslip State
  const [payslips, setPayslips] = useState([])
  const [payslipSummary, setPayslipSummary] = useState(null)
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [showPayslipDetail, setShowPayslipDetail] = useState(false)

  // Profile State
  const [profile, setProfile] = useState({ name: '', email: '', role: '', department: '', position: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEditProfileForm, setShowEditProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ==================== HELPERS ====================
  const handleApiError = (error, defaultMessage = 'Terjadi kesalahan') => {
    console.error('API Error:', error)
    let errorMessage = defaultMessage
    if (error.response?.data) {
      if (typeof error.response.data === 'string') errorMessage = error.response.data
      else if (error.response.data.message) errorMessage = error.response.data.message
      else if (error.response.data.error) errorMessage = error.response.data.error
      else if (error.response.data.errors) {
        errorMessage = Array.isArray(error.response.data.errors)
          ? error.response.data.errors.join(', ')
          : error.response.data.errors
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    toast.error(errorMessage)
    return errorMessage
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0)

  const getPayslipStatusColor = (status) => ({
    draft: 'bg-gray-200 text-gray-800',
    pending: 'bg-yellow-200 text-yellow-800',
    approved: 'bg-blue-200 text-blue-800',
    processing: 'bg-orange-200 text-orange-800',
    paid: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800'
  }[status] || 'bg-gray-200 text-gray-800')

  const getPayslipStatusLabel = (status) => ({
    draft: 'Draft', pending: 'Pending', approved: 'Approved',
    processing: 'Processing', paid: 'Paid', failed: 'Failed'
  }[status] || status)

  // ==================== INIT ====================
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }
    const fetchInitialProfile = async () => {
      try {
        const { data } = await axiosInstance.get('/profile')
        setProfile(data.data || profile)
        setProfileForm({ name: data.data?.name || '' })
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchInitialProfile()
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }
    if (activeTab === 'dashboard') fetchDashboardData()
    else if (activeTab === 'attendance') fetchAttendanceHistory()
    else if (activeTab === 'leave') fetchLeaveData()
    else if (activeTab === 'payslips') fetchPayslipsData()
    else if (activeTab === 'notifications') fetchAllNotifications()
    else if (activeTab === 'profile') fetchProfile()
  }, [activeTab, navigate])

  // ==================== DASHBOARD ====================
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [todayRes, notifRes, countRes] = await Promise.all([
        axiosInstance.get('/attendances/today-attendance'),
        axiosInstance.get('/notifications?limit=5'),
        axiosInstance.get('/notifications/unread-count')
      ])
      setTodayAttendance(todayRes.data.data)
      setNotifications(notifRes.data.data || [])
      setUnreadCount(countRes.data.data.unreadCount || 0)
    } catch (error) {
      handleApiError(error, 'Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ==================== CAMERA & GPS ====================
  const initClockIn = () => { setClockAction('in'); setShowCamera(true); setCapturedPhoto(null); setGPSLocation(null) }
  const initClockOut = () => { setClockAction('out'); setShowCamera(true); setCapturedPhoto(null); setGPSLocation(null) }
  const handlePhotoCapture = (photo) => { setCapturedPhoto(photo); setShowCamera(false) }
  const handleGPSCapture = (location) => { setGPSLocation(location) }
  const cancelClockAction = () => { setClockAction(null); setCapturedPhoto(null); setGPSLocation(null); setShowCamera(false) }

  const handleClockIn = async () => {
    if (!capturedPhoto || !gpsLocation) { toast.error('Foto dan lokasi GPS diperlukan!'); return }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('photo', capturedPhoto, capturedPhoto.name)
      formData.append('latitude', String(gpsLocation.latitude))
      formData.append('longitude', String(gpsLocation.longitude))
      const { data } = await axiosInstance.post('/attendances/clock-in', formData)
      toast.success('Clock-in berhasil!')
      setTodayAttendance(data.data)
      setCapturedPhoto(null); setGPSLocation(null); setClockAction(null)
      fetchDashboardData()
    } catch (error) {
      handleApiError(error, 'Gagal clock-in')
      if (error.response?.data?.message === 'Already clocked in today') fetchDashboardData()
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!capturedPhoto || !gpsLocation) { toast.error('Foto dan lokasi GPS diperlukan!'); return }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('photo', capturedPhoto, capturedPhoto.name)
      formData.append('latitude', String(gpsLocation.latitude))
      formData.append('longitude', String(gpsLocation.longitude))
      const { data } = await axiosInstance.put('/attendances/clock-out', formData)
      toast.success('Clock-out berhasil!')
      setTodayAttendance(data.data)
      setCapturedPhoto(null); setGPSLocation(null); setClockAction(null)
      fetchDashboardData()
    } catch (error) {
      handleApiError(error, 'Gagal clock-out')
      if (error.response?.data?.message?.includes('No clock-in')) fetchDashboardData()
    } finally {
      setLoading(false)
    }
  }

  // ==================== NOTIFICATIONS ====================
  const markNotificationAsRead = async (notifId) => {
    try {
      await axiosInstance.patch(`/notifications/${notifId}/read`, {})
      fetchDashboardData()
      if (activeTab === 'notifications') fetchAllNotifications()
    } catch (error) {
      handleApiError(error, 'Gagal menandai notifikasi')
    }
  }

  const fetchAllNotifications = async () => {
    setLoading(true)
    try {
      const [notifRes, countRes] = await Promise.all([
        axiosInstance.get('/notifications?limit=100'),
        axiosInstance.get('/notifications/unread-count')
      ])
      setAllNotifications(notifRes.data.data || [])
      setUnreadCount(countRes.data.data.unreadCount || 0)
    } catch (error) {
      handleApiError(error, 'Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) { toast.info('Semua notifikasi sudah dibaca'); return }
    try {
      setLoading(true)
      const { data } = await axiosInstance.patch('/notifications/read-all', {})
      toast.success(`${data.data.updatedCount} notifikasi ditandai sudah dibaca`)
      fetchAllNotifications(); fetchDashboardData()
    } catch (error) {
      handleApiError(error, 'Gagal menandai semua notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const clearReadNotifications = async () => {
    const readCount = allNotifications.filter((n) => n.isRead).length
    if (readCount === 0) { toast.info('Tidak ada notifikasi yang sudah dibaca untuk dihapus'); return }
    if (!window.confirm(`Hapus ${readCount} notifikasi yang sudah dibaca?`)) return
    try {
      setLoading(true)
      const { data } = await axiosInstance.delete('/notifications/clear-read')
      toast.success(`${data.data.deletedCount} notifikasi dihapus`)
      fetchAllNotifications()
    } catch (error) {
      handleApiError(error, 'Gagal menghapus notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notifId) => {
    if (!window.confirm('Hapus notifikasi ini?')) return
    try {
      await axiosInstance.delete(`/notifications/${notifId}`)
      toast.success('Notifikasi dihapus')
      fetchAllNotifications()
      if (activeTab === 'dashboard') fetchDashboardData()
    } catch (error) {
      handleApiError(error, 'Gagal menghapus notifikasi')
    }
  }

  // ==================== ATTENDANCE ====================
  const fetchAttendanceHistory = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/attendances/my-attendance')
      setAttendanceHistory(data.data || [])
    } catch (error) {
      handleApiError(error, 'Gagal memuat riwayat attendance')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceStatistics = async () => {
    setLoading(true)
    try {
      let queryParams = `period=${statisticsPeriod}`
      if (statisticsPeriod === 'monthly') queryParams += `&month=${statisticsMonth}&year=${statisticsYear}`
      else if (statisticsPeriod === 'weekly') queryParams += `&year=${statisticsYear}`
      const { data } = await axiosInstance.get(`/attendances/my-statistics?${queryParams}`)
      setAttendanceStatistics(data.data || null)
    } catch (error) {
      handleApiError(error, 'Gagal memuat statistik attendance')
    } finally {
      setLoading(false)
    }
  }

  const viewAttendanceDetail = (attendance) => { setSelectedAttendance(attendance); setShowAttendanceModal(true) }

  // ==================== LEAVE ====================
  const fetchLeaveData = async () => {
    setLoading(true)
    try {
      const [requestsRes, balanceRes] = await Promise.all([
        axiosInstance.get('/leave-requests/my-requests'),
        axiosInstance.get('/leave-requests/my-balance')
      ])
      setLeaveRequests(requestsRes.data.data || [])
      setLeaveBalance(balanceRes.data.data)
    } catch (error) {
      handleApiError(error, 'Gagal memuat data cuti')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!leaveForm.startDate) { toast.error('Tanggal mulai harus diisi'); return }
    if (!leaveForm.endDate) { toast.error('Tanggal selesai harus diisi'); return }
    if (!leaveForm.reason?.trim()) { toast.error('Alasan harus diisi'); return }
    if (leaveForm.reason.trim().length < 10) { toast.error('Alasan harus minimal 10 karakter'); return }
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) { toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai'); return }
    if (leaveForm.attachment && leaveForm.attachment.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('leaveType', leaveForm.leaveType)
      formData.append('startDate', leaveForm.startDate)
      formData.append('endDate', leaveForm.endDate)
      formData.append('reason', leaveForm.reason.trim())
      if (leaveForm.attachment) formData.append('attachment', leaveForm.attachment)
      await axiosInstance.post('/leave-requests', formData)
      toast.success(leaveForm.attachment ? 'Pengajuan cuti dengan lampiran berhasil dikirim!' : 'Pengajuan cuti berhasil dikirim!')
      setShowLeaveForm(false)
      setLeaveForm({ leaveType: 'ANNUAL_LEAVE', startDate: '', endDate: '', reason: '', attachment: null })
      setAttachmentPreview(null)
      fetchLeaveData()
    } catch (error) {
      handleApiError(error, 'Gagal mengajukan cuti')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) { toast.error('Hanya file PDF, JPG, atau PNG yang diperbolehkan'); e.target.value = null; return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); e.target.value = null; return }
    setLeaveForm({ ...leaveForm, attachment: file })
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setAttachmentPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setAttachmentPreview('PDF')
    }
  }

  const removeAttachment = () => { setLeaveForm({ ...leaveForm, attachment: null }); setAttachmentPreview(null) }

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Yakin ingin membatalkan pengajuan ini?')) return
    try {
      await axiosInstance.delete(`/leave-requests/${leaveId}`)
      toast.success('Pengajuan berhasil dibatalkan')
      fetchLeaveData()
    } catch (error) {
      handleApiError(error, 'Gagal membatalkan pengajuan')
    }
  }

  // ==================== OVERTIME ====================
  const fetchOvertimeData = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/overtimes/my-requests')
      setOvertimeRequests(data.data || [])
    } catch (error) {
      handleApiError(error, 'Gagal memuat data overtime')
    } finally {
      setLoading(false)
    }
  }

  const fetchOvertimeHistory = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/overtimes/my-history')
      setOvertimeHistory(data.data || [])
    } catch (error) {
      handleApiError(error, 'Gagal memuat riwayat overtime')
    } finally {
      setLoading(false)
    }
  }

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault()
    if (!overtimeForm.overtimeDate) { toast.error('Tanggal overtime harus diisi!'); return }
    if (!overtimeForm.requestedHours) { toast.error('Jam overtime yang diminta harus diisi!'); return }
    const hours = parseFloat(overtimeForm.requestedHours)
    if (isNaN(hours) || hours < 0.5 || hours > 12) { toast.error('Jam overtime harus antara 0.5 - 12 jam!'); return }
    if (!overtimeForm.reason?.trim() || overtimeForm.reason.trim().length < 10) { toast.error('Alasan overtime harus minimal 10 karakter!'); return }
    setLoading(true)
    try {
      await axiosInstance.post('/overtimes/request', {
        overtimeDate: overtimeForm.overtimeDate,
        requestedHours: parseFloat(overtimeForm.requestedHours),
        reason: overtimeForm.reason.trim()
      })
      toast.success('Pengajuan overtime berhasil dikirim!')
      setShowOvertimeForm(false)
      setOvertimeForm({ overtimeDate: '', requestedHours: '', reason: '' })
      fetchOvertimeData()
    } catch (error) {
      handleApiError(error, 'Gagal mengajukan overtime')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOvertime = async (overtimeId) => {
    if (!window.confirm('Yakin ingin membatalkan pengajuan overtime ini?')) return
    try {
      await axiosInstance.delete(`/overtimes/${overtimeId}`)
      toast.success('Pengajuan overtime berhasil dibatalkan')
      fetchOvertimeData()
    } catch (error) {
      handleApiError(error, 'Gagal membatalkan pengajuan overtime')
    }
  }

  // ==================== PAYSLIPS ====================
  const fetchPayslipsData = async () => {
    setLoading(true)
    try {
      const [payslipsRes, summaryRes] = await Promise.all([
        axiosInstance.get('/payroll/my-payslips'),
        axiosInstance.get('/payroll/my-payslips/summary')
      ])
      setPayslips(payslipsRes.data.data || [])
      setPayslipSummary(summaryRes.data.data || null)
    } catch (error) {
      handleApiError(error, 'Gagal memuat data payslip')
    } finally {
      setLoading(false)
    }
  }

  const viewPayslipDetail = async (payrollId) => {
    try {
      const { data } = await axiosInstance.get(`/payroll/my-payslips/${payrollId}`)
      setSelectedPayslip(data.data)
      setShowPayslipDetail(true)
    } catch (error) {
      handleApiError(error, 'Gagal memuat detail payslip')
    }
  }

  const handleDownloadPayslip = async (payrollId, periodName) => {
    try {
      const response = await axiosInstance.get(`/payroll/my-payslips/${payrollId}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Payslip_${periodName.replace(/\s+/g, '_')}.html`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Payslip berhasil diunduh')
    } catch (error) {
      handleApiError(error, 'Gagal mengunduh payslip')
    }
  }

  // ==================== PROFILE ====================
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/profile')
      setProfile(data.data || profile)
      setProfileForm({ name: data.data?.name || '' })
    } catch (error) {
      handleApiError(error, 'Gagal memuat profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!profileForm.name?.trim()) { toast.error('Nama tidak boleh kosong'); return }
    setLoading(true)
    try {
      const { data } = await axiosInstance.put('/profile', { name: profileForm.name })
      toast.success('Profile berhasil diperbarui!')
      setProfile({ ...profile, name: data.data.name })
      setShowEditProfileForm(false)
      fetchProfile()
    } catch (error) {
      handleApiError(error, 'Gagal memperbarui profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { toast.error('Semua field password harus diisi'); return }
    if (passwordForm.newPassword.length < 6) { toast.error('Password baru minimal 6 karakter'); return }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Password baru tidak cocok!'); return }
    setLoading(true)
    try {
      await axiosInstance.put('/profile/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password berhasil diubah!')
      setShowPasswordForm(false)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      handleApiError(error, 'Gagal mengubah password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    toast.success('Logout berhasil')
    navigate('/login')
  }

  // ==================== TABS CONFIG ====================
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'leave', label: 'Cuti & Izin' },
    { key: 'work-location', label: 'Work Location' },
    { key: 'payslips', label: 'Payslips' },
    { key: 'notifications', label: 'Notifikasi', badge: unreadCount },
    { key: 'profile', label: 'Profile' }
  ]

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-4 shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoNavbar} alt="Company Logo" className="h-12" />
            <span className="text-black font-bold text-xl tracking-wide">Employee Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="text-black hover:text-gray-600 transition-colors">
                <Bell size={22} />
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
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl mb-6 border border-gray-200">
            <div className="flex flex-wrap border-b border-gray-200">
              {tabs.map(({ key, label, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === key
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {label}
                  {badge > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'dashboard' && (
              <DashboardTab
                todayAttendance={todayAttendance}
                notifications={notifications}
                unreadCount={unreadCount}
                loading={loading}
                initClockIn={initClockIn}
                initClockOut={initClockOut}
                markNotificationAsRead={markNotificationAsRead}
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceTab
                todayAttendance={todayAttendance}
                loading={loading}
                attendanceHistory={attendanceHistory}
                selectedAttendance={selectedAttendance}
                showAttendanceModal={showAttendanceModal}
                setShowAttendanceModal={setShowAttendanceModal}
                attendanceStatistics={attendanceStatistics}
                statisticsPeriod={statisticsPeriod}
                setStatisticsPeriod={setStatisticsPeriod}
                statisticsMonth={statisticsMonth}
                setStatisticsMonth={setStatisticsMonth}
                statisticsYear={statisticsYear}
                setStatisticsYear={setStatisticsYear}
                showStatistics={showStatistics}
                setShowStatistics={setShowStatistics}
                fetchAttendanceStatistics={fetchAttendanceStatistics}
                initClockIn={initClockIn}
                initClockOut={initClockOut}
                viewAttendanceDetail={viewAttendanceDetail}
              />
            )}
            {activeTab === 'leave' && (
              <LeaveTab
                loading={loading}
                leaveRequests={leaveRequests}
                leaveBalance={leaveBalance}
                showLeaveForm={showLeaveForm}
                setShowLeaveForm={setShowLeaveForm}
                leaveForm={leaveForm}
                setLeaveForm={setLeaveForm}
                attachmentPreview={attachmentPreview}
                handleLeaveSubmit={handleLeaveSubmit}
                handleFileChange={handleFileChange}
                removeAttachment={removeAttachment}
                handleCancelLeave={handleCancelLeave}
                showLeaveHistory={showLeaveHistory}
                setShowLeaveHistory={setShowLeaveHistory}
                fetchLeaveData={fetchLeaveData}
                overtimeRequests={overtimeRequests}
                overtimeHistory={overtimeHistory}
                showOvertimeForm={showOvertimeForm}
                setShowOvertimeForm={setShowOvertimeForm}
                showOvertimeHistory={showOvertimeHistory}
                setShowOvertimeHistory={setShowOvertimeHistory}
                overtimeForm={overtimeForm}
                setOvertimeForm={setOvertimeForm}
                handleOvertimeSubmit={handleOvertimeSubmit}
                handleCancelOvertime={handleCancelOvertime}
                fetchOvertimeData={fetchOvertimeData}
                fetchOvertimeHistory={fetchOvertimeHistory}
              />
            )}
            {activeTab === 'work-location' && <WorkLocationTab />}
            {activeTab === 'payslips' && (
              <PayslipTab
                loading={loading}
                payslips={payslips}
                payslipSummary={payslipSummary}
                selectedPayslip={selectedPayslip}
                showPayslipDetail={showPayslipDetail}
                setShowPayslipDetail={setShowPayslipDetail}
                setSelectedPayslip={setSelectedPayslip}
                viewPayslipDetail={viewPayslipDetail}
                handleDownloadPayslip={handleDownloadPayslip}
                formatCurrency={formatCurrency}
                getPayslipStatusColor={getPayslipStatusColor}
                getPayslipStatusLabel={getPayslipStatusLabel}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab
                loading={loading}
                allNotifications={allNotifications}
                unreadCount={unreadCount}
                notificationFilter={notificationFilter}
                setNotificationFilter={setNotificationFilter}
                markNotificationAsRead={markNotificationAsRead}
                markAllAsRead={markAllAsRead}
                clearReadNotifications={clearReadNotifications}
                deleteNotification={deleteNotification}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                loading={loading}
                profile={profile}
                showPasswordForm={showPasswordForm}
                setShowPasswordForm={setShowPasswordForm}
                showEditProfileForm={showEditProfileForm}
                setShowEditProfileForm={setShowEditProfileForm}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                showOldPassword={showOldPassword}
                setShowOldPassword={setShowOldPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleUpdateProfile={handleUpdateProfile}
                handleChangePassword={handleChangePassword}
                handleLogout={handleLogout}
              />
            )}
          </div>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <CameraCapture onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />
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
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Foto Anda:</h4>
                <img src={URL.createObjectURL(capturedPhoto)} alt="Captured" className="w-full rounded-lg border-2 border-gray-300" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Lokasi GPS:</h4>
                <GPSLocation onLocationCapture={handleGPSCapture} />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={clockAction === 'in' ? handleClockIn : handleClockOut}
                  disabled={loading || !gpsLocation}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Memproses...' : `Konfirmasi Clock ${clockAction === 'in' ? 'In' : 'Out'}`}
                </button>
                <button
                  onClick={cancelClockAction}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Batal
                </button>
              </div>
              {!gpsLocation && (
                <p className="text-yellow-600 text-sm text-center">Tunggu hingga lokasi GPS terdeteksi</p>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
