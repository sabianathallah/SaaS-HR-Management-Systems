import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { Users, Plus, Download, Pencil, Ban, CheckCircle2, Eye, EyeOff, Search } from 'lucide-react';
import FormInput from '../../../shared/components/FormInput';
import FormSelect from '../../../shared/components/FormSelect';
import Modal from '../../../shared/components/Modal';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fix 5: view employee state
  const [viewEmployee, setViewEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fix 4: pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'EMPLOYEE',
    position: '',
    department: '',
    joinDate: '',
    leaveDate: '',
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  // Fix 4 & 6: handle paginated response and both old/new response formats
  const fetchEmployees = async (page = 1) => {
    try {
      const response = await axiosInstance.get('/users/admin', {
        params: { page, limit },
      });

      const responseData = response.data;

      // Handle new paginated format: { success: true, data: { users: [...], pagination: {...} } }
      if (
        responseData &&
        responseData.data &&
        responseData.data.users &&
        Array.isArray(responseData.data.users)
      ) {
        setEmployees(responseData.data.users);
        if (responseData.data.pagination) {
          setTotalPages(responseData.data.pagination.totalPages || 1);
        }
      }
      // Handle old flat array format: { data: [...] }
      else if (responseData && Array.isArray(responseData.data)) {
        setEmployees(responseData.data);
        setTotalPages(1);
      }
      // Fallback
      else {
        setEmployees([]);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(emp => emp.isActive === isActive);
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      return;
    }

    // Check if email already exists in current employee list
    const emailExists = employees.some(emp =>
      emp.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (emailExists) {
      toast.error('Email already exists! Please use a different email address.');
      return;
    }

    try {
      // Don't send confirmPassword to API
      const { confirmPassword, leaveDate, ...dataToSend } = formData;
      await axiosInstance.post('/register', dataToSend);
      toast.success('Employee added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchEmployees(currentPage);
    } catch (error) {
      console.error('Error adding employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add employee';

      // Handle specific error messages
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('use')) {
        toast.error('Email already exists! Please use a different email address.');
      } else if (errorMessage.toLowerCase().includes('unique')) {
        toast.error('This email is already registered in the system. Please use a different email.');
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  // Fix 3: only include password in PUT request if admin typed a new one
  const handleEditEmployee = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Fix 3: validate password only if a new password was typed
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password harus minimal 6 karakter!');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Password dan konfirmasi password tidak cocok!');
        return;
      }
    }

    // Check if email already exists in other employees (exclude current employee)
    const emailExists = employees.some(emp =>
      emp.email.toLowerCase() === formData.email.toLowerCase() &&
      emp.id !== selectedEmployee.id
    );

    if (emailExists) {
      toast.error('Email already exists! Please use a different email address.');
      return;
    }

    try {
      // Build request body — exclude confirmPassword always
      // Fix 3: only include password if it was provided
      const { confirmPassword, password, leaveDate, ...baseData } = formData;

      const dataToSend = { ...baseData };

      if (password && password.trim() !== '') {
        dataToSend.password = password;
      }

      // Fix 2: include leaveDate if provided
      if (leaveDate && leaveDate.trim() !== '') {
        dataToSend.leaveDate = leaveDate;
      }

      await axiosInstance.put(`/users/admin/${selectedEmployee.id}`, dataToSend);
      toast.success('Employee updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchEmployees(currentPage);
    } catch (error) {
      console.error('Error updating employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update employee';

      // Handle specific error messages
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('use')) {
        toast.error('Email already exists! Please use a different email address.');
      } else if (errorMessage.toLowerCase().includes('unique')) {
        toast.error('This email is already registered by another employee.');
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  const handleToggleStatus = async (employeeId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this employee?`)) {
      return;
    }

    try {
      await axiosInstance.patch(`/users/admin/${employeeId}/status`, {
        isActive: !currentStatus,
      });
      toast.success('Employee status updated successfully!');
      fetchEmployees(currentPage);
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee status');
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      confirmPassword: '',
      phoneNumber: employee.phoneNumber || '',
      role: employee.role,
      position: employee.position || '',
      department: employee.department || '',
      joinDate: employee.joinDate?.split('T')[0] || '',
      leaveDate: employee.leaveDate?.split('T')[0] || '',
      isActive: employee.isActive,
    });
    setShowEditModal(true);
  };

  // Fix 5: view employee handler
  const handleViewEmployee = (employee) => {
    setViewEmployee(employee);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      role: 'EMPLOYEE',
      position: '',
      department: '',
      joinDate: '',
      leaveDate: '',
      isActive: true,
    });
    setSelectedEmployee(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Position', 'Department', 'Status', 'Join Date'],
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.position || '',
        emp.department || '',
        emp.isActive ? 'Active' : 'Inactive',
        emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('id-ID') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Fix 4: page change handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your organization's employees</p>
        </div>
        <button
          onClick={() => {
            console.log('Add Employee button clicked!');
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Employees</div>
          <div className="text-2xl font-bold text-blue-900">{employees.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Active</div>
          <div className="text-2xl font-bold text-green-900">
            {employees.filter(e => e.isActive).length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Inactive</div>
          <div className="text-2xl font-bold text-red-900">
            {employees.filter(e => !e.isActive).length}
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          {/* Fix 5: clickable name to open view modal */}
                          <div
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${employee.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${employee.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.joinDate
                        ? new Date(employee.joinDate).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Fix 5: View button */}
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800"
                        title="Lihat Detail"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => openEditModal(employee)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                        className={`inline-flex items-center gap-1 ${employee.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {employee.isActive
                          ? <><Ban size={14} /> Deactivate</>
                          : <><CheckCircle2 size={14} /> Activate</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fix 4: Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Employee"
        size="xl"
      >
        <form onSubmit={handleAddEmployee} className="space-y-6">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Row 2: Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Phone Number */}
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Phone Number"
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Row 4: Position & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />

            <FormInput
              label="Department"
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          {/* Row 5: Role & Join Date */}
          {/* Fix 1: removed duplicate EMPLOYEE option */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />

            <FormInput
              label="Join Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Employee
            </button>
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Employee"
        size="xl"
      >
        <form onSubmit={handleEditEmployee} className="space-y-6">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Row 2: Password & Confirm Password (Fix 3: optional, only sent if filled) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-gray-400 font-normal">(kosongkan jika tidak ingin mengubah)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Phone Number */}
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Phone Number"
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Row 4: Position & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />

            <FormInput
              label="Department"
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          {/* Row 5: Role & Join Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'EMPLOYEE', label: 'Employee' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />

            <FormInput
              label="Join Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>

          {/* Fix 2: Leave Date field */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Keluar <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="date"
                value={formData.leaveDate}
                onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.leaveDate && (
                <p className="mt-1 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Mengisi tanggal keluar akan menonaktifkan karyawan secara otomatis.
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Update Employee
            </button>
            <button
              type="button"
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Fix 5: Employee Detail View Modal (read-only) */}
      {viewEmployee && (
        <Modal
          isOpen={showViewModal}
          onClose={() => { setShowViewModal(false); setViewEmployee(null); }}
          title="Detail Karyawan"
          size="xl"
        >
          <div className="space-y-6">
            {/* Header: avatar + name + status badge */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {viewEmployee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewEmployee.name}</h3>
                <p className="text-sm text-gray-500">{viewEmployee.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full
                  ${viewEmployee.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {viewEmployee.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Personal Info */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Nomor Telepon</p>
                <p className="text-sm text-gray-800">{viewEmployee.phoneNumber || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Role</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full
                  ${viewEmployee.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {viewEmployee.role}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Jabatan</p>
                <p className="text-sm text-gray-800">{viewEmployee.position || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Departemen</p>
                <p className="text-sm text-gray-800">{viewEmployee.department || '-'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Tanggal Bergabung</p>
                <p className="text-sm text-gray-800">
                  {viewEmployee.joinDate
                    ? new Date(viewEmployee.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Tanggal Keluar</p>
                <p className="text-sm text-gray-800">
                  {viewEmployee.leaveDate
                    ? new Date(viewEmployee.leaveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>

              {/* Leave Quota */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Kuota Cuti Tahunan</p>
                <p className="text-sm text-gray-800">
                  {viewEmployee.annualLeaveQuota != null ? `${viewEmployee.annualLeaveQuota} hari` : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cuti Terpakai</p>
                <p className="text-sm text-gray-800">
                  {viewEmployee.usedLeaveQuota != null ? `${viewEmployee.usedLeaveQuota} hari` : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Sisa Cuti</p>
                <p className="text-sm text-gray-800">
                  {viewEmployee.annualLeaveQuota != null && viewEmployee.usedLeaveQuota != null
                    ? `${viewEmployee.annualLeaveQuota - viewEmployee.usedLeaveQuota} hari`
                    : '-'}
                </p>
              </div>

              {/* Salary */}
              {viewEmployee.baseSalary != null && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Gaji Pokok</p>
                  <p className="text-sm text-gray-800">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(viewEmployee.baseSalary)}
                  </p>
                </div>
              )}

              {/* Shift */}
              {viewEmployee.shiftName && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Shift</p>
                  <p className="text-sm text-gray-800">{viewEmployee.shiftName}</p>
                </div>
              )}
            </div>

            {/* Bank Info */}
            {(viewEmployee.bankName || viewEmployee.bankAccountNumber || viewEmployee.bankAccountHolder) && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Informasi Bank</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Nama Bank</p>
                    <p className="text-sm text-gray-800">{viewEmployee.bankName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Nomor Rekening</p>
                    <p className="text-sm text-gray-800">{viewEmployee.bankAccountNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Atas Nama</p>
                    <p className="text-sm text-gray-800">{viewEmployee.bankAccountHolder || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setViewEmployee(null);
                  openEditModal(viewEmployee);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Pencil size={16} /> Edit Karyawan
              </button>
              <button
                type="button"
                onClick={() => { setShowViewModal(false); setViewEmployee(null); }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeManagement;
