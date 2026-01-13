import { useState, useEffect } from 'react'
import axios from 'axios'
import baseUrl from '../constant/url.js'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import logoNavbar from '../assets/logo-navbar.png'
import backgroundImage from '../assets/background.png'
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
  
  // Notifications/Inbox State
  const [allNotifications, setAllNotifications] = useState([])
  const [notificationFilter, setNotificationFilter] = useState('all') // 'all', 'unread', 'read'
  
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
    leaveType: 'ANNUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null // For file upload
  })
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  
  // Overtime State
  const [overtimeRequests, setOvertimeRequests] = useState([])
  const [overtimeHistory, setOvertimeHistory] = useState([])
  const [showOvertimeForm, setShowOvertimeForm] = useState(false)
  const [showOvertimeHistory, setShowOvertimeHistory] = useState(false)
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
  const [showEditProfileForm, setShowEditProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // ==================== ERROR HANDLING HELPER ====================
  const handleApiError = (error, defaultMessage = 'Terjadi kesalahan') => {
    console.error('API Error:', error)
    console.error('Error response:', error.response?.data)
    
    let errorMessage = defaultMessage
    
    if (error.response?.data) {
      // Try to get message from different possible structures
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error
      } else if (error.response.data.errors) {
        // Handle validation errors array
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
    } else if (activeTab === 'notifications') {
      fetchAllNotifications()
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
      handleApiError(error, 'Gagal memuat data dashboard')
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
      handleApiError(error, 'Gagal clock-in')
      // Special handling for specific errors
      const errorMsg = error.response?.data?.message
      if (errorMsg === 'Already clocked in today') {
        fetchDashboardData() // Refresh data untuk update UI
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
      handleApiError(error, 'Gagal clock-out')
      // Special handling for specific errors
      const errorMsg = error.response?.data?.message
      if (errorMsg?.includes('No clock-in')) {
        fetchDashboardData() // Refresh data untuk update UI
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
      // Also update allNotifications if in notifications tab
      if (activeTab === 'notifications') {
        fetchAllNotifications()
      }
    } catch (error) {
      handleApiError(error, 'Gagal menandai notifikasi')
    }
  }

  // ==================== NOTIFICATION/INBOX FUNCTIONS ====================
  const fetchAllNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const [notifRes, countRes] = await Promise.all([
        axios.get(`${baseUrl}/notifications?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseUrl}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
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
    if (unreadCount === 0) {
      toast.info('Semua notifikasi sudah dibaca')
      return
    }
    
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const { data } = await axios.patch(`${baseUrl}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success(`${data.data.updatedCount} notifikasi ditandai sudah dibaca`)
      fetchAllNotifications()
      fetchDashboardData() // Update dashboard badge
    } catch (error) {
      handleApiError(error, 'Gagal menandai semua notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const clearReadNotifications = async () => {
    const readCount = allNotifications.filter(n => n.isRead).length
    
    if (readCount === 0) {
      toast.info('Tidak ada notifikasi yang sudah dibaca untuk dihapus')
      return
    }
    
    if (!window.confirm(`Hapus ${readCount} notifikasi yang sudah dibaca?`)) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const { data } = await axios.delete(`${baseUrl}/notifications/clear-read`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
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
      const token = localStorage.getItem('access_token')
      await axios.delete(`${baseUrl}/notifications/${notifId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Notifikasi dihapus')
      fetchAllNotifications()
      if (activeTab === 'dashboard') {
        fetchDashboardData()
      }
    } catch (error) {
      handleApiError(error, 'Gagal menghapus notifikasi')
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
      handleApiError(error, 'Gagal memuat riwayat attendance')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceStatistics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Build query parameters based on period
      let queryParams = `period=${statisticsPeriod}`
      
      if (statisticsPeriod === 'monthly') {
        queryParams += `&month=${statisticsMonth}&year=${statisticsYear}`
      } else if (statisticsPeriod === 'weekly') {
        // For weekly, we can add week number if needed
        queryParams += `&year=${statisticsYear}`
      } else if (statisticsPeriod === 'daily') {
        // For daily, just use current date range
      }
      
      const { data } = await axios.get(`${baseUrl}/attendances/my-statistics?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAttendanceStatistics(data.data || null)
    } catch (error) {
      handleApiError(error, 'Gagal memuat statistik attendance')
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
      handleApiError(error, 'Gagal memuat data cuti')
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
    
    // Validate minimum length for reason
    if (leaveForm.reason.trim().length < 10) {
      toast.error('Alasan harus minimal 10 karakter')
      return
    }
    
    // Validate end date is not before start date
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai')
      return
    }

    // Validate file size if attachment exists
    if (leaveForm.attachment) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (leaveForm.attachment.size > maxSize) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Use FormData for file upload
      const formData = new FormData()
      formData.append('leaveType', leaveForm.leaveType)
      formData.append('startDate', leaveForm.startDate)
      formData.append('endDate', leaveForm.endDate)
      formData.append('reason', leaveForm.reason.trim())
      
      // Add attachment if exists
      if (leaveForm.attachment) {
        formData.append('attachment', leaveForm.attachment)
      }
      
      console.log('Submitting leave request with attachment')
      
      // Debug: Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await axios.post(`${baseUrl}/leave-requests`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        }
      })
      
      toast.success(leaveForm.attachment 
        ? 'Pengajuan cuti dengan lampiran berhasil dikirim!' 
        : 'Pengajuan cuti berhasil dikirim!')
      
      setShowLeaveForm(false)
      setLeaveForm({
        leaveType: 'ANNUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: '',
        attachment: null
      })
      setAttachmentPreview(null)
      fetchLeaveData()
    } catch (error) {
      console.error('Submit error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      handleApiError(error, 'Gagal mengajukan cuti')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Hanya file PDF, JPG, atau PNG yang diperbolehkan')
        e.target.value = null
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('Ukuran file maksimal 5MB')
        e.target.value = null
        return
      }

      setLeaveForm({...leaveForm, attachment: file})
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAttachmentPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setAttachmentPreview('PDF')
      }
    }
  }

  const removeAttachment = () => {
    setLeaveForm({...leaveForm, attachment: null})
    setAttachmentPreview(null)
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
      handleApiError(error, 'Gagal membatalkan pengajuan')
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
      handleApiError(error, 'Gagal memuat data overtime')
    } finally {
      setLoading(false)
    }
  }

  const fetchOvertimeHistory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.get(`${baseUrl}/overtimes/my-history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setOvertimeHistory(data.data || [])
    } catch (error) {
      handleApiError(error, 'Gagal memuat riwayat overtime')
    } finally {
      setLoading(false)
    }
  }

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi client-side
    if (!overtimeForm.overtimeDate) {
      toast.error('Tanggal overtime harus diisi!')
      return
    }
    
    if (!overtimeForm.requestedHours) {
      toast.error('Jam overtime yang diminta harus diisi!')
      return
    }
    
    const hours = parseFloat(overtimeForm.requestedHours)
    if (isNaN(hours) || hours < 0.5 || hours > 12) {
      toast.error('Jam overtime harus antara 0.5 - 12 jam!')
      return
    }
    
    if (!overtimeForm.reason || overtimeForm.reason.trim() === '') {
      toast.error('Alasan overtime harus diisi!')
      return
    }
    
    // Validate minimum length for reason
    if (overtimeForm.reason.trim().length < 10) {
      toast.error('Alasan overtime harus minimal 10 karakter!')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Convert requestedHours to number before sending
      const payload = {
        overtimeDate: overtimeForm.overtimeDate,
        requestedHours: parseFloat(overtimeForm.requestedHours),
        reason: overtimeForm.reason.trim()
      }
      
      console.log('Submitting overtime request:', payload)
      
      await axios.post(`${baseUrl}/overtimes/request`, payload, {
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
      handleApiError(error, 'Gagal mengajukan overtime')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOvertime = async (overtimeId) => {
    if (!window.confirm('Yakin ingin membatalkan pengajuan overtime ini?')) return
    
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`${baseUrl}/overtimes/${overtimeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('Pengajuan overtime berhasil dibatalkan')
      fetchOvertimeData()
    } catch (error) {
      handleApiError(error, 'Gagal membatalkan pengajuan overtime')
    }
  }

  // ==================== PROFILE FUNCTIONS ====================
  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.get(`${baseUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProfile(data.data || profile)
      setProfileForm({ name: data.data?.name || '' })
    } catch (error) {
      handleApiError(error, 'Gagal memuat profile')
      // Set default profile from localStorage if available
      const userEmail = localStorage.getItem('user_email') || 'employee@example.com'
      setProfile({ ...profile, email: userEmail })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    if (!profileForm.name || !profileForm.name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const { data } = await axios.put(`${baseUrl}/profile`, {
        name: profileForm.name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
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
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Semua field password harus diisi')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok!')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(`${baseUrl}/profile/change-password`, {
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
      handleApiError(error, 'Gagal mengubah password')
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

        {/* Statistics Section */}
        <div className="mb-6 border-t pt-4">
          <Button 
            nameProp={showStatistics ? "📊 Sembunyikan Statistik" : "📊 Lihat Statistik Attendance"}
            onClick={() => {
              setShowStatistics(!showStatistics)
              if (!showStatistics && !attendanceStatistics) {
                fetchAttendanceStatistics()
              }
            }}
            variant="primary"
          />

          {showStatistics && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistik Attendance</h3>
              
              {/* Period Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periode
                  </label>
                  <select
                    value={statisticsPeriod}
                    onChange={(e) => setStatisticsPeriod(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>

                {statisticsPeriod === 'monthly' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bulan
                      </label>
                      <select
                        value={statisticsMonth}
                        onChange={(e) => setStatisticsMonth(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun
                      </label>
                      <select
                        value={statisticsYear}
                        onChange={(e) => setStatisticsYear(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <Button 
                nameProp={loading ? "Memuat..." : "Refresh Statistik"}
                onClick={fetchAttendanceStatistics}
                variant="primary"
                disabled={loading}
              />

              {/* Statistics Display */}
              {attendanceStatistics ? (
                <div className="mt-6">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Periode: {attendanceStatistics.period}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(attendanceStatistics.dateRange.start).toLocaleDateString('id-ID')} - {' '}
                      {new Date(attendanceStatistics.dateRange.end).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Tepat Waktu</p>
                      <p className="text-2xl font-bold text-green-700">
                        {attendanceStatistics.summary.onTime}
                      </p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Terlambat</p>
                      <p className="text-2xl font-bold text-red-700">
                        {attendanceStatistics.summary.late}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Absent</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {attendanceStatistics.summary.absent}
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Hadir</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {attendanceStatistics.summary.totalPresent}
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Jam Kerja Total</p>
                      <p className="text-xl font-bold text-gray-800">
                        {attendanceStatistics.summary.totalWorkHours} jam
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tingkat Kehadiran</p>
                      <p className="text-xl font-bold text-gray-800">
                        {attendanceStatistics.summary.attendanceRate}%
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Hari Kerja</p>
                      <p className="text-xl font-bold text-gray-800">
                        {attendanceStatistics.summary.totalWorkDays} hari
                      </p>
                    </div>
                  </div>

                  {/* Leave & Permission Stats */}
                  {(attendanceStatistics.summary.leave > 0 || 
                    attendanceStatistics.summary.sickLeave > 0 || 
                    attendanceStatistics.summary.permission > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-yellow-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Cuti</p>
                        <p className="text-xl font-bold text-yellow-700">
                          {attendanceStatistics.summary.leave}
                        </p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Sakit</p>
                        <p className="text-xl font-bold text-orange-700">
                          {attendanceStatistics.summary.sickLeave}
                        </p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Izin</p>
                        <p className="text-xl font-bold text-purple-700">
                          {attendanceStatistics.summary.permission}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  Klik "Refresh Statistik" untuk memuat data
                </p>
              )}
            </div>
          )}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cuti & Izin</h2>
        
        {/* Info Section about Leave System */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Sistem Pengajuan Cuti & Izin</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Jenis Pengajuan yang Tersedia:</strong>
            </p>
            <ul className="ml-4 space-y-1 list-disc">
              <li><strong>🏖️ Cuti Tahunan (Annual Leave)</strong></li>
              <li><strong>🤒 Sakit (Sick Leave)</strong></li>
              <li><strong>📝 Izin (Permission)</strong></li>
            </ul>
          </div>
        </div>

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
                  Jenis Cuti/Izin <span className="text-red-500">*</span>
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="ANNUAL_LEAVE">🏖️ Cuti Tahunan (Annual Leave) </option>
                  <option value="SICK_LEAVE">🤒 Sakit (Sick Leave)</option>
                  <option value="PERMISSION">📝 Izin (Permission)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {leaveForm.leaveType === 'ANNUAL_LEAVE' && 'Jenis ini akan mengurangi kuota cuti tahunan Anda'}
                  {leaveForm.leaveType === 'SICK_LEAVE' && 'Jenis ini tidak mengurangi kuota cuti (untuk kondisi sakit)'}
                  {leaveForm.leaveType === 'PERMISSION' && 'Jenis ini tidak mengurangi kuota cuti (untuk keperluan pribadi)'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tanggal Mulai <span className="text-red-500">*</span>
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
                    Tanggal Selesai <span className="text-red-500">*</span>
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
              
              {/* Show estimated days */}
              {leaveForm.startDate && leaveForm.endDate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    📅 <strong>Durasi:</strong> {' '}
                    {(() => {
                      const start = new Date(leaveForm.startDate);
                      const end = new Date(leaveForm.endDate);
                      const diffTime = Math.abs(end - start);
                      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return `${totalDays} hari`;
                    })()}
                  </p>
                  {leaveForm.leaveType === 'ANNUAL_LEAVE' && leaveBalance && (
                    <p className="text-xs text-yellow-700 mt-1">
                      ⚠️ Kuota yang akan terpakai: {' '}
                      {(() => {
                        const start = new Date(leaveForm.startDate);
                        const end = new Date(leaveForm.endDate);
                        const diffTime = Math.abs(end - start);
                        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        return totalDays;
                      })()} dari {leaveBalance.remainingLeaveQuota || 0} hari tersisa
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Alasan <span className="text-red-500">*</span> (Minimal 10 karakter)
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  rows="4"
                  placeholder="Jelaskan alasan pengajuan secara detail (minimal 10 karakter)...&#10;Contoh:&#10;- Cuti: Liburan keluarga ke Bali&#10;- Sakit: Demam tinggi dan perlu istirahat&#10;- Izin: Mengurus dokumen di kantor pemerintahan"
                  required
                  minLength={10}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-xs ${leaveForm.reason.trim().length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                    {leaveForm.reason.trim().length >= 10 ? '✓' : '✗'} {leaveForm.reason.trim().length}/10 karakter minimum
                  </p>
                  {leaveForm.reason.trim().length >= 10 && (
                    <p className="text-xs text-green-600">✓ Alasan sudah cukup</p>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  📎 Lampiran (Opsional)
                </label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {!attachmentPreview ? (
                    <>
                      <input
                        type="file"
                        id="attachment-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="attachment-upload"
                        className="cursor-pointer block text-center"
                      >
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Klik untuk upload dokumen pendukung
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG (Max 5MB)
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          💡 Untuk sakit, lampirkan surat sakit. Untuk izin, lampirkan dokumen terkait.
                        </p>
                      </label>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {attachmentPreview === 'PDF' ? (
                        <div className="flex items-center justify-between bg-white p-3 rounded">
                          <div className="flex items-center">
                            <span className="text-3xl mr-3">📄</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {leaveForm.attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(leaveForm.attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            ❌ Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <img
                            src={attachmentPreview}
                            alt="Preview"
                            className="w-full h-48 object-contain bg-white rounded"
                          />
                          <div className="flex items-center justify-between bg-white p-3 rounded">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {leaveForm.attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(leaveForm.attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={removeAttachment}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              ❌ Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Lampiran bersifat opsional, namun sangat direkomendasikan untuk mempercepat persetujuan
                </p>
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

        {/* Leave History Toggle Button */}
        <div className="mt-6">
          <Button 
            nameProp={showLeaveHistory ? "📋 Sembunyikan Riwayat Pengajuan Cuti/Izin" : "📋 Lihat Riwayat Pengajuan Cuti/Izin"}
            onClick={() => {
              setShowLeaveHistory(!showLeaveHistory)
              if (!showLeaveHistory && leaveRequests.length === 0) fetchLeaveData()
            }}
            variant="secondary"
          />

          {/* Leave History */}
          {showLeaveHistory && (
            <div className="mt-4 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Pengajuan Cuti/Izin</h3>
              
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {leave.leaveType === 'ANNUAL_LEAVE' ? '🏖️' :
                                 leave.leaveType === 'SICK_LEAVE' ? '🤒' : '📝'}
                              </span>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {leave.leaveType === 'ANNUAL_LEAVE' ? 'Cuti Tahunan' :
                                   leave.leaveType === 'SICK_LEAVE' ? 'Sakit' : 'Izin'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {leave.leaveType === 'ANNUAL_LEAVE' ? 'Potong kuota' :
                                   leave.leaveType === 'SICK_LEAVE' ? 'Tidak potong kuota' : 'Tidak potong kuota'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(leave.startDate).toLocaleDateString('id-ID')} - {' '}
                            {new Date(leave.endDate).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {leave.totalDays} hari
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              leave.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                              leave.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                              leave.status === 'CANCELLED' ? 'bg-gray-200 text-gray-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {leave.status === 'APPROVED' ? '✓ Disetujui' :
                               leave.status === 'REJECTED' ? '✗ Ditolak' :
                               leave.status === 'CANCELLED' ? '⊘ Dibatalkan' :
                               '⏳ Menunggu'}
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
                <p className="text-center text-gray-500">Belum ada riwayat pengajuan cuti/izin</p>
              )}
            </div>
          )}
        </div>

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
                    Alasan Overtime (Minimal 10 karakter)
                  </label>
                  <textarea
                    value={overtimeForm.reason}
                    onChange={(e) => setOvertimeForm({...overtimeForm, reason: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    rows="3"
                    placeholder="Jelaskan alasan overtime (minimal 10 karakter)..."
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {overtimeForm.reason.trim().length}/10 karakter minimum
                  </p>
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
              <h4 className="font-semibold text-gray-700 mb-3">Pengajuan Overtime</h4>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
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
                            ot.status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {ot.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ot.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOvertime(ot.id)}
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
            </div>
          )}

          {/* Overtime Approved History */}
          <div className="mt-6">
            <Button 
              nameProp={showOvertimeHistory ? "📋 Sembunyikan Riwayat Overtime yang Disetujui" : "📋 Lihat Riwayat Overtime yang Disetujui"}
              onClick={() => {
                setShowOvertimeHistory(!showOvertimeHistory)
                if (!showOvertimeHistory) fetchOvertimeHistory()
              }}
              variant="secondary"
            />

            {showOvertimeHistory && (
              <div className="mt-4 bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-700 mb-3">Riwayat Overtime yang Disetujui</h4>
                
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : overtimeHistory.length > 0 ? (
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
                            Alasan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catatan Admin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overtimeHistory.map((ot) => (
                          <tr key={ot.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(ot.overtimeDate).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ot.requestedHours} jam
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ot.actualHours || ot.requestedHours} jam
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {ot.reason}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {ot.adminNotes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Belum ada overtime yang disetujui</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // ==================== NOTIFICATIONS/INBOX TAB ====================
  const renderNotifications = () => {
    // Filter notifications based on selected filter
    const filteredNotifications = allNotifications.filter(notif => {
      if (notificationFilter === 'unread') return !notif.isRead
      if (notificationFilter === 'read') return notif.isRead
      return true // 'all'
    })

    const readCount = allNotifications.filter(n => n.isRead).length
    const unreadCountLocal = allNotifications.filter(n => !n.isRead).length

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📬 Inbox Notifikasi
              {unreadCountLocal > 0 && (
                <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {unreadCountLocal} Baru
                </span>
              )}
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6 border-b pb-2">
            <button
              className={`pb-2 px-4 font-semibold transition-all ${
                notificationFilter === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setNotificationFilter('all')}
            >
              Semua ({allNotifications.length})
            </button>
            <button
              className={`pb-2 px-4 font-semibold transition-all ${
                notificationFilter === 'unread'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setNotificationFilter('unread')}
            >
              Belum Dibaca ({unreadCountLocal})
            </button>
            <button
              className={`pb-2 px-4 font-semibold transition-all ${
                notificationFilter === 'read'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setNotificationFilter('read')}
            >
              Sudah Dibaca ({readCount})
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              nameProp="✓ Tandai Semua Sudah Dibaca"
              onClick={markAllAsRead}
              variant="primary"
              disabled={unreadCountLocal === 0 || loading}
            />
            <Button
              nameProp="🗑️ Hapus yang Sudah Dibaca"
              onClick={clearReadNotifications}
              variant="danger"
              disabled={readCount === 0 || loading}
            />
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat notifikasi...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg transition-all ${
                    notif.isRead
                      ? 'bg-white border border-gray-200 hover:bg-gray-50'
                      : 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-700'} mt-1`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleString('id-ID')}
                        </p>
                        {notif.type && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            notif.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                            notif.type === 'ERROR' ? 'bg-red-100 text-red-700' :
                            notif.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notif.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                      title="Hapus notifikasi"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">
                {notificationFilter === 'unread' && 'Tidak ada notifikasi belum dibaca'}
                {notificationFilter === 'read' && 'Tidak ada notifikasi yang sudah dibaca'}
                {notificationFilter === 'all' && 'Tidak ada notifikasi'}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Tips:</strong> Klik notifikasi belum dibaca untuk menandai sudah dibaca.
              Gunakan tombol "Hapus yang Sudah Dibaca" untuk membersihkan inbox.
            </p>
          </div>
        </div>
      </div>
    )
  }

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

        {/* Edit Profile Button */}
        <div className="flex gap-4 mb-4">
          <Button 
            nameProp={showEditProfileForm ? "Sembunyikan Form" : "Edit Profile"}
            onClick={() => {
              setShowEditProfileForm(!showEditProfileForm)
              if (!showEditProfileForm) {
                setProfileForm({ name: profile.name })
              }
            }}
            variant="primary"
          />
          <Button 
            nameProp={showPasswordForm ? "Sembunyikan Form" : "Ubah Password"}
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
                <label className="block text-gray-700 font-semibold mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  nameProp={loading ? "Menyimpan..." : "Simpan Perubahan"}
                  type="submit"
                  variant="primary"
                  disabled={loading}
                />
                <Button 
                  nameProp="Batal"
                  type="button"
                  onClick={() => setShowEditProfileForm(false)}
                  variant="secondary"
                />
              </div>
            </div>
          </form>
        )}

        {/* Change Password Form */}
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
            nameProp="Logout"
            onClick={handleLogout}
            variant="danger"
          />
        </div>
      </div>
    </div>
  )

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

      {/* Background Overlay untuk membuat konten lebih terbaca */}
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl mb-6 border border-gray-200">
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
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📬 Notifikasi
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
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
          {activeTab === 'notifications' && renderNotifications()}
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
    </div>
  )
}
