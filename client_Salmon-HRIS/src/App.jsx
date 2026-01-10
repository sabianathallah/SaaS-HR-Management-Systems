import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import Login from './views/Login.jsx'
import EmployeePage from './views/employeePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
// import AdminPage from './views/AdminPage.jsx' // Uncomment ketika AdminPage sudah dibuat


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
        
        {/* <Route 
          path='/admin' 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } 
        /> */}
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}





