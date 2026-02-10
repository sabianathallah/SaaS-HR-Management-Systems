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
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { notificationService } from '../services';
import { formatDateTime } from '../utils/dateFormatter';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilterAndPagination();
  }, [filter, currentPage, allNotifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch ALL notifications without filter
      const response = await notificationService.getNotifications('all');
      console.log('Fetch notifications response:', response);
      
      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setAllNotifications(data);
        
        // Calculate unread count from all notifications
        const unread = data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        
        // Reset to page 1 when fetching new data
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilterAndPagination = () => {
    let filtered = [...allNotifications];
    
    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }
    
    // Apply pagination
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, endIndex);
    
    setDisplayedNotifications(paginated);
    setHasMore(endIndex < filtered.length);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state immediately
      setAllNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      // Recalculate unread count
      const newUnreadCount = allNotifications.filter(n => n.id !== id && !n.isRead).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Gagal menandai notifikasi');
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert('Info', 'Tidak ada notifikasi yang belum dibaca');
      return;
    }

    try {
      const result = await notificationService.markAllAsRead();
      console.log('Mark all as read result:', result);
      
      Alert.alert('Berhasil', 'Semua notifikasi ditandai sudah dibaca');
      
      // Update local state
      setAllNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Gagal menandai semua notifikasi: ' + (error.message || 'Unknown error'));
    }
  };

  const clearReadNotifications = async () => {
    const readCount = allNotifications.filter(n => n.isRead).length;
    
    if (readCount === 0) {
      Alert.alert('Info', 'Tidak ada notifikasi yang sudah dibaca');
      return;
    }
    
    Alert.alert(
      'Konfirmasi',
      `Hapus ${readCount} notifikasi yang sudah dibaca?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearReadNotifications();
              Alert.alert('Berhasil', 'Notifikasi yang sudah dibaca telah dihapus');
              
              // Update local state
              setAllNotifications(prev => prev.filter(n => !n.isRead));
              setCurrentPage(1);
            } catch (error) {
              console.error('Error clearing read notifications:', error);
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
              
              // Update local state
              const deletedNotif = allNotifications.find(n => n.id === id);
              setAllNotifications(prev => prev.filter(n => n.id !== id));
              
              // Update unread count if deleted notification was unread
              if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => prev - 1);
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifikasi {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <View style={styles.headerSpacer} />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4DB8B8']} />
        }
      >
        {loading && !refreshing ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : displayedNotifications.length > 0 ? (
          <>
            {displayedNotifications.map((notif) => (
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
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
              >
                <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>
              </TouchableOpacity>
            )}
            
            {/* Pagination Info */}
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Menampilkan {displayedNotifications.length} dari {
                  filter === 'all' ? allNotifications.length :
                  filter === 'unread' ? allNotifications.filter(n => !n.isRead).length :
                  allNotifications.filter(n => n.isRead).length
                } notifikasi
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'Tidak ada notifikasi' :
               filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' :
               'Tidak ada notifikasi yang sudah dibaca'}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 24,
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
    backgroundColor: '#4DB8B8',
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
    borderLeftColor: '#4DB8B8',
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
    backgroundColor: '#4DB8B8',
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
  loadMoreButton: {
    backgroundColor: '#4DB8B8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  loadMoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationInfo: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
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
