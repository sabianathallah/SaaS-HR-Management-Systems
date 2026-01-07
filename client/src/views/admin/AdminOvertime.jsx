import { useState, useEffect } from 'react';
import { overtimeService } from '../../services/overtimeService';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export default function AdminOvertime() {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOvertime, setSelectedOvertime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      setIsLoading(true);
      const response = await overtimeService.getAllOvertimeRequests();
      setOvertimeRequests(response.data || []);
    } catch (err) {
      console.error('Failed to fetch overtime requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await overtimeService.approveOvertimeRequest(id, { approvalNote });
      setIsModalOpen(false);
      setApprovalNote('');
      fetchOvertimeRequests();
    } catch (err) {
      alert('Failed to approve: ' + err.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await overtimeService.rejectOvertimeRequest(id, { approvalNote });
      setIsModalOpen(false);
      setApprovalNote('');
      fetchOvertimeRequests();
    } catch (err) {
      alert('Failed to reject: ' + err.response?.data?.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overtime Requests Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overtimeRequests.map((overtime) => (
                <tr key={overtime.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {overtime.User?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(overtime.overtimeDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{overtime.startTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{overtime.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{overtime.hours} hours</td>
                  <td className="px-6 py-4 max-w-xs truncate">{overtime.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      overtime.status === 'approved' ? 'bg-green-100 text-green-800' :
                      overtime.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {overtime.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {overtime.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedOvertime(overtime);
                          setIsModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {overtimeRequests.length === 0 && (
            <p className="text-center py-8 text-gray-500">No overtime requests found</p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedOvertime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Review Overtime Request</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <p><strong>Employee:</strong> {selectedOvertime.User?.fullName}</p>
              <p><strong>Date:</strong> {format(new Date(selectedOvertime.overtimeDate), 'dd MMM yyyy')}</p>
              <p><strong>Time:</strong> {selectedOvertime.startTime} - {selectedOvertime.endTime}</p>
              <p><strong>Hours:</strong> {selectedOvertime.hours}</p>
              <p><strong>Reason:</strong> {selectedOvertime.reason}</p>
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
                onClick={() => handleApprove(selectedOvertime.id)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedOvertime.id)}
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
