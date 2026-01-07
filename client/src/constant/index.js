// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Leave Types
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  EMERGENCY: 'emergency',
};

export const LEAVE_TYPE_LABELS = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  emergency: 'Emergency Leave',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
};

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half Day',
};

export const ATTENDANCE_STATUS_COLORS = {
  present: 'bg-green-100 text-green-800',
  late: 'bg-yellow-100 text-yellow-800',
  absent: 'bg-red-100 text-red-800',
  half_day: 'bg-blue-100 text-blue-800',
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const REQUEST_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const REQUEST_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

export const USER_ROLE_LABELS = {
  admin: 'Admin',
  employee: 'Employee',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 20, 50, 100],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  AUTH_STORAGE: 'auth-storage',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  CHECKIN: 'Check-in successful!',
  CHECKOUT: 'Check-out successful!',
  LEAVE_REQUEST_CREATED: 'Leave request submitted successfully!',
  LEAVE_REQUEST_CANCELLED: 'Leave request cancelled successfully!',
  OVERTIME_REQUEST_CREATED: 'Overtime request submitted successfully!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
  REQUEST_APPROVED: 'Request approved successfully!',
  REQUEST_REJECTED: 'Request rejected successfully!',
};
