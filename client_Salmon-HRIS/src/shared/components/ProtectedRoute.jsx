import { Navigate } from 'react-router'

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    // base64url → base64 → JSON
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const decoded = decodeToken(token)

  // Token can't be decoded or is malformed
  if (!decoded) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    return <Navigate to="/login" replace />
  }

  // Token expired (exp is in seconds)
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    return <Navigate to="/login" replace />
  }

  const userRole = decoded.role

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />
    } else if (userRole === 'COMPANY_ADMIN') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/employee" replace />
    }
  }

  return children
}
