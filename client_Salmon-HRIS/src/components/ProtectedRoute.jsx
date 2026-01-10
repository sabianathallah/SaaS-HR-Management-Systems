import { Navigate } from 'react-router'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('access_token')
  const userRole = localStorage.getItem('user_role')

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Jika ada role restriction, cek apakah user role diperbolehkan
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect ke page yang sesuai dengan role user
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/employee" replace />
    }
  }

  return children
}
