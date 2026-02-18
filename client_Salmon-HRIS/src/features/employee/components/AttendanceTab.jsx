import Button from '../../../shared/components/button-reusable.jsx'

export default function AttendanceTab({
  todayAttendance,
  loading,
  attendanceHistory,
  selectedAttendance,
  showAttendanceModal,
  setShowAttendanceModal,
  attendanceStatistics,
  statisticsPeriod,
  setStatisticsPeriod,
  statisticsMonth,
  setStatisticsMonth,
  statisticsYear,
  setStatisticsYear,
  showStatistics,
  setShowStatistics,
  fetchAttendanceStatistics,
  initClockIn,
  initClockOut,
  viewAttendanceDetail
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance</h2>

        {/* Clock In/Out Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            nameProp="Clock In"
            onClick={initClockIn}
            variant="primary"
            disabled={todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut}
          />
          <Button
            nameProp="Clock Out"
            onClick={initClockOut}
            variant="danger"
            disabled={!todayAttendance || !todayAttendance.clockIn || todayAttendance.clockOut}
          />
        </div>

        {/* Statistics Section */}
        <div className="mb-6 border-t pt-4">
          <Button
            nameProp={showStatistics ? 'Sembunyikan Statistik' : 'Lihat Statistik Attendance'}
            onClick={() => {
              setShowStatistics(!showStatistics)
              if (!showStatistics && !attendanceStatistics) {
                fetchAttendanceStatistics()
              }
            }}
            variant="primary"
          />

          {showStatistics && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistik Attendance</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
                  <select
                    value={statisticsPeriod}
                    onChange={(e) => setStatisticsPeriod(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>

                {statisticsPeriod === 'monthly' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                      <select
                        value={statisticsMonth}
                        onChange={(e) => setStatisticsMonth(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>
                            {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                      <select
                        value={statisticsYear}
                        onChange={(e) => setStatisticsYear(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <Button
                nameProp={loading ? 'Memuat...' : 'Refresh Statistik'}
                onClick={fetchAttendanceStatistics}
                variant="primary"
                disabled={loading}
              />

              {attendanceStatistics ? (
                <div className="mt-6">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Periode: {attendanceStatistics.period}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(attendanceStatistics.dateRange.start).toLocaleDateString('id-ID')} -{' '}
                      {new Date(attendanceStatistics.dateRange.end).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Tepat Waktu</p>
                      <p className="text-2xl font-bold text-green-700">{attendanceStatistics.summary.onTime}</p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Terlambat</p>
                      <p className="text-2xl font-bold text-red-700">{attendanceStatistics.summary.late}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Absent</p>
                      <p className="text-2xl font-bold text-gray-700">{attendanceStatistics.summary.absent}</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Hadir</p>
                      <p className="text-2xl font-bold text-blue-700">{attendanceStatistics.summary.totalPresent}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Jam Kerja Total</p>
                      <p className="text-xl font-bold text-gray-800">{attendanceStatistics.summary.totalWorkHours} jam</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tingkat Kehadiran</p>
                      <p className="text-xl font-bold text-gray-800">{attendanceStatistics.summary.attendanceRate}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Hari Kerja</p>
                      <p className="text-xl font-bold text-gray-800">{attendanceStatistics.summary.totalWorkDays} hari</p>
                    </div>
                  </div>

                  {(attendanceStatistics.summary.leave > 0 ||
                    attendanceStatistics.summary.sickLeave > 0 ||
                    attendanceStatistics.summary.permission > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-yellow-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Cuti</p>
                        <p className="text-xl font-bold text-yellow-700">{attendanceStatistics.summary.leave}</p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Sakit</p>
                        <p className="text-xl font-bold text-orange-700">{attendanceStatistics.summary.sickLeave}</p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Izin</p>
                        <p className="text-xl font-bold text-purple-700">{attendanceStatistics.summary.permission}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-4">Klik "Refresh Statistik" untuk memuat data</p>
              )}
            </div>
          )}
        </div>

        {/* Attendance History */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Riwayat Attendance</h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : attendanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(att.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockIn ? new Date(att.clockIn).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.clockOut ? new Date(att.clockOut).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        att.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                        att.status === 'LATE' ? 'bg-red-200 text-red-800' :
                        att.status === 'ABSENT' ? 'bg-gray-200 text-gray-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewAttendanceDetail(att)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">Belum ada riwayat attendance</p>
        )}
      </div>

      {/* Attendance Detail Modal */}
      {showAttendanceModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Attendance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold">{new Date(selectedAttendance.date).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clock In:</span>
                <span className="font-semibold">
                  {selectedAttendance.clockIn ? new Date(selectedAttendance.clockIn).toLocaleTimeString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clock Out:</span>
                <span className="font-semibold">
                  {selectedAttendance.clockOut ? new Date(selectedAttendance.clockOut).toLocaleTimeString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi Kerja:</span>
                <span className="font-semibold">{selectedAttendance.workDurationHours || 0} jam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedAttendance.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                  selectedAttendance.status === 'LATE' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {selectedAttendance.status}
                </span>
              </div>
            </div>
            <Button nameProp="Tutup" onClick={() => setShowAttendanceModal(false)} variant="secondary" className="mt-4" />
          </div>
        </div>
      )}
    </div>
  )
}
