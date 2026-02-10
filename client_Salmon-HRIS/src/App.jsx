import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LandingPage from './views/LandingPage.jsx'
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
import WorkLocationPage from './views/admin/WorkLocationPage.jsx'

// Payroll Pages - Admin Only
import PayrollPeriodList from './components/admin/PayrollPeriodList.jsx'
import PayrollPeriodDetail from './components/admin/PayrollPeriodDetail.jsx'

// Payroll Pages - Employee & Admin
import MyPayslips from './components/MyPayslips.jsx'
import PayslipDetail from './components/PayslipDetail.jsx'


export default function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
            <Route path="work-location" element={<WorkLocationPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Payroll Routes - Admin */}
            <Route path="payroll/periods" element={<PayrollPeriodList />} />
            <Route path="payroll/periods/:periodId" element={<PayrollPeriodDetail />} />
          </Route>
          
          {/* Payroll Routes - Employee (Standalone, not nested in AdminLayout) */}
          <Route 
            path='/payroll/my-payslips' 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                <MyPayslips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/payroll/payslips/:payrollId' 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                <PayslipDetail />
              </ProtectedRoute>
            } 
          />
          
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





