import { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export default function AdminLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await leaveService.getAllLeaveRequests();
      setLeaveRequests(response.data || []);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approveLeaveRequest(id, { approvalNote });
      setIsModalOpen(false);
      setApprovalNote('');
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to approve: ' + err.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.rejectLeaveRequest(id, { approvalNote });
      setIsModalOpen(false);
      setApprovalNote('');
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to reject: ' + err.response?.data?.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leave Requests Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.User?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(leave.startDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(leave.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.totalDays}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      leave.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leaveRequests.length === 0 && (
            <p className="text-center py-8 text-gray-500">No leave requests found</p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Review Leave Request</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <p><strong>Employee:</strong> {selectedLeave.User?.fullName}</p>
              <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
              <p><strong>Period:</strong> {format(new Date(selectedLeave.startDate), 'dd MMM yyyy')} - {format(new Date(selectedLeave.endDate), 'dd MMM yyyy')}</p>
              <p><strong>Days:</strong> {selectedLeave.totalDays}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Note (Optional)
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedLeave.id)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedLeave.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
