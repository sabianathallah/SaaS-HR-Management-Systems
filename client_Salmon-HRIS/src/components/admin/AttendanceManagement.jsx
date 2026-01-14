import { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import SearchableSelect from '../SearchableSelect';
import Modal from '../Modal';

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [officeLocations, setOfficeLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    clockInTime: '',
    clockOutTime: '',
    status: 'ON_TIME',
    locationValidationStatus: 'not_checked',
    officeLocationId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterAttendances();
  }, [attendances, dateFrom, dateTo, selectedEmployee, statusFilter]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [attendanceRes, employeeRes, officeLocationsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/attendances/admin/all-attendance`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/users/admin`, config),
        axios.get(`${import.meta.env.VITE_BASE_URL}/office-locations/admin`, config),
      ]);

      setAttendances(attendanceRes.data.data || []);
      setEmployees(employeeRes.data.data || []);
      
      // Transform office locations data
      const transformedLocations = (officeLocationsRes.data.data || []).map(loc => ({
        ...loc,
        isActive: loc.is_active !== undefined ? loc.is_active : loc.isActive
      }));
      setOfficeLocations(transformedLocations.filter(loc => loc.isActive));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterAttendances = () => {
    let filtered = attendances;

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(att => new Date(att.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(att => new Date(att.date) <= new Date(dateTo));
    }

    // Filter by employee
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(att => att.UserId === parseInt(selectedEmployee));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(att => att.status === statusFilter);
    }

    setFilteredAttendances(filtered);
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare payload based on status
      const payload = {
        userId: formData.userId,
        date: formData.date,
        status: formData.status,
        locationValidationStatus: formData.locationValidationStatus,
      };

      // Only add clockIn/clockOut for ON_TIME or LATE status
      if (formData.status === 'ON_TIME' || formData.status === 'LATE') {
        if (formData.clockInTime) {
          payload.clockIn = `${formData.date}T${formData.clockInTime}:00`;
        }
        if (formData.clockOutTime) {
          payload.clockOut = `${formData.date}T${formData.clockOutTime}:00`;
        }
      }

      // Add office location if validation is valid
      if (formData.locationValidationStatus === 'valid' && formData.officeLocationId) {
        payload.office_location_id = formData.officeLocationId;
      }

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/attendances/admin/manual-attendance`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Manual attendance created successfully!');
      setShowManualModal(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error('Error creating manual attendance:', error);
      alert(error.response?.data?.message || 'Failed to create manual attendance');
    }
  };

  const handleEditAttendance = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare payload based on status
      const payload = {
        userId: formData.userId,
        date: formData.date,
        status: formData.status,
        locationValidationStatus: formData.locationValidationStatus,
      };

      // Only add clockIn/clockOut for ON_TIME or LATE status
      if (formData.status === 'ON_TIME' || formData.status === 'LATE') {
        if (formData.clockInTime) {
          payload.clockIn = `${formData.date}T${formData.clockInTime}:00`;
        }
        if (formData.clockOutTime) {
          payload.clockOut = `${formData.date}T${formData.clockOutTime}:00`;
        }
      }

      // Add office location if validation is valid
      if (formData.locationValidationStatus === 'valid' && formData.officeLocationId) {
        payload.office_location_id = formData.officeLocationId;
      }

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/attendances/admin/manual-attendance/${editingAttendance.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Attendance updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  const openEditModal = (attendance) => {
    setEditingAttendance(attendance);
    
    // Extract time from datetime
    const getTimeFromDateTime = (datetime) => {
      if (!datetime) return '';
      const date = new Date(datetime);
      return date.toTimeString().slice(0, 5); // HH:mm format
    };

    setFormData({
      userId: attendance.UserId,
      date: attendance.date.split('T')[0],
      clockInTime: getTimeFromDateTime(attendance.clockIn),
      clockOutTime: getTimeFromDateTime(attendance.clockOut),
      status: attendance.status,
      locationValidationStatus: attendance.locationValidationStatus || 'not_checked',
      officeLocationId: attendance.office_location_id || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      date: '',
      clockInTime: '',
      clockOutTime: '',
      status: 'ON_TIME',
      locationValidationStatus: 'not_checked',
      officeLocationId: '',
    });
    setEditingAttendance(null);
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (dateFrom) params.append('startDate', dateFrom);
      if (dateTo) params.append('endDate', dateTo);
      if (selectedEmployee !== 'all') params.append('userId', selectedEmployee);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/reports/export/excel?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ON_PROGRESS': return 'bg-indigo-100 text-indigo-800';
      case 'ON_TIME': return 'bg-green-100 text-green-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LEAVE': return 'bg-blue-100 text-blue-800';
      case 'SICK_LEAVE': return 'bg-orange-100 text-orange-800';
      case 'PERMISSION': return 'bg-cyan-100 text-cyan-800';
      case 'HOLIDAY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Manual Attendance</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FormInput
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <FormInput
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <SearchableSelect
            label="Employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={[
              { value: 'all', label: 'All Employees' },
              ...employees.map(emp => ({ 
                value: emp.id, 
                label: emp.name,
                description: `${emp.position || 'No position'} - ${emp.email}`
              }))
            ]}
            placeholder="Search employee..."
          />
          <FormSelect
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'ON_PROGRESS', label: 'On Progress (Clock In Only)' },
              { value: 'ON_TIME', label: 'On Time' },
              { value: 'LATE', label: 'Late' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'LEAVE', label: 'Leave (Annual)' },
              { value: 'SICK_LEAVE', label: 'Sick Leave' },
              { value: 'PERMISSION', label: 'Permission' },
              { value: 'HOLIDAY', label: 'Holiday' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export</label>
            <button
              onClick={handleExportExcel}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📥 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Records</div>
          <div className="text-2xl font-bold text-gray-900">{filteredAttendances.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">On Time</div>
          <div className="text-2xl font-bold text-green-900">
            {filteredAttendances.filter(a => a.status === 'ON_TIME').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Late</div>
          <div className="text-2xl font-bold text-yellow-900">
            {filteredAttendances.filter(a => a.status === 'LATE').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Absent</div>
          <div className="text-2xl font-bold text-red-900">
            {filteredAttendances.filter(a => a.status === 'ABSENT').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">On Leave</div>
          <div className="text-2xl font-bold text-blue-900">
            {filteredAttendances.filter(a => a.status === 'LEAVE').length}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredAttendances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attendance.User?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attendance.User?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.clockIn 
                        ? new Date(attendance.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.clockOut 
                        ? new Date(attendance.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(attendance.status)}`}>
                        {attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.locationValidationStatus === 'valid' ? '✅ Valid' : 
                       attendance.locationValidationStatus === 'outside_radius' ? '❌ Outside Radius' : 
                       attendance.locationValidationStatus === 'gps_error' ? '⚠️ GPS Error' : 
                       '⚠️ Not Checked'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(attendance)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Attendance Modal */}
      <Modal 
        isOpen={showManualModal}
        onClose={() => { setShowManualModal(false); resetForm(); }}
        title="Create Manual Attendance"
        size="lg"
      >
        <form onSubmit={handleManualAttendance} className="space-y-4">
            
            <SearchableSelect
              label="Employee"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              options={[
                { value: '', label: 'Select Employee' },
                ...employees.map(emp => ({ 
                  value: emp.id, 
                  label: emp.name,
                  description: emp.email // Menampilkan email sebagai info tambahan
                }))
              ]}
              placeholder="Search employee by name..."
              required
            />
            
            <FormInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ON_PROGRESS', label: 'On Progress' },
                { value: 'ON_TIME', label: 'On Time' },
                { value: 'LATE', label: 'Late' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'LEAVE', label: 'Leave (Annual)' },
                { value: 'SICK_LEAVE', label: 'Sick Leave' },
                { value: 'PERMISSION', label: 'Permission' },
                { value: 'HOLIDAY', label: 'Holiday' },
              ]}
            />

            {/* Clock In/Out fields - only show for ON_TIME or LATE */}
            {(formData.status === 'ON_TIME' || formData.status === 'LATE') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Clock In Time"
                    type="time"
                    value={formData.clockInTime}
                    onChange={(e) => setFormData({ ...formData, clockInTime: e.target.value })}
                    required
                  />
                  
                  <FormInput
                    label="Clock Out Time"
                    type="time"
                    value={formData.clockOutTime}
                    onChange={(e) => setFormData({ ...formData, clockOutTime: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  ℹ️ Times will be combined with the selected date above
                </p>
              </>
            )}
            
            <FormSelect
              label="Location Validation"
              value={formData.locationValidationStatus}
              onChange={(e) => setFormData({ ...formData, locationValidationStatus: e.target.value })}
              options={[
                { value: 'not_checked', label: '⚠️ Not Checked' },
                { value: 'valid', label: '✅ Valid (In Radius)' },
                { value: 'outside_radius', label: '❌ Outside Radius' },
                { value: 'gps_error', label: '⚠️ GPS Error' },
              ]}
            />

            {/* Office Location - only show when location validation is 'valid' */}
            {formData.locationValidationStatus === 'valid' && (
              <FormSelect
                label="Office Location"
                value={formData.officeLocationId}
                onChange={(e) => setFormData({ ...formData, officeLocationId: e.target.value })}
                options={[
                  { value: '', label: 'Select Office Location' },
                  ...officeLocations.map(loc => ({ 
                    value: loc.id, 
                    label: `${loc.name} - ${loc.address}` 
                  }))
                ]}
                required
              />
            )}
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Attendance
              </button>
              <button
                type="button"
                onClick={() => { setShowManualModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

      {/* Edit Attendance Modal */}
      <Modal 
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Attendance"
        size="lg"
      >
        <form onSubmit={handleEditAttendance} className="space-y-4">
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Employee:</strong> {editingAttendance?.User?.name}
              </p>
            </div>
            
            <FormInput
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ON_PROGRESS', label: 'On Progress' },
                { value: 'ON_TIME', label: 'On Time' },
                { value: 'LATE', label: 'Late' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'LEAVE', label: 'Leave (Annual)' },
                { value: 'SICK_LEAVE', label: 'Sick Leave' },
                { value: 'PERMISSION', label: 'Permission' },
                { value: 'HOLIDAY', label: 'Holiday' },
              ]}
            />

            {/* Clock In/Out fields - only show for ON_TIME or LATE */}
            {(formData.status === 'ON_TIME' || formData.status === 'LATE') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Clock In Time"
                    type="time"
                    value={formData.clockInTime}
                    onChange={(e) => setFormData({ ...formData, clockInTime: e.target.value })}
                  />
                  
                  <FormInput
                    label="Clock Out Time"
                    type="time"
                    value={formData.clockOutTime}
                    onChange={(e) => setFormData({ ...formData, clockOutTime: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  ℹ️ Times will be combined with the selected date above
                </p>
              </>
            )}
            
            <FormSelect
              label="Location Validation"
              value={formData.locationValidationStatus}
              onChange={(e) => setFormData({ ...formData, locationValidationStatus: e.target.value })}
              options={[
                { value: 'not_checked', label: '⚠️ Not Checked' },
                { value: 'valid', label: '✅ Valid (In Radius)' },
                { value: 'outside_radius', label: '❌ Outside Radius' },
                { value: 'gps_error', label: '⚠️ GPS Error' },
              ]}
            />

            {/* Office Location - only show when location validation is 'valid' */}
            {formData.locationValidationStatus === 'valid' && (
              <FormSelect
                label="Office Location"
                value={formData.officeLocationId}
                onChange={(e) => setFormData({ ...formData, officeLocationId: e.target.value })}
                options={[
                  { value: '', label: 'Select Office Location' },
                  ...officeLocations.map(loc => ({ 
                    value: loc.id, 
                    label: `${loc.name} - ${loc.address}` 
                  }))
                ]}
              />
            )}
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Attendance
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); resetForm(); }}
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

export default AttendanceManagement;
