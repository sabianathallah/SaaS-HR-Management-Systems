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
