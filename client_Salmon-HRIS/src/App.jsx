import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LandingPage from './views/LandingPage.jsx'
import Login from './views/Login.jsx'
import EmployeePage from './features/employee/views/EmployeePage.jsx'
import ProtectedRoute from './shared/components/ProtectedRoute.jsx'

// Admin Layout & Pages
import AdminLayout from './features/admin/layout/AdminLayout.jsx'
import DashboardPage from './features/admin/views/DashboardPage.jsx'
import EmployeesPage from './features/admin/views/EmployeesPage.jsx'
import AttendancePage from './features/admin/views/AttendancePage.jsx'
import LeavePage from './features/admin/views/LeavePage.jsx'
import ShiftPage from './features/admin/views/ShiftPage.jsx'
import OvertimePage from './features/admin/views/OvertimePage.jsx'
import OrganizationPage from './features/admin/views/OrganizationPage.jsx'
import ReportsPage from './features/admin/views/ReportsPage.jsx'
import NotificationsPage from './features/admin/views/NotificationsPage.jsx'
import SettingsPage from './features/admin/views/SettingsPage.jsx'
import WorkLocationPage from './features/admin/views/WorkLocationPage.jsx'

// Payroll Pages - Admin Only
import PayrollPeriodList from './features/admin/components/PayrollPeriodList.jsx'
import PayrollPeriodDetail from './features/admin/components/PayrollPeriodDetail.jsx'

// Payroll Pages - Employee & Admin
import MyPayslips from './features/employee/components/MyPayslips.jsx'
import PayslipDetail from './features/employee/components/PayslipDetail.jsx'

// Super Admin Layout & Pages
import SuperAdminLayout from './features/super-admin/layout/SuperAdminLayout.jsx'
import SuperAdminDashboard from './features/super-admin/views/SuperAdminDashboard.jsx'
import CompaniesPage from './features/super-admin/views/CompaniesPage.jsx'
import UsersPage from './features/super-admin/views/UsersPage.jsx'
import SuperAdminSettingsPage from './features/super-admin/views/SettingsPage.jsx'


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
              <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
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

          {/* Super Admin Protected Routes */}
          <Route 
            path='/super-admin' 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SuperAdminSettingsPage />} />
          </Route>

          {/* Payroll Routes - Employee (Standalone, not nested in AdminLayout) */}
          <Route 
            path='/payroll/my-payslips' 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'COMPANY_ADMIN']}>
                <MyPayslips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/payroll/payslips/:payrollId' 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'COMPANY_ADMIN']}>
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





