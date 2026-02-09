import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router';
import logoNavbar from '../assets/logo-navbar.png';
import backgroundImage from '../assets/background.png';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData;
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      path: '/admin/dashboard',
      description: 'Overview & Statistics'
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      icon: '👥',
      path: '/admin/employees',
      description: 'Manage Employee Data'
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: '✓',
      path: '/admin/attendance',
      description: 'Track Employee Attendance'
    },
    { 
      id: 'leave', 
      label: 'Leave', 
      icon: '🏖️',
      path: '/admin/leave',
      description: 'Leave Requests & Approvals'
    },
    { 
      id: 'shift', 
      label: 'Shift & Schedule', 
      icon: '⏰',
      path: '/admin/shift',
      description: 'Work Schedule Management'
    },
    { 
      id: 'overtime', 
      label: 'Overtime', 
      icon: '⏱️',
      path: '/admin/overtime',
      description: 'Overtime Requests'
    },
    { 
      id: 'payroll', 
      label: 'Payroll', 
      icon: '💰',
      path: '/admin/payroll/periods',
      description: 'Salary & Payments'
    },
    { 
      id: 'location', 
      label: 'Organization', 
      icon: '⚖️',
      path: '/admin/organization',
      description: 'Office Locations & Settings'
    },
    { 
      id: 'work-location', 
      label: 'Work Location', 
      icon: '🏢',
      path: '/admin/work-location',
      description: 'Location Change Requests'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: '📊',
      path: '/admin/reports',
      description: 'Analytics & Reports'
    },
    { 
      id: 'audit', 
      label: 'Activity Logs', 
      icon: '🔔',
      path: '/admin/notifications',
      description: 'System Audit Logs',
      badge: 3
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      path: '/admin/settings',
      description: 'System Settings'
    },
  ];

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div 
      className="flex h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img
              src={logoNavbar}
              alt="Salmon HRIS Logo"
              className="h-12 drop-shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold text-black">HRIS Admin</h1>
              <p className="text-xs text-black">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 bg-slate-900/30 backdrop-blur-sm">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white shadow-lg'
                    : 'text-black hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <div className="flex-1">
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-700 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@company.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome, {user?.name || 'Admin'}!
                </h2>
                <p className="text-sm text-gray-500 mt-1">{getCurrentDate()}</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Avatar & Info */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.email || 'admin@company.com'}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                        {user?.role || 'ADMIN'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
