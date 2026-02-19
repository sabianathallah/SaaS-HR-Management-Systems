import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { Settings, Calendar, Eye, CheckCircle2, XCircle, Paperclip, Download } from 'lucide-react';
import FormInput from '../../../shared/components/FormInput';
import FormSelect from '../../../shared/components/FormSelect';
import FormTextarea from '../../../shared/components/FormTextarea';
import Modal from '../../../shared/components/Modal';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustQuotaModal, setShowAdjustQuotaModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEmployeeBalance, setSelectedEmployeeBalance] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, requestId: null });
  const [rejectNote, setRejectNote] = useState('');
  const [quotaAdjustment, setQuotaAdjustment] = useState({
    userId: '',
    annualLeaveQuota: '',
    usedLeaveQuota: '',
  });

  useEffect(() => {
    fetchLeaveRequests(currentPage);
  }, [currentPage, statusFilter, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeeRes = await axiosInstance.get('/users/admin');
      setEmployees(employeeRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data karyawan');
    }
  };

  const fetchLeaveRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const response = await axiosInstance.get(`/leave-requests/admin/all?${params.toString()}`);

      // FIX 4: Handle both old format (array) and new responseHelper format
      const responseData = response.data.data;
      if (responseData && responseData.requests) {
        // New format: { success, data: { requests: [...], pagination: { ... } } }
        setLeaveRequests(responseData.requests);
        const pagination = responseData.pagination || response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
        }
      } else {
        // Old format: { data: [...] }
        setLeaveRequests(responseData || []);
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
        }
      }

      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data permohonan cuti');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      if (!confirm('Apakah Anda yakin ingin menyetujui permohonan cuti ini?')) return;

      await axiosInstance.put(
        `/leave-requests/admin/${requestId}/approve`,
        { approvalNote }
      );

      toast.success('Permohonan cuti berhasil disetujui');
      setShowDetailModal(false);
      setApprovalNote('');
      await fetchLeaveRequests(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui permohonan cuti');
    }
  };

  // FIX 1: handleReject now opens the reject modal instead of using prompt()
  const handleReject = (requestId) => {
    setRejectModal({ open: true, requestId });
    setRejectNote('');
  };

  // FIX 1: confirmReject performs the actual API call
  const confirmReject = async () => {
    try {
      await axiosInstance.put(
        `/leave-requests/admin/${rejectModal.requestId}/reject`,
        { approvalNote: rejectNote }
      );

      toast.success('Permohonan cuti berhasil ditolak');
      setRejectModal({ open: false, requestId: null });
      setRejectNote('');
      setShowDetailModal(false);
      setSelectedRequest(null);
      setApprovalNote('');
      await fetchLeaveRequests(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menolak permohonan cuti');
    }
  };

  // FIX 1: handleRejectFromModal now routes through the unified reject modal
  const handleRejectFromModal = () => {
    handleReject(selectedRequest.id);
  };

  const handleAdjustQuota = async (e) => {
    e.preventDefault();

    if (!quotaAdjustment.userId) {
      toast.error('Pilih karyawan terlebih dahulu');
      return;
    }

    if (!quotaAdjustment.annualLeaveQuota || !quotaAdjustment.usedLeaveQuota) {
      toast.error('Isi semua kolom kuota');
      return;
    }

    try {
      await axiosInstance.put(
        `/leave-requests/admin/adjust-quota/${quotaAdjustment.userId}`,
        {
          annualLeaveQuota: parseInt(quotaAdjustment.annualLeaveQuota),
          usedLeaveQuota: parseInt(quotaAdjustment.usedLeaveQuota),
        }
      );
      toast.success('Kuota cuti berhasil disesuaikan');
      setShowAdjustQuotaModal(false);
      setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
      setSelectedEmployeeBalance(null);
      await fetchLeaveRequests(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyesuaikan kuota cuti');
    }
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // FIX 5: When employee is selected in quota modal, populate current quota info
  const handleEmployeeSelectForQuota = (e) => {
    const userId = e.target.value;
    const emp = employees.find((em) => String(em.id) === String(userId));
    setQuotaAdjustment({
      userId,
      annualLeaveQuota: emp ? String(emp.annualLeaveQuota ?? '') : '',
      usedLeaveQuota: emp ? String(emp.usedLeaveQuota ?? '') : '',
    });
    setSelectedEmployeeBalance(emp || null);
  };

  const handleViewAttachment = async (requestId) => {
    try {
      const response = await axiosInstance.get(
        `/leave-requests/admin/${requestId}/attachment/view`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuka lampiran');
    }
  };

  const handleDownloadAttachment = async (requestId, filename) => {
    try {
      const response = await axiosInstance.get(
        `/leave-requests/admin/${requestId}/attachment/download`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh lampiran');
    }
  };

  // FIX 3: Reset all filters including dates
  const handleResetFilter = () => {
    setStatusFilter('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const filteredRequests = leaveRequests;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeBadgeClass = (type) => {
    switch (type) {
      case 'ANNUAL_LEAVE': return 'bg-blue-100 text-blue-800';
      case 'SICK_LEAVE': return 'bg-orange-100 text-orange-800';
      case 'UNPAID_LEAVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Memuat permohonan cuti...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Cuti</h2>
          <p className="text-gray-600">Kelola permohonan cuti dan kuota karyawan</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdjustQuotaModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Settings size={14} className="inline mr-1" /> Sesuaikan Kuota
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Menunggu</div>
          <div className="text-2xl font-bold text-yellow-900">
            {leaveRequests.filter(r => r.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Disetujui</div>
          <div className="text-2xl font-bold text-green-900">
            {leaveRequests.filter(r => r.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Ditolak</div>
          <div className="text-2xl font-bold text-red-900">
            {leaveRequests.filter(r => r.status === 'REJECTED').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Permohonan</div>
          <div className="text-2xl font-bold text-blue-900">
            {leaveRequests.length}
          </div>
        </div>
      </div>

      {/* FIX 3: Filters with date range and reset button */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <FormSelect
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'PENDING', label: 'Menunggu' },
              { value: 'APPROVED', label: 'Disetujui' },
              { value: 'REJECTED', label: 'Ditolak' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
            <p>Tidak ada permohonan cuti ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Cuti</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diajukan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.employee?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.employee?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadgeClass(request.leaveType)}`}>
                        {request.leaveType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(request.startDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-500">s/d {new Date(request.endDate).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.totalDays} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDetailModal(request);
                        }}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <Eye size={14} className="inline mr-1" /> Lihat
                      </button>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                          >
                            <CheckCircle2 size={14} className="inline mr-1" /> Setujui
                          </button>
                          {/* FIX 1: Reject from table now opens modal, no prompt() */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <XCircle size={14} className="inline mr-1" /> Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FIX 2: Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* FIX 1: Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, requestId: null });
          setRejectNote('');
        }}
        title="Tolak Permohonan Cuti"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Anda akan menolak permohonan cuti ini. Tindakan ini tidak dapat dibatalkan.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Penolakan (opsional)
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              placeholder="Masukkan alasan penolakan..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setRejectModal({ open: false, requestId: null });
                setRejectNote('');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmReject}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <XCircle size={14} className="inline mr-1" /> Tolak Permintaan
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal && selectedRequest !== null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
          setApprovalNote('');
        }}
        title="Detail Permohonan Cuti"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Detail Permohonan Cuti</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Karyawan</p>
                  <p className="font-medium">{selectedRequest.employee?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Cuti</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadgeClass(selectedRequest.leaveType)}`}>
                    {selectedRequest.leaveType?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Mulai</p>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Selesai</p>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hari</p>
                  <p className="font-medium">{selectedRequest.totalDays} hari</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Alasan</p>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.attachmentPath && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Lampiran</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Paperclip size={16} />
                      <span className="font-medium text-gray-700">{selectedRequest.attachmentOriginalName}</span>
                    </div>
                    {selectedRequest.attachmentSize && (
                      <p className="text-xs text-gray-500">
                        Ukuran: {(selectedRequest.attachmentSize / 1024).toFixed(2)} KB
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleViewAttachment(selectedRequest.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={14} className="inline mr-1" /> Lihat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(selectedRequest.id, selectedRequest.attachmentOriginalName)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <Download size={14} className="inline mr-1" /> Unduh
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.approvalNote && (
                <div>
                  <p className="text-sm text-gray-600">Catatan Persetujuan</p>
                  <p className="font-medium">{selectedRequest.approvalNote}</p>
                </div>
              )}

              {selectedRequest.approver && (
                <div>
                  <p className="text-sm text-gray-600">Disetujui/Ditolak Oleh</p>
                  <p className="font-medium">{selectedRequest.approver.name}</p>
                </div>
              )}
            </div>

            {selectedRequest.status === 'PENDING' && (
              <div className="space-y-3">
                <FormTextarea
                  label="Catatan Persetujuan (Opsional)"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk persetujuan ini..."
                />

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle2 size={14} className="inline mr-1" /> Setujui
                  </button>
                  {/* FIX 1: Routes through unified reject modal */}
                  <button
                    type="button"
                    onClick={handleRejectFromModal}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle size={14} className="inline mr-1" /> Tolak
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowDetailModal(false);
                setSelectedRequest(null);
                setApprovalNote('');
              }}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        )}
      </Modal>

      {/* Adjust Quota Modal */}
      <Modal
        isOpen={showAdjustQuotaModal}
        onClose={() => {
          setShowAdjustQuotaModal(false);
          setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
          setSelectedEmployeeBalance(null);
        }}
        title="Sesuaikan Kuota Cuti"
      >
        <form onSubmit={handleAdjustQuota} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Sesuaikan Kuota Cuti</h3>

          <FormSelect
            label="Pilih Karyawan"
            value={quotaAdjustment.userId}
            onChange={handleEmployeeSelectForQuota}
            options={[
              { value: '', label: 'Pilih Karyawan' },
              ...employees.map(emp => ({ value: emp.id, label: emp.name }))
            ]}
            required
          />

          {/* FIX 5: Show current quota info before the input fields */}
          {selectedEmployeeBalance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-blue-800">
                Kuota saat ini:{' '}
                <span className="font-bold">
                  {selectedEmployeeBalance.annualLeaveQuota ?? '-'} hari
                </span>{' '}
                (Digunakan:{' '}
                <span className="font-bold">
                  {selectedEmployeeBalance.usedLeaveQuota ?? '-'} hari
                </span>
                )
              </p>
              <p className="text-xs text-blue-600">
                Catatan: Kuota terpakai tidak boleh melebihi kuota tahunan
              </p>
            </div>
          )}

          <FormInput
            label="Kuota Cuti Tahunan (Total)"
            type="number"
            min="0"
            value={quotaAdjustment.annualLeaveQuota}
            onChange={(e) => setQuotaAdjustment({ ...quotaAdjustment, annualLeaveQuota: e.target.value })}
            placeholder="cth: 12"
            required
          />

          <FormInput
            label="Kuota Cuti Terpakai"
            type="number"
            min="0"
            value={quotaAdjustment.usedLeaveQuota}
            onChange={(e) => setQuotaAdjustment({ ...quotaAdjustment, usedLeaveQuota: e.target.value })}
            placeholder="cth: 5"
            required
          />

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Sesuaikan Kuota
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdjustQuotaModal(false);
                setQuotaAdjustment({ userId: '', annualLeaveQuota: '', usedLeaveQuota: '' });
                setSelectedEmployeeBalance(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
