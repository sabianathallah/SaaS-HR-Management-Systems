import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { Clock, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../../shared/components/Modal';

const OvertimeManagement = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Fix 4: Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fix 5: Date range filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');

  // Fix 1: Approve confirmation state (replaces window.confirm)
  const [approveConfirm, setApproveConfirm] = useState(null);

  // Fix 2: Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchOvertimeRequests();
  }, [currentPage, statusFilter, filterStartDate, filterEndDate]);

  // Fix 3 + Fix 4 + Fix 5: Updated fetch with pagination and date filters
  const fetchOvertimeRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 20);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const response = await axiosInstance.get(`/overtimes/admin/requests?${params.toString()}`);

      // Fix 3: Handle both old array format and new { requests, pagination } format
      const d = response.data.data;
      const list = Array.isArray(d) ? d : (d?.requests ?? []);
      setOvertimeRequests(list);

      if (d?.pagination) {
        setTotalPages(d.pagination.totalPages ?? 1);
      }

      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load overtime requests');
      setLoading(false);
    }
  };

  // Fix 1: handleApprove now sets approveConfirm instead of calling window.confirm
  const handleApprove = (item) => {
    setApproveConfirm(item);
  };

  const confirmApproveOvertime = async () => {
    if (!approveConfirm) return;
    try {
      await axiosInstance.patch(`/overtimes/admin/${approveConfirm.id}/approve`, {});
      toast.success('Overtime approved successfully!');
      setApproveConfirm(null);
      await fetchOvertimeRequests();
    } catch (error) {
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
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Fix 2: Delete handlers
  const handleDeleteOvertime = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDeleteOvertime = async () => {
    if (!deleteConfirm) return;
    try {
      await axiosInstance.delete(`/overtimes/admin/${deleteConfirm.id}`);
      toast.success('Overtime request deleted successfully!');
      setDeleteConfirm(null);
      await fetchOvertimeRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete overtime request');
    }
  };

  // Fix 5: Reset all filters
  const handleResetFilter = () => {
    setStatusFilter('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const filtered = overtimeRequests;

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

      {/* Fix 5: Filter area with status, date range, and reset button */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                // Fix 9: Reset to page 1 when status filter changes
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>
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
                    {/* Fix 8: Use only req.requestedHours */}
                    <div className="font-medium">{req.requestedHours}h</div>
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
                        {/* Fix 7: Safe null check for approver.name */}
                        <div className="font-medium text-gray-900">{req.approver?.name ?? '-'}</div>
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
                          <div className="text-gray-400">By: {req.approver?.name ?? '-'}</div>
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
                          {/* Fix 1: handleApprove now triggers modal instead of window.confirm */}
                          <button
                            onClick={() => handleApprove(req)}
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

                      {/* Fix 2: Delete button for all rows */}
                      <button
                        onClick={() => handleDeleteOvertime(req)}
                        className="text-gray-400 hover:text-red-600 font-medium text-left"
                        title="Delete Request"
                      >
                        <Trash2 size={14} className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fix 4: Pagination bar */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Fix 1: Approve Confirmation Modal */}
      <Modal
        isOpen={approveConfirm !== null}
        onClose={() => setApproveConfirm(null)}
        title="Konfirmasi Persetujuan"
        size="md"
      >
        <div className="space-y-4">
          {approveConfirm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Request Details:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Employee:</strong> {approveConfirm.employee?.name}</p>
                <p><strong>Date:</strong> {new Date(approveConfirm.overtimeDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Hours:</strong> {approveConfirm.requestedHours} hour(s)</p>
                <p><strong>Reason:</strong> {approveConfirm.reason}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menyetujui permintaan lembur ini?</p>
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setApproveConfirm(null)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmApproveOvertime}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Setujui
            </button>
          </div>
        </div>
      </Modal>

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

      {/* Fix 2: Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Konfirmasi Hapus"
        size="md"
      >
        <div className="space-y-4">
          {deleteConfirm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Request Details:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Employee:</strong> {deleteConfirm.employee?.name}</p>
                <p><strong>Date:</strong> {new Date(deleteConfirm.overtimeDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Hours:</strong> {deleteConfirm.requestedHours} hour(s)</p>
                <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(deleteConfirm.status)}`}>{deleteConfirm.status.toUpperCase()}</span></p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus permintaan lembur ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmDeleteOvertime}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OvertimeManagement;
