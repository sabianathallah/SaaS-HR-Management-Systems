import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { Building2, Home, Globe, MapPin } from 'lucide-react';

const HybridScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState('schedules'); // schedules, statistics
  const [schedules, setSchedules] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const locationTypes = ['ONSITE', 'WFH', 'REMOTE'];

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, currentPage]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/hybrid-schedules/admin?page=${currentPage}&limit=10`
      );
      setSchedules(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal memuat data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hybrid-schedules/admin/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Gagal memuat statistik: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSchedule = async (userId) => {
    try {
      const response = await axiosInstance.get(`/hybrid-schedules/admin/user/${userId}`);

      // Convert array to object with dayOfWeek as key
      const scheduleObj = {};
      response.data.data.forEach((schedule) => {
        scheduleObj[schedule.dayOfWeek] = schedule.locationType;
      });
      setWeeklySchedule(scheduleObj);
    } catch (error) {
      console.error('Error fetching user schedule:', error);
      setWeeklySchedule({});
    }
  };

  const handleEditSchedule = (user) => {
    setSelectedUser(user);
    fetchUserSchedule(user.UserId);
    setShowEditModal(true);
  };

  const handleSaveSchedule = async () => {
    try {
      // Convert object to array format
      const scheduleArray = Object.entries(weeklySchedule).map(([day, type]) => ({
        dayOfWeek: parseInt(day),
        locationType: type
      }));

      await axiosInstance.put(
        `/hybrid-schedules/admin/user/${selectedUser.UserId}`,
        { schedules: scheduleArray }
      );

      toast.success('Schedule berhasil diupdate!');
      setShowEditModal(false);
      setSelectedUser(null);
      setWeeklySchedule({});
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Gagal menyimpan schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSchedule = async (userId, dayOfWeek) => {
    if (!confirm(`Hapus schedule untuk hari ${dayNames[dayOfWeek]}?`)) return;

    try {
      await axiosInstance.delete(
        `/hybrid-schedules/admin/user/${userId}/day/${dayOfWeek}`
      );
      toast.success('Schedule berhasil dihapus!');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const getLocationBadge = (locationType) => {
    const badges = {
      ONSITE: 'bg-blue-100 text-blue-800',
      WFH: 'bg-purple-100 text-purple-800',
      REMOTE: 'bg-indigo-100 text-indigo-800'
    };
    return badges[locationType] || 'bg-gray-100 text-gray-800';
  };

  const getLocationIcon = (locationType) => {
    if (locationType === 'ONSITE') return <Building2 size={20} className="text-blue-600" />
    if (locationType === 'WFH') return <Home size={20} className="text-green-600" />
    if (locationType === 'REMOTE') return <Globe size={20} className="text-purple-600" />
    return <MapPin size={20} className="text-gray-500" />
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Hybrid Schedule Management</h2>
        <p className="text-gray-600">Kelola jadwal hybrid work pegawai</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Schedules
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : activeTab === 'statistics' ? (
        // Statistics View
        statistics && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{statistics.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{statistics.totalSchedules}</div>
                  <div className="text-sm text-gray-600">Total Schedules</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {statistics.totalSchedules > 0 ? (statistics.totalSchedules / statistics.totalUsers).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Days/User</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Schedule by Day of Week</h3>
              <div className="space-y-3">
                {dayNames.map((day, index) => {
                  const dayStat = statistics.byDay && statistics.byDay[index] ? statistics.byDay[index] : {};
                  return (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium text-gray-700">{day}</span>
                      <div className="flex space-x-4">
                        <span className="text-sm text-gray-600">
                          Total: <span className="font-semibold">{dayStat.total || 0}</span>
                        </span>
                        <span className="text-sm text-blue-600">
                          ONSITE: {dayStat.ONSITE || 0}
                        </span>
                        <span className="text-sm text-purple-600">
                          WFH: {dayStat.WFH || 0}
                        </span>
                        <span className="text-sm text-indigo-600">
                          REMOTE: {dayStat.REMOTE || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Total by Location Type</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <Building2 size={32} className="mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-600">{statistics.byLocationType.ONSITE || 0}</div>
                  <div className="text-sm text-gray-600">ONSITE</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <Home size={32} className="mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold text-purple-600">{statistics.byLocationType.WFH || 0}</div>
                  <div className="text-sm text-gray-600">WFH</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded">
                  <Globe size={32} className="mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold text-indigo-600">{statistics.byLocationType.REMOTE || 0}</div>
                  <div className="text-sm text-gray-600">REMOTE</div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        // Schedules List
        <>
          <div className="grid grid-cols-1 gap-4">
            {schedules.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                Tidak ada data schedule
              </div>
            ) : (
              schedules.map((userSchedule) => (
                <div key={userSchedule.user.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{userSchedule.user.name}</h3>
                      <p className="text-sm text-gray-600">{userSchedule.user.position}</p>
                      <p className="text-xs text-gray-500">{userSchedule.user.email}</p>
                    </div>
                    <button
                      onClick={() => handleEditSchedule(userSchedule)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Edit Schedule
                    </button>
                  </div>

                  {/* Weekly Schedule Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => {
                      const daySchedule = userSchedule.schedules.find(s => s.dayOfWeek === index);
                      return (
                        <div key={index} className="text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">{day.substring(0, 3)}</div>
                          {daySchedule ? (
                            <div className={`p-2 rounded ${getLocationBadge(daySchedule.locationType)}`}>
                              <div className="text-lg mb-1">{getLocationIcon(daySchedule.locationType)}</div>
                              <div className="text-xs font-semibold">{daySchedule.locationType}</div>
                            </div>
                          ) : (
                            <div className="p-2 rounded bg-gray-100 text-gray-400">
                              <div className="text-lg mb-1">-</div>
                              <div className="text-xs">No schedule</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Edit Schedule - {selectedUser.user.name}
            </h3>

            <div className="space-y-4 mb-6">
              {dayNames.map((day, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3">
                  <span className="font-medium text-gray-700 w-24">{day}</span>
                  <div className="flex space-x-2">
                    {locationTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setWeeklySchedule({ ...weeklySchedule, [index]: type })}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          weeklySchedule[index] === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getLocationIcon(type)} {type}
                      </button>
                    ))}
                    {weeklySchedule[index] && (
                      <button
                        onClick={() => {
                          const newSchedule = { ...weeklySchedule };
                          delete newSchedule[index];
                          setWeeklySchedule(newSchedule);
                        }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setWeeklySchedule({});
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Simpan Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridScheduleManagement;
