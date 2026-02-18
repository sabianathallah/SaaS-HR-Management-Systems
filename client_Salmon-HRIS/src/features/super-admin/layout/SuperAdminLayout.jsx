import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import {
  LayoutDashboard, Building2, Users, Settings2,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import logoNavbar from '../../../assets/logo-navbar.png'

const NAV_ITEMS = [
  { path: '/super-admin/dashboard', Icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & Statistics' },
  { path: '/super-admin/companies', Icon: Building2, label: 'Companies', desc: 'Manage Companies' },
  { path: '/super-admin/users', Icon: Users, label: 'Users', desc: 'Manage All Users' },
  { path: '/super-admin/settings', Icon: Settings2, label: 'Settings', desc: 'System Settings' },
]

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handler = () => setUserData(JSON.parse(localStorage.getItem('user') || '{}'))
    window.addEventListener('userUpdated', handler)
    return () => window.removeEventListener('userUpdated', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    navigate('/login')
  }

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col transition-all duration-300 shadow-xl"
        style={{
          width: sidebarOpen ? 256 : 72,
          minWidth: sidebarOpen ? 256 : 72,
          background: 'linear-gradient(180deg, #0D3535 0%, #134343 50%, #1A9B9A 100%)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <img src={logoNavbar} alt="Salmon HRIS" className="h-10 mr-3 drop-shadow" />
          )}
          <div className={`flex-1 overflow-hidden transition-all ${sidebarOpen ? '' : 'hidden'}`}>
            <p className="text-white font-bold text-base leading-tight truncate">Salmon HRIS</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Super Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ path, Icon, label, desc }) => (
            <NavLink
              key={path}
              to={path}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/15 shadow-inner border border-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon
                    size={20}
                    className="flex-shrink-0"
                    style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
                  />
                  {sidebarOpen && (
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold leading-tight"
                        style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}>
                        {label}
                      </p>
                      <p className="text-xs leading-tight truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: '#1A9B9A' }}>
                {userData.name?.charAt(0) || 'SA'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">{userData.name || 'Super Admin'}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{userData.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: '#1A9B9A' }}>
                {userData.name?.charAt(0) || 'SA'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >
            <LogOut size={15} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Super Admin Panel</h2>
              <p className="text-xs text-gray-500 mt-0.5">{getCurrentDate()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ background: '#E6F7F7', color: '#1A9B9A', borderColor: '#1A9B9A33' }}>
                SUPER ADMIN
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: '#1A9B9A' }}>
                  {userData.name?.charAt(0) || 'SA'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
