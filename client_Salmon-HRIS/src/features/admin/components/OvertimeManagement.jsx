import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import Modal from '../../../shared/components/Modal';

const OvertimeManagement = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      const response = await axiosInstance.get('/overtimes/admin/requests');
      setOvertimeRequests(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      toast.error('Failed to load overtime requests');
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this overtime request?')) return;

    try {
      await axiosInstance.patch(`/overtimes/admin/${id}/approve`, {});
      toast.success('Overtime approved successfully!');
      await fetchOvertimeRequests();
    } catch (error) {
      console.error('Error approving overtime:', error);
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.patch(`/overtimes/admin/${id}/reject`, {
        rejectionReason: rejectReason,
      });
      toast.success('Overtime rejected successfully!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      await fetchOvertimeRequests();
    } catch (error) {
      console.error('Error rejecting overtime:', error);
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditReason(request.rejectionReason || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editStatus === 'rejected' && (!editReason || editReason.trim().length < 10)) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }

    try {
      await axiosInstance.patch(`/overtimes/admin/${selectedRequest.id}/update-status`, {
        status: editStatus,
        rejectionReason: editStatus === 'rejected' ? editReason : null,
      });

      toast.success('Status updated successfully!');
      setShowEditModal(false);
      setSelectedRequest(null);
      setEditReason('');
      setEditStatus('');
      await fetchOvertimeRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = overtimeRequests.filter(req =>
    statusFilter === 'all' ? true : req.status === statusFilter
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
            {overtimeRequests.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-900">
            {overtimeRequests.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-900">
            {overtimeRequests.filter(r => r.status === 'rejected').length}
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No overtime requests found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-medium text-gray-900">{req.employee?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{req.employee?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
                    {new Date(req.overtimeDate).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
                    <div className="font-medium">{req.requestedHours || req.hours}h</div>
                    {req.actualHours && req.actualHours !== req.requestedHours && (
                      <div className="text-xs text-blue-600">Actual: {req.actualHours}h</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs align-top">
                    <div className="truncate" title={req.reason}>
                      {req.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(req.status)}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs align-top">
                    {req.status === 'approved' && req.approver && (
                      <div className="space-y-1 min-w-[120px]">
                        <div className="text-gray-500">Approved by:</div>
                        <div className="font-medium text-gray-900">{req.approver.name}</div>
                        {req.approvedAt && (
                          <div className="text-gray-400">
                            {new Date(req.approvedAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className="space-y-1 min-w-[120px] max-w-[200px]">
                        <div className="text-gray-500">Reason:</div>
                        <div className="text-red-600 font-medium line-clamp-2" title={req.rejectionReason}>
                          {req.rejectionReason}
                        </div>
                        {req.approver && (
                          <div className="text-gray-400">By: {req.approver.name}</div>
                        )}
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <div className="text-gray-400 italic">
                        Awaiting review...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                    <div className="flex flex-col space-y-1">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="text-green-600 hover:text-green-900 font-medium text-left"
                            title="Approve Request"
                          >
                            <CheckCircle2 size={14} className="inline mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(req)}
                            className="text-red-600 hover:text-red-900 font-medium text-left"
                            title="Reject Request"
                          >
                            <XCircle size={14} className="inline mr-1" /> Reject
                          </button>
                        </>
                      )}

                      {(req.status === 'approved' || req.status === 'rejected') && (
                        <button
                          onClick={() => handleEdit(req)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-left"
                          title="Edit Status"
                        >
                          <Pencil size={14} className="inline mr-1" /> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedRequest(null);
        }}
        title={selectedRequest?.status === 'approved' ? 'Change Status to Rejected' : 'Reject Overtime Request'}
        size="md"
      >
        <div className="space-y-4">
          {selectedRequest && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Request Details:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Employee:</strong> {selectedRequest.employee?.name}</p>
                <p><strong>Date:</strong> {new Date(selectedRequest.overtimeDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Hours:</strong> {selectedRequest.requestedHours} hour(s)</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                {selectedRequest.status === 'approved' && (
                  <p className="text-orange-600 font-medium mt-2">
                    This will change the status from APPROVED to REJECTED
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="4"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <button
              onClick={() => handleReject(selectedRequest?.id)}
              disabled={!rejectReason.trim() || rejectReason.trim().length < 10}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedRequest(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
          {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
            <p className="text-xs text-red-500">Rejection reason must be at least 10 characters</p>
          )}
        </div>
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRequest(null);
          setEditStatus('');
          setEditReason('');
        }}
        title="Edit Overtime Request Status"
        size="md"
      >
        <div className="space-y-4">
          {selectedRequest && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Request Details:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Employee:</strong> {selectedRequest.employee?.name}</p>
                <p><strong>Date:</strong> {new Date(selectedRequest.overtimeDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Hours:</strong> {selectedRequest.requestedHours} hour(s)</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                <p><strong>Current Status:</strong> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {selectedRequest.status.toUpperCase()}
                </span></p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {editStatus === 'rejected' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows="4"
                placeholder="Enter reason for rejection (min. 10 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {editReason.trim().length > 0 && editReason.trim().length < 10 && (
                <p className="text-xs text-red-500 mt-1">Must be at least 10 characters</p>
              )}
            </div>
          )}

          <div className="flex space-x-4 pt-4 border-t">
            <button
              onClick={handleSaveEdit}
              disabled={editStatus === 'rejected' && (!editReason.trim() || editReason.trim().length < 10)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedRequest(null);
                setEditStatus('');
                setEditReason('');
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OvertimeManagement;
