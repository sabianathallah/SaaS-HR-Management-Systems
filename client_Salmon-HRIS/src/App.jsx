import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import Login from './views/Login.jsx'
import EmployeePage from './views/EmployeePage.jsx'
import AdminPage from './views/AdminPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - hanya bisa diakses dengan role tertentu */}
        <Route 
          path='/employee' 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/admin' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}





