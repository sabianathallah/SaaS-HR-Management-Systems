import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { attendanceService, notificationService } from '../services';
import { formatTime, formatDate } from '../utils/dateFormatter';
import { getStatusColor } from '../utils/helpers';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, notifRes] = await Promise.all([
        attendanceService.getTodayAttendance(),
        notificationService.getNotifications('all'),
      ]);

      if (attendanceRes.success) {
        setTodayAttendance(attendanceRes.data);
      }

      if (notifRes.success) {
        const allNotifs = notifRes.data || [];
        setNotifications(allNotifs.slice(0, 5));
        setUnreadCount(allNotifs.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleClockIn = () => {
    navigation.navigate('Camera', { action: 'clock-in' });
  };

  const handleClockOut = () => {
    navigation.navigate('Camera', { action: 'clock-out' });
  };

  const markNotificationAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Employee Portal</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Attendance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Hari Ini</Text>
          
          {todayAttendance ? (
            <View>
              <View style={styles.attendanceRow}>
                <Text style={styles.attendanceLabel}>Clock In:</Text>
                <Text style={styles.attendanceValueGreen}>
                  {formatTime(todayAttendance.clockIn)}
                </Text>
              </View>

              {todayAttendance.clockOut ? (
                <>
                  <View style={styles.attendanceRow}>
                    <Text style={styles.attendanceLabel}>Clock Out:</Text>
                    <Text style={styles.attendanceValueRed}>
                      {formatTime(todayAttendance.clockOut)}
                    </Text>
                  </View>
                  <View style={styles.attendanceRow}>
                    <Text style={styles.attendanceLabel}>Durasi Kerja:</Text>
                    <Text style={styles.attendanceValue}>
                      {todayAttendance.workDurationHours || 0} jam
                    </Text>
                  </View>
                  <View style={styles.attendanceRow}>
                    <Text style={styles.attendanceLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(todayAttendance.status).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(todayAttendance.status).text },
                        ]}
                      >
                        {todayAttendance.status}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <TouchableOpacity style={styles.clockButton} onPress={handleClockOut}>
                  <Text style={styles.clockButtonText}>📸 Clock Out</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noAttendance}>
              <Text style={styles.noAttendanceText}>
                Anda belum clock-in hari ini
              </Text>
              <TouchableOpacity style={styles.clockButton} onPress={handleClockIn}>
                <Text style={styles.clockButtonText}>📸 Clock In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Attendance')}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Leave')}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionText}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.quickActionIcon}>👤</Text>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Notifikasi {unreadCount > 0 && `(${unreadCount})`}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notificationItem,
                  !notif.isRead && styles.notificationUnread,
                ]}
                onPress={() => !notif.isRead && markNotificationAsRead(notif.id)}
              >
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notif.title}</Text>
                  <Text style={styles.notificationMessage}>{notif.message}</Text>
                  <Text style={styles.notificationDate}>
                    {formatDate(notif.createdAt)}
                  </Text>
                </View>
                {!notif.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attendanceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  attendanceValueGreen: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  attendanceValueRed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noAttendance: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noAttendanceText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  clockButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  clockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 16,
  },
});
