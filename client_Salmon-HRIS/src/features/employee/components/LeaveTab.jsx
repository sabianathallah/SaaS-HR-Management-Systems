import Button from '../../../shared/components/button-reusable.jsx'
import { FileText } from 'lucide-react'

export default function LeaveTab({
  loading,
  leaveRequests,
  leaveBalance,
  showLeaveForm,
  setShowLeaveForm,
  leaveForm,
  setLeaveForm,
  attachmentPreview,
  handleLeaveSubmit,
  handleFileChange,
  removeAttachment,
  handleCancelLeave,
  showLeaveHistory,
  setShowLeaveHistory,
  fetchLeaveData,
  overtimeRequests,
  overtimeHistory,
  showOvertimeForm,
  setShowOvertimeForm,
  showOvertimeHistory,
  setShowOvertimeHistory,
  overtimeForm,
  setOvertimeForm,
  handleOvertimeSubmit,
  handleCancelOvertime,
  fetchOvertimeData,
  fetchOvertimeHistory
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cuti & Izin</h2>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Sistem Pengajuan Cuti & Izin</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Jenis Pengajuan yang Tersedia:</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li><strong>Cuti Tahunan (Annual Leave)</strong></li>
              <li><strong>Sakit (Sick Leave)</strong></li>
              <li><strong>Izin (Permission)</strong></li>
            </ul>
          </div>
        </div>

        {/* Leave Balance */}
        {leaveBalance && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Saldo Cuti</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Jatah</p>
                <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeaveQuota || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Terpakai</p>
                <p className="text-2xl font-bold text-red-600">{leaveBalance.usedLeaveQuota || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Sisa</p>
                <p className="text-2xl font-bold text-green-600">{leaveBalance.remainingLeaveQuota || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{leaveBalance.pendingLeaveDays || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Request Button */}
        <Button nameProp="+ Ajukan Cuti/Izin" onClick={() => setShowLeaveForm(!showLeaveForm)} variant="primary" />

        {/* Leave Form */}
        {showLeaveForm && (
          <form onSubmit={handleLeaveSubmit} className="bg-blue-50 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Pengajuan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Jenis Cuti/Izin <span className="text-red-500">*</span>
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="ANNUAL_LEAVE">Cuti Tahunan (Annual Leave)</option>
                  <option value="SICK_LEAVE">Sakit (Sick Leave)</option>
                  <option value="PERMISSION">Izin (Permission)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {leaveForm.leaveType === 'ANNUAL_LEAVE' && 'Jenis ini akan mengurangi kuota cuti tahunan Anda'}
                  {leaveForm.leaveType === 'SICK_LEAVE' && 'Jenis ini tidak mengurangi kuota cuti (untuk kondisi sakit)'}
                  {leaveForm.leaveType === 'PERMISSION' && 'Jenis ini tidak mengurangi kuota cuti (untuk keperluan pribadi)'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tanggal Selesai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {leaveForm.startDate && leaveForm.endDate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Durasi:</strong>{' '}
                    {(() => {
                      const start = new Date(leaveForm.startDate)
                      const end = new Date(leaveForm.endDate)
                      const totalDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
                      return `${totalDays} hari`
                    })()}
                  </p>
                  {leaveForm.leaveType === 'ANNUAL_LEAVE' && leaveBalance && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Kuota yang akan terpakai:{' '}
                      {Math.ceil(Math.abs(new Date(leaveForm.endDate) - new Date(leaveForm.startDate)) / (1000 * 60 * 60 * 24)) + 1} dari {leaveBalance.remainingLeaveQuota || 0} hari tersisa
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Alasan <span className="text-red-500">*</span> (Minimal 10 karakter)
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  rows="4"
                  placeholder="Jelaskan alasan pengajuan secara detail (minimal 10 karakter)..."
                  required
                  minLength={10}
                />
                <p className={`text-xs mt-1 ${leaveForm.reason.trim().length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                  {leaveForm.reason.trim().length}/10 karakter minimum
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Lampiran (Opsional)</label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {!attachmentPreview ? (
                    <>
                      <input type="file" id="attachment-upload" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                      <label htmlFor="attachment-upload" className="cursor-pointer block text-center">
                        <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-600 font-semibold">Klik untuk upload dokumen pendukung</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </label>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {attachmentPreview === 'PDF' ? (
                        <div className="flex items-center justify-between bg-white p-3 rounded">
                          <div className="flex items-center">
                            <FileText size={28} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{leaveForm.attachment.name}</p>
                              <p className="text-xs text-gray-500">{(leaveForm.attachment.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button type="button" onClick={removeAttachment} className="text-red-600 hover:text-red-800 font-semibold">Hapus</button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <img src={attachmentPreview} alt="Preview" className="w-full h-48 object-contain bg-white rounded" />
                          <div className="flex items-center justify-between bg-white p-3 rounded">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{leaveForm.attachment.name}</p>
                              <p className="text-xs text-gray-500">{(leaveForm.attachment.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <button type="button" onClick={removeAttachment} className="text-red-600 hover:text-red-800 font-semibold">Hapus</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button nameProp={loading ? 'Mengirim...' : 'Kirim Pengajuan'} type="submit" variant="primary" disabled={loading} />
                <Button nameProp="Batal" type="button" onClick={() => setShowLeaveForm(false)} variant="secondary" />
              </div>
            </div>
          </form>
        )}

        {/* Leave History */}
        <div className="mt-6">
          <Button
            nameProp={showLeaveHistory ? 'Sembunyikan Riwayat' : 'Lihat Riwayat Pengajuan Cuti/Izin'}
            onClick={() => {
              setShowLeaveHistory(!showLeaveHistory)
              if (!showLeaveHistory && leaveRequests.length === 0) fetchLeaveData()
            }}
            variant="secondary"
          />

          {showLeaveHistory && (
            <div className="mt-4 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Pengajuan Cuti/Izin</h3>
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : leaveRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Jenis', 'Tanggal', 'Durasi', 'Status', 'Aksi'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveRequests.map((leave) => (
                        <tr key={leave.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {leave.leaveType === 'ANNUAL_LEAVE' ? 'Cuti Tahunan' : leave.leaveType === 'SICK_LEAVE' ? 'Sakit' : 'Izin'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(leave.startDate).toLocaleDateString('id-ID')} - {new Date(leave.endDate).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.totalDays} hari</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              leave.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                              leave.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                              leave.status === 'CANCELLED' ? 'bg-gray-200 text-gray-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {leave.status === 'APPROVED' ? 'Disetujui' :
                               leave.status === 'REJECTED' ? 'Ditolak' :
                               leave.status === 'CANCELLED' ? 'Dibatalkan' : 'Menunggu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {leave.status === 'PENDING' && (
                              <button onClick={() => handleCancelLeave(leave.id)} className="text-red-600 hover:text-red-800 font-semibold">Batalkan</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">Belum ada riwayat pengajuan cuti/izin</p>
              )}
            </div>
          )}
        </div>

        {/* ==================== OVERTIME SECTION ==================== */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Overtime (Lembur)</h3>

          <Button
            nameProp="+ Request Overtime"
            onClick={() => {
              setShowOvertimeForm(!showOvertimeForm)
              if (!showOvertimeForm) fetchOvertimeData()
            }}
            variant="primary"
          />

          {showOvertimeForm && (
            <form onSubmit={handleOvertimeSubmit} className="bg-purple-50 rounded-lg p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Overtime</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tanggal Overtime</label>
                  <input
                    type="date"
                    value={overtimeForm.overtimeDate}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, overtimeDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Jam Overtime (0.5 - 12 jam)</label>
                  <input
                    type="number" step="0.5" min="0.5" max="12"
                    value={overtimeForm.requestedHours}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, requestedHours: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Alasan Overtime (Minimal 10 karakter)</label>
                  <textarea
                    value={overtimeForm.reason}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    rows="3"
                    placeholder="Jelaskan alasan overtime (minimal 10 karakter)..."
                    required minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">{overtimeForm.reason.trim().length}/10 karakter minimum</p>
                </div>
                <div className="flex gap-4">
                  <Button nameProp={loading ? 'Mengirim...' : 'Kirim Request'} type="submit" variant="primary" disabled={loading} />
                  <Button nameProp="Batal" type="button" onClick={() => setShowOvertimeForm(false)} variant="secondary" />
                </div>
              </div>
            </form>
          )}

          {overtimeRequests.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-3">Pengajuan Overtime</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Tanggal', 'Jam Request', 'Jam Approved', 'Status', 'Aksi'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overtimeRequests.map((ot) => (
                      <tr key={ot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(ot.overtimeDate).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.requestedHours} jam</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.actualHours || '-'} jam</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ot.status === 'approved' ? 'bg-green-200 text-green-800' :
                            ot.status === 'rejected' ? 'bg-red-200 text-red-800' :
                            ot.status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>{ot.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ot.status === 'pending' && (
                            <button onClick={() => handleCancelOvertime(ot.id)} className="text-red-600 hover:text-red-800 font-semibold">Batalkan</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              nameProp={showOvertimeHistory ? 'Sembunyikan Riwayat Overtime' : 'Lihat Riwayat Overtime yang Disetujui'}
              onClick={() => {
                setShowOvertimeHistory(!showOvertimeHistory)
                if (!showOvertimeHistory) fetchOvertimeHistory()
              }}
              variant="secondary"
            />
            {showOvertimeHistory && (
              <div className="mt-4 bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-700 mb-3">Riwayat Overtime yang Disetujui</h4>
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : overtimeHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Tanggal', 'Jam Request', 'Jam Approved', 'Alasan', 'Catatan Admin'].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overtimeHistory.map((ot) => (
                          <tr key={ot.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(ot.overtimeDate).toLocaleDateString('id-ID')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.requestedHours} jam</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ot.actualHours || ot.requestedHours} jam</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{ot.reason}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{ot.adminNotes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Belum ada overtime yang disetujui</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
