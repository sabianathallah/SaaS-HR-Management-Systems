import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { reportService } from '../services/reportService';
import { Users, Calendar, Clock, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await reportService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Welcome, {user?.fullName}!
        </h2>
        <p className="text-gray-600">Role: {user?.role}</p>
        <p className="text-gray-600">Email: {user?.email}</p>
      </div>

      {user?.role === 'admin' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={<Users className="w-8 h-8 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Today's Attendance"
            value={stats.todayAttendance || 0}
            icon={<Calendar className="w-8 h-8 text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves || 0}
            icon={<FileText className="w-8 h-8 text-yellow-600" />}
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="Pending Overtime"
            value={stats.pendingOvertimes || 0}
            icon={<Clock className="w-8 h-8 text-purple-600" />}
            bgColor="bg-purple-50"
          />
        </div>
      )}

      {user?.role === 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Check In/Out"
            description="Record your attendance"
            onClick={() => navigate('/attendance')}
            bgColor="bg-blue-600"
          />
          <QuickActionCard
            title="Request Leave"
            description="Submit a leave request"
            onClick={() => navigate('/leave')}
            bgColor="bg-green-600"
          />
          <QuickActionCard
            title="Request Overtime"
            description="Submit overtime request"
            onClick={() => navigate('/overtime')}
            bgColor="bg-purple-600"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, onClick, bgColor }) {
  return (
    <button
      onClick={onClick}
      className={`${bgColor} text-white rounded-lg shadow-md p-6 hover:opacity-90 transition-opacity text-left`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </button>
  );
}
