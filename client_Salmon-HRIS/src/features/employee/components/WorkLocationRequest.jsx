import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';


const WorkLocationRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    requestDate: '',
    requestedLocationType: 'WFH',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/work-location-changes');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Gagal memuat riwayat request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.requestDate || !form.reason.trim()) {
      alert('Tanggal dan alasan harus diisi!');
      return;
    }

    // Check if date is not in the past
    const selectedDate = new Date(form.requestDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Tidak dapat membuat request untuk tanggal yang sudah lewat!');
      return;
    }

    try {
      await axiosInstance.post('/work-location-changes', form);
      alert('Request berhasil dibuat!');
      setShowForm(false);
      setForm({
        requestDate: '',
        requestedLocationType: 'WFH',
        reason: ''
      });
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Gagal membuat request: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan request ini?')) return;

    try {
      await axiosInstance.patch(`/work-location-changes/${requestId}/cancel`, {});
      alert('Request berhasil dibatalkan!');
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Gagal membatalkan request: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getLocationBadge = (locationType) => {
    const badges = {
      ONSITE: 'bg-blue-100 text-blue-800',
      WFH: 'bg-purple-100 text-purple-800',
      REMOTE: 'bg-indigo-100 text-indigo-800'
    };
    return badges[locationType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Work Location Change Request</h3>
          <p className="text-sm text-gray-600">Request untuk mengubah lokasi kerja sementara</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Tutup Form' : 'Buat Request'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Buat Request Baru</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.requestDate}
                onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Lokasi yang Diminta <span className="text-red-500">*</span>
              </label>
              <select
                value={form.requestedLocationType}
                onChange={(e) => setForm({ ...form, requestedLocationType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="WFH">Work From Home (WFH)</option>
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Jelaskan alasan Anda meminta perubahan lokasi kerja..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{form.reason.length}/500 karakter</p>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ requestDate: '', requestedLocationType: 'WFH', reason: '' });
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h4 className="font-semibold text-gray-800">Riwayat Request</h4>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Belum ada request
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {new Date(request.requestDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getLocationBadge(request.originalLocationType)}`}>
                        {request.originalLocationType}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getLocationBadge(request.requestedLocationType)}`}>
                        {request.requestedLocationType}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Alasan:</span> {request.reason}
                    </p>
                    
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Alasan Ditolak:</span> {request.rejectionReason}
                      </p>
                    )}
                    
                    {request.status === 'APPROVED' && request.approver && (
                      <p className="text-xs text-green-600">
                        Disetujui oleh: {request.approver.name}
                      </p>
                    )}
                  </div>
                  
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkLocationRequest;
