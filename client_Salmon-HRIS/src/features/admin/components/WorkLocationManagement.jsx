import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-hot-toast';

const WorkLocationManagement = () => {
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, statistics
  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'all') {
      fetchAllRequests();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, currentPage, filters]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/work-location-changes/admin/pending?page=${currentPage}&limit=10`
      );
      setRequests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Gagal memuat data request: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axiosInstance.get(`/work-location-changes/admin?${params}`);
      setRequests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching all requests:', error);
      toast.error('Gagal memuat data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const response = await axiosInstance.get(`/work-location-changes/admin/statistics?${params}`);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Gagal memuat statistik: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui request ini?')) return;

    try {
      await axiosInstance.patch(
        `/work-location-changes/admin/${requestId}/approve`,
        {}
      );
      toast.success('Request berhasil disetujui!');
      if (activeTab === 'pending') {
        fetchPendingRequests();
      } else {
        fetchAllRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Gagal menyetujui request: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Alasan penolakan harus diisi!');
      return;
    }

    try {
      await axiosInstance.patch(
        `/work-location-changes/admin/${selectedRequest.id}/reject`,
        { rejectionReason }
      );
      toast.success('Request berhasil ditolak!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      if (activeTab === 'pending') {
        fetchPendingRequests();
      } else {
        fetchAllRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Gagal menolak request: ' + (error.response?.data?.message || error.message));
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Work Location Change Requests</h2>
        <p className="text-gray-600">Kelola request perubahan lokasi kerja pegawai</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Requests
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

      {/* Filters (for all tab) */}
      {activeTab === 'all' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', userId: '', startDate: '', endDate: '' })}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : activeTab === 'statistics' ? (
        // Statistics View
        statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Requests</span>
                  <span className="text-2xl font-bold">{statistics.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-xl font-semibold text-yellow-600">{statistics.byStatus.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approved</span>
                  <span className="text-xl font-semibold text-green-600">{statistics.byStatus.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rejected</span>
                  <span className="text-xl font-semibold text-red-600">{statistics.byStatus.rejected}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="text-xl font-semibold text-gray-600">{statistics.byStatus.cancelled}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Requested Location Type</h3>
              <div className="space-y-3">
                {Object.entries(statistics.byLocationType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600">{type}</span>
                    <span className="text-xl font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        // Requests List
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pegawai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perubahan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alasan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {activeTab === 'pending' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.employee.name}</div>
                          <div className="text-sm text-gray-500">{request.employee.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.requestDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getLocationBadge(request.originalLocationType)}`}>
                            {request.originalLocationType}
                          </span>
                          <span>→</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getLocationBadge(request.requestedLocationType)}`}>
                            {request.requestedLocationType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      {activeTab === 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Tolak Request</h3>
            <p className="text-gray-600 mb-4">
              Berikan alasan penolakan untuk request dari <strong>{selectedRequest?.employee.name}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Alasan penolakan (min. 10 karakter)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 h-24"
              maxLength={500}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Tolak Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkLocationManagement;
