import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import Login from './views/login.jsx'


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}


export function AppOld() {
  return (  
    <>
      <Login />   
    </>
  )
}


