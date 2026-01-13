import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Login from './views/Login.jsx'
import EmployeePage from './views/EmployeePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout.jsx'
import DashboardPage from './views/admin/DashboardPage.jsx'
import EmployeesPage from './views/admin/EmployeesPage.jsx'
import AttendancePage from './views/admin/AttendancePage.jsx'
import LeavePage from './views/admin/LeavePage.jsx'
import ShiftPage from './views/admin/ShiftPage.jsx'
import OvertimePage from './views/admin/OvertimePage.jsx'
import OrganizationPage from './views/admin/OrganizationPage.jsx'
import ReportsPage from './views/admin/ReportsPage.jsx'
import NotificationsPage from './views/admin/NotificationsPage.jsx'
import SettingsPage from './views/admin/SettingsPage.jsx'


export default function App() {

  return (
    <>
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

      {/* Toast Container - Fixed Configuration */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        limit={3}
      />
    </>
  )
}





