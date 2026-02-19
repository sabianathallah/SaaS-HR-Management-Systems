import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import toast from 'react-hot-toast';
import { CalendarDays, Users, Plus, User, Pencil, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/components/FormInput';
import FormSelect from '../../../shared/components/FormSelect';
import Modal from '../../../shared/components/Modal';

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
    breakDuration: 60,
    lateTolerance: 15,
    overtimeThreshold: 15,
    isFlexible: false,
    description: '',
    isActive: true,
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
      const [shiftsRes, employeesRes] = await Promise.all([
        axiosInstance.get('/shifts/admin/shifts'),
        axiosInstance.get('/users/admin'),
      ]);

      console.log('Shifts Response:', shiftsRes.data);
      console.log('Employees Response:', employeesRes.data);

      const shiftsData = shiftsRes.data.data || [];
      const employeesData = employeesRes.data.data || [];

      // Debug: Check ShiftId format
      console.log('First employee ShiftId:', employeesData[0]?.ShiftId, typeof employeesData[0]?.ShiftId);
      console.log('First shift id:', shiftsData[0]?.id, typeof shiftsData[0]?.id);

      setShifts(shiftsData);
      setEmployees(employeesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch data');
      alert('Failed to fetch data: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await axiosInstance.put(`/shifts/admin/shifts/${editingShift.id}`, shiftForm);
        alert('Shift updated successfully!');
      } else {
        await axiosInstance.post('/shifts/admin/shifts', shiftForm);
        alert('Shift created successfully!');
      }
      
      setShowShiftModal(false);
      resetShiftForm();
      await fetchData();
    } catch (error) {
      console.error('Error saving shift:', error);
      toast.error(error.response?.data?.message || 'Failed to save shift');
      alert(error.response?.data?.message || 'Failed to save shift');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      await axiosInstance.delete(`/shifts/admin/shifts/${shiftId}`);
      alert('Shift deleted successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error(error.response?.data?.message || 'Failed to delete shift');
      alert(error.response?.data?.message || 'Failed to delete shift');
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/shifts/admin/users/${assignForm.userId}/shift`,
        { shiftId: parseInt(assignForm.shiftId) }
      );
      console.log('Assign response:', response.data);
      alert('Shift assigned successfully!');
      setShowAssignModal(false);
      resetAssignForm();
      await fetchData(); // Ensure data is refreshed
    } catch (error) {
      console.error('Error assigning shift:', error);
      toast.error(error.response?.data?.message || 'Failed to assign shift');
      alert(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleRemoveShift = async (userId) => {
    if (!confirm('Are you sure you want to remove shift from this employee?')) return;

    try {
      const response = await axiosInstance.delete(`/shifts/admin/users/${userId}/shift`);
      console.log('Remove response:', response.data);
      alert('Shift removed successfully!');
      await fetchData(); // Ensure data is refreshed
    } catch (error) {
      console.error('Error removing shift:', error);
      toast.error(error.response?.data?.message || 'Failed to remove shift');
      alert(error.response?.data?.message || 'Failed to remove shift');
    }
  };

  const openEditShiftModal = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration || 60,
      lateTolerance: shift.lateTolerance || 15,
      overtimeThreshold: shift.overtimeThreshold || 15,
      isFlexible: shift.isFlexible || false,
      description: shift.description || '',
      isActive: shift.isActive !== undefined ? shift.isActive : true,
    });
    setShowShiftModal(true);
  };

  const resetShiftForm = () => {
    setShiftForm({ 
      name: '', 
      startTime: '', 
      endTime: '', 
      breakDuration: 60,
      lateTolerance: 15,
      overtimeThreshold: 15,
      isFlexible: false,
      description: '',
      isActive: true,
    });
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
            <Plus size={14} className="inline mr-1" /> Create Shift
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <User size={14} className="inline mr-1" /> Assign Shift
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
            <CalendarDays size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No shifts configured</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shifts.map((shift) => {
              const assignedEmployeesCount = employees.filter(e => parseInt(e.ShiftId) === parseInt(shift.id)).length;
              return (
                <div key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-gray-900">{shift.name}</h4>
                        {shift.isActive === false && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Working Hours: <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
                        </p>
                        {shift.breakDuration && (
                          <p className="text-sm text-gray-600">
                            Break Duration: <span className="font-medium">{shift.breakDuration} minutes</span>
                          </p>
                        )}
                        {shift.lateTolerance && (
                          <p className="text-sm text-gray-600">
                            Late Tolerance: <span className="font-medium">{shift.lateTolerance} minutes</span>
                          </p>
                        )}
                        {shift.description && (
                          <p className="text-sm text-gray-600">
                            {shift.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className={`text-sm font-medium ${assignedEmployeesCount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {assignedEmployeesCount} {assignedEmployeesCount === 1 ? 'employee' : 'employees'} assigned
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openEditShiftModal(shift)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit Shift"
                      >
                        <Pencil size={14} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete Shift"
                      >
                        <Trash2 size={14} className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Employee Shift Assignments */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">Employee Shift Assignments</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage shift assignments for all employees</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users size={40} className="mx-auto mb-2 text-gray-300" />
                    <p>No employees found</p>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => {
                  const assignedShift = shifts.find(s => parseInt(s.id) === parseInt(employee.ShiftId));
                  
                  // Debug log
                  if (employee.ShiftId) {
                    console.log(`Employee ${employee.name}: ShiftId=${employee.ShiftId} (${typeof employee.ShiftId}), Found shift:`, assignedShift?.name);
                  }
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.position || '-'}</div>
                        <div className="text-xs text-gray-500">{employee.department || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedShift ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {assignedShift.name}
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                            No Shift
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignedShift ? (
                            <>
                              <div className="font-medium">{assignedShift.startTime} - {assignedShift.endTime}</div>
                              {assignedShift.breakDuration && (
                                <div className="text-xs text-gray-500">Break: {assignedShift.breakDuration} min</div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {assignedShift ? (
                            <>
                              <button
                                onClick={() => {
                                  setAssignForm({ 
                                    userId: String(employee.id), 
                                    shiftId: String(employee.ShiftId) 
                                  });
                                  setShowAssignModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Change Shift"
                              >
                                <Pencil size={14} className="inline mr-1" /> Change
                              </button>
                              <button
                                onClick={() => handleRemoveShift(employee.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Remove Shift"
                              >
                                <Trash2 size={14} className="inline mr-1" /> Remove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setAssignForm({ userId: String(employee.id), shiftId: '' });
                                setShowAssignModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Assign Shift"
                            >
                              <Plus size={14} className="inline mr-1" /> Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Shift Modal */}
      <Modal 
        isOpen={showShiftModal}
        onClose={() => { setShowShiftModal(false); resetShiftForm(); }}
        title={editingShift ? 'Edit Shift' : 'Create New Shift'}
        size="lg"
      >
        <form onSubmit={handleSaveShift} className="space-y-4">
          <FormInput
            label="Shift Name *"
            type="text"
            value={shiftForm.name}
            onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
            placeholder="e.g., Morning Shift, Night Shift"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Time *"
              type="time"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
              required
            />
            
            <FormInput
              label="End Time *"
              type="time"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Break Duration (min)"
              type="number"
              value={shiftForm.breakDuration}
              onChange={(e) => setShiftForm({ ...shiftForm, breakDuration: parseInt(e.target.value) || 0 })}
              placeholder="60"
              min="0"
            />

            <FormInput
              label="Late Tolerance (min)"
              type="number"
              value={shiftForm.lateTolerance}
              onChange={(e) => setShiftForm({ ...shiftForm, lateTolerance: parseInt(e.target.value) || 0 })}
              placeholder="15"
              min="0"
            />

            <FormInput
              label="OT Threshold (min)"
              type="number"
              value={shiftForm.overtimeThreshold}
              onChange={(e) => setShiftForm({ ...shiftForm, overtimeThreshold: parseInt(e.target.value) || 0 })}
              placeholder="15"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={shiftForm.description}
              onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
              placeholder="Optional shift description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shiftForm.isFlexible}
                onChange={(e) => setShiftForm({ ...shiftForm, isFlexible: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Flexible Shift</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shiftForm.isActive}
                onChange={(e) => setShiftForm({ ...shiftForm, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingShift ? 'Update Shift' : 'Create Shift'}
            </button>
            <button
              type="button"
              onClick={() => { setShowShiftModal(false); resetShiftForm(); }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Shift Modal */}
      <Modal 
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); resetAssignForm(); }}
        title={assignForm.userId && employees.find(e => e.id === parseInt(assignForm.userId)) 
          ? 'Change Employee Shift' 
          : 'Assign Shift to Employee'}
        size="md"
      >
        <form onSubmit={handleAssignShift} className="space-y-4">
          <FormSelect
            label="Select Employee *"
            value={assignForm.userId}
            onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
            options={[
              { value: '', label: '-- Select Employee --' },
              ...employees.map(emp => ({ 
                value: emp.id, 
                label: `${emp.name} ${emp.position ? `- ${emp.position}` : ''} ${emp.ShiftId ? '(Has Shift)' : '(No Shift)'}` 
              }))
            ]}
            required
          />
          
          <FormSelect
            label="Select Shift *"
            value={assignForm.shiftId}
            onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
            options={[
              { value: '', label: '-- Select Shift --' },
              ...shifts
                .filter(shift => shift.isActive !== false)
                .map(shift => ({ 
                  value: shift.id, 
                  label: `${shift.name} (${shift.startTime} - ${shift.endTime})` 
                }))
            ]}
            required
          />

          {assignForm.shiftId && (() => {
            const selectedShift = shifts.find(s => s.id === parseInt(assignForm.shiftId));
            return selectedShift ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Shift Details:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Hours: {selectedShift.startTime} - {selectedShift.endTime}</p>
                  {selectedShift.breakDuration && <p>Break: {selectedShift.breakDuration} min</p>}
                  {selectedShift.lateTolerance && <p>Late Tolerance: {selectedShift.lateTolerance} min</p>}
                  {selectedShift.description && <p>{selectedShift.description}</p>}
                </div>
              </div>
            ) : null;
          })()}
          
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Assign Shift
            </button>
            <button
              type="button"
              onClick={() => { setShowAssignModal(false); resetAssignForm(); }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftScheduleManagement;
