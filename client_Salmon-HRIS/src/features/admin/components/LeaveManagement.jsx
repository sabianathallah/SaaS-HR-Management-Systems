import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { Settings, Calendar, Eye, CheckCircle2, XCircle, Paperclip, Download } from 'lucide-react';
import FormInput from '../../../shared/components/FormInput';
import FormSelect from '../../../shared/components/FormSelect';
import FormTextarea from '../../../shared/components/FormTextarea';
import Modal from '../../../shared/components/Modal';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustQuotaModal, setShowAdjustQuotaModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEmployeeBalance, setSelectedEmployeeBalance] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [quotaAdjustment, setQuotaAdjustment] = useState({
    userId: '',
    annualLeaveQuota: '',
    usedLeaveQuota: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaveRes, employeeRes] = await Promise.all([
        axiosInstance.get('/leave-requests/admin/all'),
        axiosInstance.get('/users/admin'),
      ]);

      setLeaveRequests(leaveRes.data.data || []);
      setEmployees(employeeRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leave data');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      if (!confirm('Are you sure you want to approve this leave request?')) return;

      const response = await axiosInstance.put(
        `/leave-requests/admin/${requestId}/approve`,
        { approvalNote }
      );
      
      console.log('Approve response:', response.data);
      alert('Leave request approved successfully!');
      setShowDetailModal(false);
      setApprovalNote('');
      await fetchData();
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error(error.response?.data?.message || 'Failed to approve leave request');
      alert(error.response?.data?.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const note = prompt('Please provide a reason for rejection:');
      if (!note || note.trim() === '') {
        alert('Rejection reason is required');
        return;
      }

      const response = await axiosInstance.put(
        `/leave-requests/admin/${requestId}/reject`,
        { approvalNote: note }
      );
      
      console.log('Reject response:', response.data);
      alert('Leave request rejected successfully!');
      setShowDetailModal(false);
      setApprovalNote('');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to reject leave request');
      alert(error.response?.data?.message || 'Failed to reject leave request');
    }
  };

  const handleRejectFromModal = async () => {
    try {
      if (!approvalNote || approvalNote.trim() === '') {
        alert('Please provide a reason for rejection in the notes field');
        return;
      }

      const response = await axiosInstance.put(
        `/leave-requests/admin/${selectedRequest.id}/reject`,
        { approvalNote: approvalNote }
      );
      
      console.log('Reject response:', response.data);
      alert('Leave request rejected successfully!');
      setShowDetailModal(false);
      setSelectedRequest(null);
      setApprovalNote('');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to reject leave request');
      alert(error.response?.data?.message || 'Failed to reject leave request');
    }
  };

  const handleAdjustQuota = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!quotaAdjustment.userId) {
      alert('Please select an employee');
      return;
    }
    
    if (!quotaAdjustment.annualLeaveQuota || !quotaAdjustment.usedLeaveQuota) {
      alert('Please fill in all quota fields');
      return;
    }
    
    try {
      await axiosInstance.put(
        `/leave-requests/admin/adjust-quota/${quotaAdjustment.userId}`,
        {
          annualLeaveQuota: parseInt(quotaAdjustment.annualLeaveQuota),
          usedLeaveQuota: parseInt(quotaAdjustment.usedLeaveQuota),
        }
      );
      alert('Leave quota adjusted successfully!');
      setShowAdjustQuotaModal(false);
      setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adjusting quota:', error);
      toast.error(error.response?.data?.message || 'Failed to adjust leave quota');
      alert(error.response?.data?.message || 'Failed to adjust leave quota');
    }
  };

  const openDetailModal = (request) => {
    console.log('Opening detail modal for request:', request); // Debug log
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleViewAttachment = async (requestId) => {
    try {
      const response = await axiosInstance.get(
        `/leave-requests/admin/${requestId}/attachment/view`,
        { responseType: 'blob' } // Important for file download
      );

      // Create blob URL and open in new tab
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after opening
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error viewing attachment:', error);
      toast.error(error.response?.data?.message || 'Failed to view attachment');
      alert(error.response?.data?.message || 'Failed to view attachment');
    }
  };

  const handleDownloadAttachment = async (requestId, filename) => {
    try {
      const response = await axiosInstance.get(
        `/leave-requests/admin/${requestId}/attachment/download`,
        { responseType: 'blob' } // Important for file download
      );

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error(error.response?.data?.message || 'Failed to download attachment');
      alert(error.response?.data?.message || 'Failed to download attachment');
    }
  };

  const filteredRequests = leaveRequests.filter(req => 
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

  const getLeaveTypeBadgeClass = (type) => {
    switch (type) {
      case 'ANNUAL_LEAVE': return 'bg-blue-100 text-blue-800';
      case 'SICK_LEAVE': return 'bg-orange-100 text-orange-800';
      case 'UNPAID_LEAVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leave requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-600">Manage employee leave requests and quotas</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('Opening adjust quota modal');
            setShowAdjustQuotaModal(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Settings size={14} className="inline mr-1" /> Adjust Quota
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">
            {leaveRequests.filter(r => r.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-900">
            {leaveRequests.filter(r => r.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-900">
            {leaveRequests.filter(r => r.status === 'REJECTED').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Requests</div>
          <div className="text-2xl font-bold text-blue-900">
            {leaveRequests.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <FormSelect
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.employee?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.employee?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadgeClass(request.leaveType)}`}>
                        {request.leaveType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(request.startDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-500">to {new Date(request.endDate).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.totalDays} day(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDetailModal(request);
                        }}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <Eye size={14} className="inline mr-1" /> View
                      </button>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                          >
                            <CheckCircle2 size={14} className="inline mr-1" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <XCircle size={14} className="inline mr-1" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={showDetailModal && selectedRequest !== null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
          setApprovalNote('');
        }}
        title="Leave Request Detail"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Leave Request Detail</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-medium">{selectedRequest.employee?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadgeClass(selectedRequest.leaveType)}`}>
                    {selectedRequest.leaveType?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="font-medium">{selectedRequest.totalDays} day(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Reason</p>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.attachmentPath && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Attachment</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Paperclip size={16} />
                      <span className="font-medium text-gray-700">{selectedRequest.attachmentOriginalName}</span>
                    </div>
                    {selectedRequest.attachmentSize && (
                      <p className="text-xs text-gray-500">
                        Size: {(selectedRequest.attachmentSize / 1024).toFixed(2)} KB
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleViewAttachment(selectedRequest.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={14} className="inline mr-1" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(selectedRequest.id, selectedRequest.attachmentOriginalName)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <Download size={14} className="inline mr-1" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedRequest.approvalNote && (
                <div>
                  <p className="text-sm text-gray-600">Approval Note</p>
                  <p className="font-medium">{selectedRequest.approvalNote}</p>
                </div>
              )}

              {selectedRequest.approver && (
                <div>
                  <p className="text-sm text-gray-600">Approved/Rejected By</p>
                  <p className="font-medium">{selectedRequest.approver.name}</p>
                </div>
              )}
            </div>

            {selectedRequest.status === 'PENDING' && (
              <div className="space-y-3">
                <FormTextarea
                  label="Approval Note (Optional)"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Add a note for this approval/rejection..."
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle2 size={14} className="inline mr-1" /> Approve
                  </button>
                  <button
                    onClick={handleRejectFromModal}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle size={14} className="inline mr-1" /> Reject
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowDetailModal(false);
                setSelectedRequest(null);
                setApprovalNote('');
              }}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Adjust Quota Modal */}
      <Modal
        isOpen={showAdjustQuotaModal}
        onClose={() => {
          setShowAdjustQuotaModal(false);
          setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
        }}
        title="Adjust Leave Quota"
      >
        <form onSubmit={handleAdjustQuota} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Adjust Leave Quota</h3>
            
            <FormSelect
              label="Select Employee"
              value={quotaAdjustment.userId}
              onChange={(e) => setQuotaAdjustment({ ...quotaAdjustment, userId: e.target.value })}
              options={[
                { value: '', label: 'Select Employee' },
                ...employees.map(emp => ({ value: emp.id, label: emp.name }))
              ]}
              required
            />
            
            <FormInput
              label="Annual Leave Quota (Total)"
              type="number"
              min="0"
              value={quotaAdjustment.annualLeaveQuota}
              onChange={(e) => setQuotaAdjustment({ ...quotaAdjustment, annualLeaveQuota: e.target.value })}
              placeholder="e.g., 12"
              required
            />
            
            <FormInput
              label="Used Leave Quota"
              type="number"
              min="0"
              value={quotaAdjustment.usedLeaveQuota}
              onChange={(e) => setQuotaAdjustment({ ...quotaAdjustment, usedLeaveQuota: e.target.value })}
              placeholder="e.g., 5"
              required
            />
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Adjust Quota
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdjustQuotaModal(false);
                  setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
