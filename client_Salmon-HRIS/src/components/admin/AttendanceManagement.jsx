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
  const [workTypeFilter, setWorkTypeFilter] = useState('all'); // New filter
  
  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
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
  }, [attendances, dateFrom, dateTo, selectedEmployee, statusFilter, workTypeFilter]);

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

    // Filter by work type (WFH vs Office)
    if (workTypeFilter === 'wfh') {
      filtered = filtered.filter(att => 
        att.locationValidationStatus === 'not_checked' && 
        (att.status === 'ON_TIME' || att.status === 'LATE' || att.status === 'ON_PROGRESS')
      );
    } else if (workTypeFilter === 'office') {
      filtered = filtered.filter(att => 
        att.locationValidationStatus === 'valid' || 
        att.locationValidationStatus === 'outside_radius'
      );
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

  const getLocationStatusDisplay = (attendance) => {
    // Check if this is WFH/Remote (flexible shift with no GPS check)
    if (attendance.locationValidationStatus === 'not_checked' && 
        (attendance.status === 'ON_TIME' || attendance.status === 'LATE' || attendance.status === 'ON_PROGRESS')) {
      return {
        icon: '🏠',
        text: 'WFH/Remote',
        class: 'text-purple-600 font-medium',
        badge: 'bg-purple-100 text-purple-800'
      };
    }

    // Regular location validation statuses
    switch (attendance.locationValidationStatus) {
      case 'valid':
        return {
          icon: '✅',
          text: 'Valid',
          class: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
      case 'outside_radius':
        return {
          icon: '⚠️',
          text: 'Outside Radius',
          class: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'gps_error':
        return {
          icon: '❌',
          text: 'GPS Error',
          class: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          icon: '⚠️',
          text: 'Not Checked',
          class: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const openLocationModal = (attendance) => {
    setSelectedAttendance(attendance);
    setShowLocationModal(true);
  };

  const openPhotoModal = (attendance) => {
    console.log('📸 Opening photo modal for:', attendance);
    console.log('📸 Photo path:', attendance.photoCheckIn);
    
    // Clean up path to prevent double slashes
    const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const photoPath = attendance.photoCheckIn?.replace(/^\//, '') || ''; // Remove leading slash
    const fullUrl = `${baseUrl}/${photoPath}`;
    
    console.log('📸 Base URL:', baseUrl);
    console.log('📸 Photo Path:', photoPath);
    console.log('📸 Full photo URL:', fullUrl);
    
    setSelectedAttendance(attendance);
    setShowPhotoModal(true);
  };

  const formatDistance = (meters) => {
    if (!meters) return 'N/A';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const getGoogleMapsLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = photoPath.replace(/^\//, ''); // Remove leading slash
    return `${baseUrl}/${cleanPath}`;
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              { value: 'ON_PROGRESS', label: 'On Progress' },
              { value: 'ON_TIME', label: 'On Time' },
              { value: 'LATE', label: 'Late' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'LEAVE', label: 'Leave' },
              { value: 'SICK_LEAVE', label: 'Sick Leave' },
              { value: 'PERMISSION', label: 'Permission' },
              { value: 'HOLIDAY', label: 'Holiday' },
            ]}
          />
          <FormSelect
            label="Work Type"
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'wfh', label: '🏠 WFH/Remote' },
              { value: 'office', label: '🏢 Office' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export</label>
            <button
              onClick={handleExportExcel}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📥 Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600">🏠 WFH</div>
          <div className="text-2xl font-bold text-purple-900">
            {filteredAttendances.filter(a => 
              a.locationValidationStatus === 'not_checked' && 
              (a.status === 'ON_TIME' || a.status === 'LATE' || a.status === 'ON_PROGRESS')
            ).length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">🏢 Office</div>
          <div className="text-2xl font-bold text-blue-900">
            {filteredAttendances.filter(a => 
              a.locationValidationStatus === 'valid' || 
              a.locationValidationStatus === 'outside_radius'
            ).length}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => {
                  const locationStatus = getLocationStatusDisplay(attendance);
                  return (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attendance.clockIn 
                            ? new Date(attendance.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </div>
                        {attendance.clockInLatitude && attendance.clockInLongitude && (
                          <button
                            onClick={() => openLocationModal(attendance)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            📍 View Location
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attendance.clockOut 
                            ? new Date(attendance.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </div>
                        {attendance.clockOutLatitude && attendance.clockOutLongitude && (
                          <button
                            onClick={() => openLocationModal(attendance)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            📍 View Location
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${locationStatus.badge}`}>
                          {locationStatus.icon} {locationStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const office = attendance.office_location || attendance.OfficeLocation || attendance.officeLocation;
                          return office?.name || 'N/A';
                        })()}
                        {(() => {
                          const office = attendance.office_location || attendance.OfficeLocation || attendance.officeLocation;
                          return office && (
                            <div className="text-xs text-gray-400">
                              {office.address}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {attendance.distanceFromOffice ? (
                          <span className={`font-medium ${
                            attendance.distanceFromOffice <= 100 ? 'text-green-600' :
                            attendance.distanceFromOffice <= 500 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {formatDistance(attendance.distanceFromOffice)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(attendance)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {attendance.photoCheckIn && (
                            <button
                              onClick={() => openPhotoModal(attendance)}
                              className="text-green-600 hover:text-green-900"
                              title="View Photo"
                            >
                              📸
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      
      {/* Location Modal */}
      <Modal 
        isOpen={showLocationModal}
        onClose={() => { setShowLocationModal(false); setSelectedAttendance(null); }}
        title="📍 Location Details"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {selectedAttendance.User?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(selectedAttendance.date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Clock In Location */}
            {selectedAttendance.clockInLatitude && selectedAttendance.clockInLongitude && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">🕐</span> Clock In Location
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedAttendance.clockIn).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <span className="ml-2 font-medium">
                        {formatDistance(selectedAttendance.distanceFromOffice)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="ml-2 font-mono text-xs">
                      {selectedAttendance.clockInLatitude}, {selectedAttendance.clockInLongitude}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Office:</span>
                    <span className="ml-2 font-medium">
                      {(() => {
                        const office = selectedAttendance.office_location || selectedAttendance.OfficeLocation || selectedAttendance.officeLocation;
                        return office?.name || 'N/A';
                      })()}
                    </span>
                  </div>
                  <a
                    href={getGoogleMapsLink(selectedAttendance.clockInLatitude, selectedAttendance.clockInLongitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm mt-2"
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Clock Out Location */}
            {selectedAttendance.clockOutLatitude && selectedAttendance.clockOutLongitude && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-600">🕐</span> Clock Out Location
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedAttendance.clockOut).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <span className="ml-2 font-medium">
                        {formatDistance(selectedAttendance.clockOutDistanceFromOffice)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="ml-2 font-mono text-xs">
                      {selectedAttendance.clockOutLatitude}, {selectedAttendance.clockOutLongitude}
                    </span>
                  </div>
                  <a
                    href={getGoogleMapsLink(selectedAttendance.clockOutLatitude, selectedAttendance.clockOutLongitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm mt-2"
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Validation Status */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Validation Status</h4>
              <div className="flex items-center gap-2">
                {(() => {
                  const status = getLocationStatusDisplay(selectedAttendance);
                  return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.badge}`}>
                      {status.icon} {status.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Photo Modal */}
      <Modal 
        isOpen={showPhotoModal}
        onClose={() => { setShowPhotoModal(false); setSelectedAttendance(null); }}
        title="📸 Attendance Photo"
        size="lg"
      >
        {selectedAttendance && (
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {selectedAttendance.User?.name}
              </h3>
              <p className="text-sm text-gray-600">
                Clock In: {new Date(selectedAttendance.clockIn).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Photo */}
            {selectedAttendance.photoCheckIn ? (
              <div className="space-y-2">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={getPhotoUrl(selectedAttendance.photoCheckIn)}
                    alt="Check-in selfie"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                    onError={(e) => {
                      console.error('Photo load error:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPhoto not available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                {/* Debug Info */}
                <details className="text-xs bg-gray-100 p-2 rounded">
                  <summary className="cursor-pointer text-gray-600">🔍 Debug Info</summary>
                  <div className="mt-2 space-y-1 font-mono text-gray-700">
                    <div><strong>Photo Path (from backend):</strong> {selectedAttendance.photoCheckIn}</div>
                    <div><strong>Full URL (constructed):</strong> {getPhotoUrl(selectedAttendance.photoCheckIn)}</div>
                    <div><strong>Base URL:</strong> {import.meta.env.VITE_BASE_URL}</div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center text-gray-500">
                <div className="text-4xl mb-2">📷</div>
                <p>No photo available</p>
                <p className="text-xs mt-2 text-gray-400">photoCheckIn field is null or empty</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
