import Button from '../../../shared/components/button-reusable.jsx'

export default function DashboardTab({
  todayAttendance,
  notifications,
  unreadCount,
  loading,
  initClockIn,
  initClockOut,
  markNotificationAsRead
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Employee</h2>

        {/* Clock Status */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Status Hari Ini</h3>

          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clock In:</span>
                <span className="font-semibold text-green-600">
                  {new Date(todayAttendance.clockIn).toLocaleTimeString('id-ID')}
                </span>
              </div>

              {todayAttendance.locationInfo?.clockIn && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lokasi Clock In:</span>
                  {todayAttendance.locationInfo.clockIn.googleMapsUrl ? (
                    <a
                      href={todayAttendance.locationInfo.clockIn.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {todayAttendance.locationInfo.clockIn.displayText}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">
                      {todayAttendance.locationInfo.clockIn.displayText}
                    </span>
                  )}
                </div>
              )}

              {todayAttendance.clockOut ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clock Out:</span>
                    <span className="font-semibold text-red-600">
                      {new Date(todayAttendance.clockOut).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  {todayAttendance.locationInfo?.clockOut?.googleMapsUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lokasi Clock Out:</span>
                      <a
                        href={todayAttendance.locationInfo.clockOut.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {todayAttendance.locationInfo.clockOut.displayText}
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Durasi Kerja:</span>
                    <span className="font-semibold text-blue-600">
                      {todayAttendance.workDurationHours || 0} jam
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      todayAttendance.status === 'ON_TIME' ? 'bg-green-200 text-green-800' :
                      todayAttendance.status === 'LATE' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {todayAttendance.status}
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <Button nameProp="Clock Out" onClick={initClockOut} variant="danger" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">Anda belum clock-in hari ini</p>
              <Button nameProp="Clock In" onClick={initClockIn} variant="primary" />
            </div>
          )}
        </div>

        {/* Notifications Preview */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Notifikasi{' '}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notif.isRead ? 'bg-white' : 'bg-blue-100 border-l-4 border-blue-500'
                  }`}
                  onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Tidak ada notifikasi</p>
          )}
        </div>
      </div>
    </div>
  )
}
