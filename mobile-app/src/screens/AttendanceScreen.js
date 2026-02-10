import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { attendanceService } from '../services';
import { formatDate, formatTime } from '../utils/dateFormatter';
import { getStatusColor } from '../utils/helpers';

export default function AttendanceScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allAttendanceHistory, setAllAttendanceHistory] = useState([]);
  const [displayedAttendanceHistory, setDisplayedAttendanceHistory] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [attendanceStatistics, setAttendanceStatistics] = useState(null);
  const [statisticsPeriod, setStatisticsPeriod] = useState('monthly');
  const [statisticsMonth, setStatisticsMonth] = useState(new Date().getMonth() + 1);
  const [statisticsYear, setStatisticsYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  useEffect(() => {
    applyPagination();
  }, [currentPage, allAttendanceHistory]);

  const applyPagination = () => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = allAttendanceHistory.slice(0, endIndex);
    setDisplayedAttendanceHistory(paginated);
    setHasMore(endIndex < allAttendanceHistory.length);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAttendanceHistory();
      // Backend returns {data, message} not {success, data}
      if (response.data) {
        setAllAttendanceHistory(response.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatistics = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAttendanceStatistics(
        statisticsPeriod,
        statisticsMonth,
        statisticsYear
      );
      // Backend returns {data, message} not {success, data}
      if (response.data) {
        setAttendanceStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceHistory();
    if (showStatistics) {
      await fetchAttendanceStatistics();
    }
    setRefreshing(false);
  };

  const viewDetail = (attendance) => {
    setSelectedAttendance(attendance);
    setShowModal(true);
  };

  const toggleStatistics = () => {
    const newValue = !showStatistics;
    setShowStatistics(newValue);
    if (newValue && !attendanceStatistics) {
      fetchAttendanceStatistics();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/salmon-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Salmon HRIS</Text>
            <Text style={styles.headerSubtitle}>Attendance Management</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Camera', { action: 'clock-in' })}
            >
              <Text style={styles.actionButtonText}>Clock In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => navigation.navigate('Camera', { action: 'clock-out' })}
            >
              <Text style={styles.actionButtonText}>Clock Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Toggle */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleStatistics}
          >
            <Text style={styles.toggleButtonText}>
              {showStatistics ? 'Sembunyikan Statistik' : 'Lihat Statistik'}
            </Text>
          </TouchableOpacity>

          {showStatistics && (
            <View style={styles.statisticsContainer}>
              <Text style={styles.sectionTitle}>Statistik Attendance</Text>
              
              {/* Period Selection */}
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Periode:</Text>
                <Picker
                  selectedValue={statisticsPeriod}
                  onValueChange={setStatisticsPeriod}
                  style={styles.picker}
                >
                  <Picker.Item label="Harian" value="daily" />
                  <Picker.Item label="Mingguan" value="weekly" />
                  <Picker.Item label="Bulanan" value="monthly" />
                </Picker>
              </View>

              {statisticsPeriod === 'monthly' && (
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Bulan:</Text>
                    <Picker
                      selectedValue={statisticsMonth}
                      onValueChange={setStatisticsMonth}
                      style={styles.picker}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <Picker.Item
                          key={month}
                          label={new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
                          value={month}
                        />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Tahun:</Text>
                    <Picker
                      selectedValue={statisticsYear}
                      onValueChange={setStatisticsYear}
                      style={styles.picker}
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <Picker.Item key={year} label={year.toString()} value={year} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchAttendanceStatistics}
              >
                <Text style={styles.refreshButtonText}>Refresh Statistik</Text>
              </TouchableOpacity>

              {attendanceStatistics && (
                <View style={styles.statsGrid}>
                  <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
                    <Text style={styles.statLabel}>Tepat Waktu</Text>
                    <Text style={[styles.statValue, { color: '#166534' }]}>
                      {attendanceStatistics.summary?.onTime || 0}
                    </Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
                    <Text style={styles.statLabel}>Terlambat</Text>
                    <Text style={[styles.statValue, { color: '#991b1b' }]}>
                      {attendanceStatistics.summary?.late || 0}
                    </Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: '#e5e7eb' }]}>
                    <Text style={styles.statLabel}>Absent</Text>
                    <Text style={[styles.statValue, { color: '#1f2937' }]}>
                      {attendanceStatistics.summary?.absent || 0}
                    </Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
                    <Text style={styles.statLabel}>Total Hadir</Text>
                    <Text style={[styles.statValue, { color: '#1e40af' }]}>
                      {attendanceStatistics.summary?.totalPresent || 0}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Attendance History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Riwayat Attendance</Text>
          
          {loading && !refreshing ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : displayedAttendanceHistory.length > 0 ? (
            <>
              {displayedAttendanceHistory.map((att) => (
                <TouchableOpacity
                  key={att.id}
                  style={styles.attendanceItem}
                  onPress={() => viewDetail(att)}
                >
                  <View style={styles.attendanceInfo}>
                    <Text style={styles.attendanceDate}>{formatDate(att.date)}</Text>
                    <Text style={styles.attendanceTime}>
                      {formatTime(att.clockIn)} - {formatTime(att.clockOut)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(att.status).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(att.status).text },
                      ]}
                    >
                      {att.status}
                    </Text>
                  </View>
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
                  Menampilkan {displayedAttendanceHistory.length} dari {allAttendanceHistory.length} data
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>Belum ada riwayat attendance</Text>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detail Attendance</Text>
            
            {selectedAttendance && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Tanggal:</Text>
                  <Text style={styles.modalValue}>
                    {formatDate(selectedAttendance.date)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Clock In:</Text>
                  <Text style={styles.modalValue}>
                    {formatTime(selectedAttendance.clockIn)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Clock Out:</Text>
                  <Text style={styles.modalValue}>
                    {formatTime(selectedAttendance.clockOut)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Durasi Kerja:</Text>
                  <Text style={styles.modalValue}>
                    {selectedAttendance.workDurationHours || 0} jam
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedAttendance.status).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedAttendance.status).text },
                      ]}
                    >
                      {selectedAttendance.status}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4DB8B8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  statisticsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#4DB8B8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  attendanceTime: {
    fontSize: 12,
    color: '#64748b',
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
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    backgroundColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
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
});
