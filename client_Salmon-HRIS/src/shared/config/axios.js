import axios from 'axios'
import baseUrl from './url'

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
})

// Request interceptor — attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track refresh state to avoid infinite loops
let isRefreshing = false
let failedRequestsQueue = []

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedRequestsQueue = []
}

// Response interceptor — handle 401 with refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axiosInstance(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axiosInstance.post('/auth/refresh-token')
        const newToken = data.access_token
        localStorage.setItem('access_token', newToken)
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        processQueue(null, newToken)
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        localStorage.removeItem('company')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message)
    }

    return Promise.reject(error)
  }
)

// Proactive token refresh — call this after login
// Schedules a silent refresh 30 minutes before token expiry
export const scheduleTokenRefresh = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    const expiresAt = payload.exp * 1000
    const refreshAt = expiresAt - 30 * 60 * 1000 // 30 min before expiry
    const delay = refreshAt - Date.now()
    if (delay > 0) {
      setTimeout(async () => {
        try {
          const { data } = await axiosInstance.post('/auth/refresh-token')
          localStorage.setItem('access_token', data.access_token)
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
          scheduleTokenRefresh() // schedule the next refresh
        } catch {
          // Refresh failed silently — interceptor will handle on next request
        }
      }, delay)
    }
  } catch {
    // Token not parseable — skip scheduling
  }
}

export default axiosInstance
