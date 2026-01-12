import { useState, useEffect } from 'react';
import axios from 'axios';

const OvertimeManagement = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/overtimes/admin/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOvertimeRequests(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this overtime request?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/overtimes/admin/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Overtime approved!');
      fetchOvertimeRequests();
    } catch (error) {
      console.error('Error approving overtime:', error);
      alert(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/overtimes/admin/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Overtime rejected!');
      fetchOvertimeRequests();
    } catch (error) {
      console.error('Error rejecting overtime:', error);
      alert(error.response?.data?.message || 'Failed to reject');
    }
  };

  const filtered = overtimeRequests.filter(req => 
    statusFilter === 'all' ? true : req.status === statusFilter
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overtime Management</h2>
        <p className="text-gray-600">Manage employee overtime requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">
            {overtimeRequests.filter(r => r.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-900">
            {overtimeRequests.filter(r => r.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-900">
            {overtimeRequests.filter(r => r.status === 'REJECTED').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total</div>
          <div className="text-2xl font-bold text-blue-900">
            {overtimeRequests.length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">⏱️</div>
            <p>No overtime requests found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.User?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{req.User?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(req.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.hours} hour(s)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OvertimeManagement;
