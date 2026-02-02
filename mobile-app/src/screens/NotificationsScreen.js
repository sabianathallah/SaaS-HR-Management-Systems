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
import { Picker } from '@react-native-picker/picker';
import { notificationService } from '../services';
import { formatDateTime } from '../utils/dateFormatter';

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(filter);
      // Backend returns {data, message, meta} not {success, data}
      if (response.data) {
        const data = response.data || [];
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert('Info', 'Tidak ada notifikasi yang belum dibaca');
      return;
    }

    try {
      await notificationService.markAllAsRead();
      Alert.alert('Berhasil', 'Semua notifikasi ditandai sudah dibaca');
      fetchNotifications();
    } catch (error) {
      Alert.alert('Error', 'Gagal menandai semua notifikasi');
    }
  };

  const clearReadNotifications = async () => {
    Alert.alert(
      'Konfirmasi',
      'Hapus semua notifikasi yang sudah dibaca?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearReadNotifications();
              Alert.alert('Berhasil', 'Notifikasi yang sudah dibaca telah dihapus');
              fetchNotifications();
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus notifikasi');
            }
          },
        },
      ]
    );
  };

  const deleteNotification = async (id) => {
    Alert.alert(
      'Konfirmasi',
      'Hapus notifikasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              fetchNotifications();
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus notifikasi');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifikasi {unreadCount > 0 && `(${unreadCount})`}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter:</Text>
          <Picker
            selectedValue={filter}
            onValueChange={setFilter}
            style={styles.picker}
          >
            <Picker.Item label="Semua" value="all" />
            <Picker.Item label="Belum Dibaca" value="unread" />
            <Picker.Item label="Sudah Dibaca" value="read" />
          </Picker>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.actionButtonText}>Tandai Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={clearReadNotifications}
          >
            <Text style={styles.actionButtonText}>Bersihkan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationItem,
                !notif.isRead && styles.notificationUnread,
              ]}
              onPress={() => !notif.isRead && markAsRead(notif.id)}
              onLongPress={() => deleteNotification(notif.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notif.title}</Text>
                  {!notif.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
                <Text style={styles.notificationDate}>
                  {formatDateTime(notif.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNotification(notif.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        )}
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
  actions: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
  },
});
