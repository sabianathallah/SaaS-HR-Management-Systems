import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import Login from './views/Login.jsx'
import EmployeePage from './views/EmployeePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import EmployeesPage from './pages/admin/EmployeesPage.jsx'
import AttendancePage from './pages/admin/AttendancePage.jsx'
import LeavePage from './pages/admin/LeavePage.jsx'
import ShiftPage from './pages/admin/ShiftPage.jsx'
import OvertimePage from './pages/admin/OvertimePage.jsx'
import OrganizationPage from './pages/admin/OrganizationPage.jsx'
import ReportsPage from './pages/admin/ReportsPage.jsx'
import NotificationsPage from './pages/admin/NotificationsPage.jsx'
import SettingsPage from './pages/admin/SettingsPage.jsx'


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Employee Protected Route */}
        <Route 
          path='/employee' 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Protected Routes with Nested Layout */}
        <Route 
          path='/admin' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Admin Routes */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="shift" element={<ShiftPage />} />
          <Route path="overtime" element={<OvertimePage />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}





