import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

// Import komponen admin
import AdminDashboard from '../components/admin/AdminDashboard';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import LeaveManagement from '../components/admin/LeaveManagement';
import ShiftScheduleManagement from '../components/admin/ShiftScheduleManagement';
import OvertimeManagement from '../components/admin/OvertimeManagement';
import ReportAnalytics from '../components/admin/ReportAnalytics';
import OfficeLocationManagement from '../components/admin/OfficeLocationManagement';
import AuditLogViewer from '../components/admin/AuditLogViewer';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ProtectedRoute already handles authentication and role checking
    // Just load user data here
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setLoading(false);
  }, []); // Run once on mount

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'employees', label: 'Employee Management', icon: '👥' },
    { id: 'attendance', label: 'Attendance Management', icon: '📅' },
    { id: 'leave', label: 'Leave Management', icon: '🏖️' },
    { id: 'shift', label: 'Shift & Schedule', icon: '⏰' },
    { id: 'overtime', label: 'Overtime Management', icon: '⏱️' },
    { id: 'location', label: 'Office Locations', icon: '📍' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'audit', label: 'Audit Logs', icon: '📝' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                HR Admin Panel
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex space-x-1 p-2 min-w-max">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'leave' && <LeaveManagement />}
          {activeTab === 'shift' && <ShiftScheduleManagement />}
          {activeTab === 'overtime' && <OvertimeManagement />}
          {activeTab === 'location' && <OfficeLocationManagement />}
          {activeTab === 'reports' && <ReportAnalytics />}
          {activeTab === 'audit' && <AuditLogViewer />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
