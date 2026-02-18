import Button from '../../../shared/components/button-reusable.jsx'
import { Trash2 } from 'lucide-react'

export default function NotificationsTab({
  loading,
  allNotifications,
  unreadCount,
  notificationFilter,
  setNotificationFilter,
  markNotificationAsRead,
  markAllAsRead,
  clearReadNotifications,
  deleteNotification
}) {
  const filteredNotifications = allNotifications.filter((notif) => {
    if (notificationFilter === 'unread') return !notif.isRead
    if (notificationFilter === 'read') return notif.isRead
    return true
  })

  const readCount = allNotifications.filter((n) => n.isRead).length
  const unreadCountLocal = allNotifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Inbox Notifikasi
            {unreadCountLocal > 0 && (
              <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {unreadCountLocal} Baru
              </span>
            )}
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b pb-2">
          {[
            { key: 'all', label: `Semua (${allNotifications.length})` },
            { key: 'unread', label: `Belum Dibaca (${unreadCountLocal})` },
            { key: 'read', label: `Sudah Dibaca (${readCount})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`pb-2 px-4 font-semibold transition-all ${
                notificationFilter === key
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setNotificationFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-4 mb-6">
          <Button
            nameProp="Tandai Semua Sudah Dibaca"
            onClick={markAllAsRead}
            variant="primary"
            disabled={unreadCountLocal === 0 || loading}
          />
          <Button
            nameProp="Hapus yang Sudah Dibaca"
            onClick={clearReadNotifications}
            variant="danger"
            disabled={readCount === 0 || loading}
          />
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg transition-all ${
                  notif.isRead
                    ? 'bg-white border border-gray-200 hover:bg-gray-50'
                    : 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-700'} mt-1`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleString('id-ID')}
                      </p>
                      {notif.type && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          notif.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                          notif.type === 'ERROR' ? 'bg-red-100 text-red-700' :
                          notif.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {notif.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                    title="Hapus notifikasi"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              {notificationFilter === 'unread' && 'Tidak ada notifikasi belum dibaca'}
              {notificationFilter === 'read' && 'Tidak ada notifikasi yang sudah dibaca'}
              {notificationFilter === 'all' && 'Tidak ada notifikasi'}
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Tips:</strong> Klik notifikasi belum dibaca untuk menandai sudah dibaca.
            Gunakan tombol "Hapus yang Sudah Dibaca" untuk membersihkan inbox.
          </p>
        </div>
      </div>
    </div>
  )
}
