import { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import Modal from '../Modal';

const ShiftScheduleManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    workDays: [],
  });
  const [assignForm, setAssignForm] = useState({
    userId: '',
    shiftId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [shiftsRes, employeesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/shift/admin/shifts`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/user/admin`, config),
      ]);

      setShifts(shiftsRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingShift) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/shift/admin/shifts/${editingShift.id}`,
          shiftForm,
          config
        );
        alert('Shift updated successfully!');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/shift/admin/shifts`,
          shiftForm,
          config
        );
        alert('Shift created successfully!');
      }
      
      setShowShiftModal(false);
      resetShiftForm();
      fetchData();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert(error.response?.data?.message || 'Failed to save shift');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/shift/admin/shifts/${shiftId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Shift deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert(error.response?.data?.message || 'Failed to delete shift');
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/shift/admin/users/${assignForm.userId}/shift`,
        { shiftId: assignForm.shiftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Shift assigned successfully!');
      setShowAssignModal(false);
      resetAssignForm();
      fetchData();
    } catch (error) {
      console.error('Error assigning shift:', error);
      alert(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleRemoveShift = async (userId) => {
    if (!confirm('Are you sure you want to remove shift from this employee?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/shift/admin/users/${userId}/shift`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Shift removed successfully!');
      fetchData();
    } catch (error) {
      console.error('Error removing shift:', error);
      alert(error.response?.data?.message || 'Failed to remove shift');
    }
  };

  const openEditShiftModal = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workDays: shift.workDays || [],
    });
    setShowShiftModal(true);
  };

  const resetShiftForm = () => {
    setShiftForm({ name: '', startTime: '', endTime: '', workDays: [] });
    setEditingShift(null);
  };

  const resetAssignForm = () => {
    setAssignForm({ userId: '', shiftId: '' });
  };

  if (loading) {
    return <div className="text-center py-8">Loading shift data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shift & Schedule Management</h2>
          <p className="text-gray-600">Manage work shifts and employee schedules</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowShiftModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Create Shift
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            👤 Assign Shift
          </button>
        </div>
      </div>

      {/* Shifts List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">Available Shifts</h3>
        </div>
        {shifts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">⏰</div>
            <p>No shifts configured</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shifts.map((shift) => (
              <div key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{shift.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ⏰ {shift.startTime} - {shift.endTime}
                    </p>
                    {shift.workDays && shift.workDays.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        📅 Work Days: {shift.workDays.join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 mt-2">
                      {employees.filter(e => e.ShiftId === shift.id).length} employees assigned
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditShiftModal(shift)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employee Shift Assignments */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">Employee Shift Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const assignedShift = shifts.find(s => s.id === employee.ShiftId);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignedShift ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {assignedShift.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignedShift ? `${assignedShift.startTime} - ${assignedShift.endTime}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {assignedShift && (
                        <button
                          onClick={() => handleRemoveShift(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Shift Modal */}
      {showShiftModal && (
        <Modal onClose={() => { setShowShiftModal(false); resetShiftForm(); }}>
          <form onSubmit={handleSaveShift} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingShift ? 'Edit Shift' : 'Create New Shift'}
            </h3>
            
            <FormInput
              label="Shift Name"
              type="text"
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              placeholder="e.g., Morning Shift, Night Shift"
              required
            />
            
            <FormInput
              label="Start Time"
              type="time"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
              required
            />
            
            <FormInput
              label="End Time"
              type="time"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
              required
            />
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingShift ? 'Update Shift' : 'Create Shift'}
              </button>
              <button
                type="button"
                onClick={() => { setShowShiftModal(false); resetShiftForm(); }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <Modal onClose={() => { setShowAssignModal(false); resetAssignForm(); }}>
          <form onSubmit={handleAssignShift} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Assign Shift to Employee</h3>
            
            <FormSelect
              label="Select Employee"
              value={assignForm.userId}
              onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
              options={[
                { value: '', label: 'Select Employee' },
                ...employees.map(emp => ({ value: emp.id, label: `${emp.name} - ${emp.position || 'No Position'}` }))
              ]}
              required
            />
            
            <FormSelect
              label="Select Shift"
              value={assignForm.shiftId}
              onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
              options={[
                { value: '', label: 'Select Shift' },
                ...shifts.map(shift => ({ value: shift.id, label: `${shift.name} (${shift.startTime} - ${shift.endTime})` }))
              ]}
              required
            />
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign Shift
              </button>
              <button
                type="button"
                onClick={() => { setShowAssignModal(false); resetAssignForm(); }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ShiftScheduleManagement;
