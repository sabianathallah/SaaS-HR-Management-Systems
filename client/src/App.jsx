import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Attendance from './views/Attendance';
import Leave from './views/Leave';
import Overtime from './views/Overtime';
import AdminAttendance from './views/admin/AdminAttendance';
import AdminLeave from './views/admin/AdminLeave';
import AdminOvertime from './views/admin/AdminOvertime';
import AdminUsers from './views/admin/AdminUsers';
import AdminReports from './views/admin/AdminReports';
import useAuthStore from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Employee Routes */}
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="overtime" element={<Overtime />} />

            {/* Admin Routes */}
            <Route
              path="admin/attendance"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/leave"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/overtime"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminOvertime />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
