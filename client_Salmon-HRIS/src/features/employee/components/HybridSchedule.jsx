import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Home, Globe, MapPin } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const HybridSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempSchedule, setTempSchedule] = useState({});

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const locationTypes = ['ONSITE', 'WFH', 'REMOTE'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_BASE_URL}/hybrid-schedules`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Convert array to object with dayOfWeek as key
      const scheduleObj = {};
      response.data.data.forEach((item) => {
        scheduleObj[item.dayOfWeek] = item.locationType;
      });
      setSchedule(scheduleObj);
      setTempSchedule(scheduleObj);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Convert object to array format
      const scheduleArray = Object.entries(tempSchedule).map(([day, type]) => ({
        dayOfWeek: parseInt(day),
        locationType: type
      }));

      await axios.put(
        `${API_BASE_URL}/hybrid-schedules`,
        { schedules: scheduleArray },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Schedule berhasil disimpan!');
      setSchedule(tempSchedule);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (dayOfWeek) => {
    if (!confirm(`Hapus schedule untuk hari ${dayNames[dayOfWeek]}?`)) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${API_BASE_URL}/hybrid-schedules/${dayOfWeek}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const newSchedule = { ...schedule };
      delete newSchedule[dayOfWeek];
      setSchedule(newSchedule);
      setTempSchedule(newSchedule);
      alert('Schedule berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus schedule: ' + (error.response?.data?.message || error.message));
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
    if (locationType === 'ONSITE') return <Building2 size={20} />;
    if (locationType === 'WFH') return <Home size={20} />;
    if (locationType === 'REMOTE') return <Globe size={20} />;
    return <MapPin size={20} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Hybrid Work Schedule</h3>
          <p className="text-sm text-gray-600">Atur jadwal hybrid work mingguan Anda</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Schedule
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setTempSchedule(schedule);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* View Mode - Weekly Grid */}
          {!editMode && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-7 gap-3">
                {dayNames.map((day, index) => {
                  const locationType = schedule[index];
                  return (
                    <div key={index} className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-2">{day}</div>
                      {locationType ? (
                        <div className={`p-3 rounded-lg ${getLocationBadge(locationType)}`}>
                          <div className="text-2xl mb-1">{getLocationIcon(locationType)}</div>
                          <div className="text-xs font-semibold">{locationType}</div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-400">
                          <div className="text-2xl mb-1">-</div>
                          <div className="text-xs">No schedule</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(schedule).length === 0 && (
                <div className="text-center mt-4 text-gray-500">
                  <p>Anda belum memiliki hybrid schedule.</p>
                  <p className="text-sm">Klik "Edit Schedule" untuk mengatur jadwal mingguan Anda.</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Mode - List with Options */}
          {editMode && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                {dayNames.map((day, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 w-24">{day}</span>
                      <div className="flex space-x-2 flex-1 justify-end">
                        {locationTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setTempSchedule({ ...tempSchedule, [index]: type })}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                              tempSchedule[index] === type
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span className="mr-1">{getLocationIcon(type)}</span>
                            {type}
                          </button>
                        ))}
                        {tempSchedule[index] && (
                          <button
                            onClick={() => {
                              const newSchedule = { ...tempSchedule };
                              delete newSchedule[index];
                              setTempSchedule(newSchedule);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pilih lokasi kerja untuk setiap hari dalam seminggu</li>
                  <li>• Anda bisa meninggalkan hari kosong jika tidak ada schedule hybrid</li>
                  <li>• Schedule ini akan berlaku setiap minggu secara otomatis</li>
                  <li>• Untuk perubahan sementara, gunakan fitur "Work Location Change Request"</li>
                </ul>
              </div>
            </div>
          )}

          {/* Summary Info */}
          {!editMode && Object.keys(schedule).length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Schedule Mingguan</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <Building2 size={28} className="mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(schedule).filter(t => t === 'ONSITE').length}
                  </div>
                  <div className="text-xs text-gray-600">hari ONSITE</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <Home size={28} className="mx-auto mb-1 text-green-500" />
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(schedule).filter(t => t === 'WFH').length}
                  </div>
                  <div className="text-xs text-gray-600">hari WFH</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded">
                  <Globe size={28} className="mx-auto mb-1 text-purple-500" />
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.values(schedule).filter(t => t === 'REMOTE').length}
                  </div>
                  <div className="text-xs text-gray-600">hari REMOTE</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HybridSchedule;
