import { Outlet, useNavigate } from 'react-router'
import { useState } from 'react'

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-900 to-purple-700 text-white transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <h1 className="text-xl font-bold">Super Admin</h1>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-purple-600"
            >
              ☰
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => navigate('/super-admin/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              📊 {sidebarOpen && 'Dashboard'}
            </button>
            <button
              onClick={() => navigate('/super-admin/companies')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              🏢 {sidebarOpen && 'Companies'}
            </button>
            <button
              onClick={() => navigate('/super-admin/users')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              👥 {sidebarOpen && 'All Users'}
            </button>
            <button
              onClick={() => navigate('/super-admin/settings')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              ⚙️ {sidebarOpen && 'Settings'}
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Super Admin Panel</h2>
              <p className="text-sm text-gray-600">Manage all companies and users</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{userData.name}</p>
                <p className="text-xs text-purple-600">{userData.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {userData.name?.charAt(0) || 'SA'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
