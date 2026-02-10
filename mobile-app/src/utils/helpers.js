export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ON_TIME':
      return { bg: '#dcfce7', text: '#166534' };
    case 'LATE':
      return { bg: '#fee2e2', text: '#991b1b' };
    case 'ABSENT':
      return { bg: '#e5e7eb', text: '#1f2937' };
    case 'APPROVED':
      return { bg: '#dcfce7', text: '#166534' };
    case 'REJECTED':
      return { bg: '#fee2e2', text: '#991b1b' };
    case 'PENDING':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'CANCELLED':
      return { bg: '#e5e7eb', text: '#1f2937' };
    default:
      return { bg: '#f3f4f6', text: '#374151' };
  }
};

export const getLeaveTypeLabel = (type) => {
  switch (type) {
    case 'ANNUAL_LEAVE':
      return '🏖️ Cuti Tahunan';
    case 'SICK_LEAVE':
      return '🤒 Sakit';
    case 'PERMISSION':
      return '📝 Izin';
    default:
      return type;
  }
};

export const getLeaveTypeIcon = (type) => {
  switch (type) {
    case 'ANNUAL_LEAVE':
      return '🏖️';
    case 'SICK_LEAVE':
      return '🤒';
    case 'PERMISSION':
      return '📝';
    default:
      return '📄';
  }
};

export const getStatusLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return '✓ Disetujui';
    case 'REJECTED':
      return '✗ Ditolak';
    case 'PENDING':
      return '⏳ Menunggu';
    case 'CANCELLED':
      return '⊘ Dibatalkan';
    default:
      return status;
  }
};

// Payroll/Payslip helpers
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPayslipStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { bg: '#dcfce7', text: '#166534' };
    case 'PENDING':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'PROCESSING':
      return { bg: '#dbeafe', text: '#1e40af' };
    case 'CANCELLED':
      return { bg: '#fee2e2', text: '#991b1b' };
    default:
      return { bg: '#f3f4f6', text: '#374151' };
  }
};

export const getPayslipStatusLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return '✓ Dibayar';
    case 'PENDING':
      return '⏳ Pending';
    case 'PROCESSING':
      return '⚙️ Diproses';
    case 'CANCELLED':
      return '✗ Dibatalkan';
    default:
      return status;
  }
};
