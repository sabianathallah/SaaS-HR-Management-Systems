import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { leaveService } from '../services';
import { formatDate, calculateDaysBetween } from '../utils/dateFormatter';
import { getLeaveTypeLabel, getStatusLabel, getStatusColor } from '../utils/helpers';

export default function LeaveScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [displayedLeaveRequests, setDisplayedLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
  });

  useEffect(() => {
    fetchLeaveData();
  }, []);

  useEffect(() => {
    applyPagination();
  }, [currentPage, allLeaveRequests]);

  const applyPagination = () => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = allLeaveRequests.slice(0, endIndex);
    setDisplayedLeaveRequests(paginated);
    setHasMore(endIndex < allLeaveRequests.length);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [requestsRes, balanceRes] = await Promise.all([
        leaveService.getLeaveRequests(),
        leaveService.getLeaveBalance(),
      ]);

      if (requestsRes.data) {
        setAllLeaveRequests(requestsRes.data || []);
        setCurrentPage(1);
      }
      if (balanceRes.data) {
        setLeaveBalance(balanceRes.data);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      Alert.alert('Error', 'Gagal memuat data cuti');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaveData();
    setRefreshing(false);
  };

  const handleLeaveSubmit = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (leaveForm.reason.length < 10) {
      Alert.alert('Error', 'Alasan minimal 10 karakter');
      return;
    }

    try {
      await leaveService.createLeaveRequest(
        leaveForm.leaveType,
        leaveForm.startDate,
        leaveForm.endDate,
        leaveForm.reason,
        leaveForm.attachment
      );
      
      Alert.alert('Berhasil', 'Pengajuan cuti berhasil disubmit');
      setShowLeaveForm(false);
      setLeaveForm({
        leaveType: 'ANNUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: '',
        attachment: null,
      });
      fetchLeaveData();
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert('Error', error.response?.data?.message || 'Gagal submit pengajuan cuti');
    }
  };

  const handleCancelLeave = async (id) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin membatalkan pengajuan ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              await leaveService.cancelLeaveRequest(id);
              Alert.alert('Berhasil', 'Pengajuan berhasil dibatalkan');
              fetchLeaveData();
            } catch (error) {
              Alert.alert('Error', 'Gagal membatalkan pengajuan');
            }
          },
        },
      ]
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setLeaveForm({ ...leaveForm, attachment: result.assets[0] });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Gagal memilih file');
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
            <Text style={styles.headerSubtitle}>Leave Management</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4DB8B8']} />
        }
      >
        {leaveBalance && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Saldo Cuti Anda</Text>
            <View style={styles.balanceGrid}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{leaveBalance.remainingLeaveQuota || 0}</Text>
                <Text style={styles.balanceLabel}>Sisa Cuti</Text>
                <Text style={styles.balanceSubLabel}>dari {leaveBalance.annualLeaveQuota || 12}</Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{leaveBalance.usedLeaveQuota || 0}</Text>
                <Text style={styles.balanceLabel}>Terpakai</Text>
                <Text style={styles.balanceSubLabel}>hari cuti</Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{leaveBalance.pendingLeaveDays || 0}</Text>
                <Text style={styles.balanceLabel}>Pending</Text>
                <Text style={styles.balanceSubLabel}>menunggu</Text>
              </View>
            </View>
            
            {leaveBalance.pendingLeaveDays > 0 && (
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingInfoText}>
                  💡 Sisa tersedia setelah pending: {leaveBalance.availableAfterPending || 0} hari
                </Text>
              </View>
            )}
          </View>
        )}

        {!showLeaveForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowLeaveForm(true)}
          >
            <Text style={styles.addButtonText}>+ Ajukan Cuti/Izin</Text>
          </TouchableOpacity>
        )}

        {showLeaveForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Ajukan Cuti/Izin</Text>

            <Text style={styles.label}>Jenis Cuti</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={leaveForm.leaveType}
                onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
                style={styles.picker}
              >
                <Picker.Item label="🏖️ Cuti Tahunan (Annual Leave)" value="ANNUAL_LEAVE" />
                <Picker.Item label="🤒 Sakit (Sick Leave)" value="SICK_LEAVE" />
                <Picker.Item label="📝 Izin (Permission)" value="PERMISSION" />
              </Picker>
            </View>
            
            <Text style={styles.helpText}>
              {leaveForm.leaveType === 'ANNUAL_LEAVE' && 'Jenis ini akan mengurangi kuota cuti tahunan Anda'}
              {leaveForm.leaveType === 'SICK_LEAVE' && 'Jenis ini tidak mengurangi kuota cuti (untuk kondisi sakit)'}
              {leaveForm.leaveType === 'PERMISSION' && 'Jenis ini tidak mengurangi kuota cuti (untuk keperluan pribadi)'}
            </Text>

            <Text style={styles.label}>Tanggal Mulai (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={leaveForm.startDate}
              onChangeText={(text) => setLeaveForm({ ...leaveForm, startDate: text })}
              placeholder="2026-02-15"
            />

            <Text style={styles.label}>Tanggal Selesai (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={leaveForm.endDate}
              onChangeText={(text) => setLeaveForm({ ...leaveForm, endDate: text })}
              placeholder="2026-02-17"
            />

            <Text style={styles.label}>Alasan (minimal 10 karakter)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={leaveForm.reason}
              onChangeText={(text) => setLeaveForm({ ...leaveForm, reason: text })}
              placeholder="Tuliskan alasan pengajuan cuti..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
              <Text style={styles.attachButtonText}>
                {leaveForm.attachment ? '✓ File terlampir' : '📎 Lampirkan File (Opsional)'}
              </Text>
            </TouchableOpacity>

            {leaveForm.attachment && (
              <Text style={styles.attachmentName}>{leaveForm.attachment.name}</Text>
            )}

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowLeaveForm(false);
                  setLeaveForm({
                    leaveType: 'ANNUAL_LEAVE',
                    startDate: '',
                    endDate: '',
                    reason: '',
                    attachment: null,
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleLeaveSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Riwayat Pengajuan Cuti</Text>
          {displayedLeaveRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Belum ada pengajuan cuti</Text>
            </View>
          ) : (
            <>
              {displayedLeaveRequests.map((leave) => (
                <View key={leave.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestType}>{getLeaveTypeLabel(leave.leaveType)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(leave.status).bg }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(leave.status).text }]}>
                        {getStatusLabel(leave.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestDetails}>
                    <Text style={styles.requestDate}>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </Text>
                    <Text style={styles.requestDays}>
                      {leave.totalDays} hari
                    </Text>
                  </View>

                  <Text style={styles.requestReason}>{leave.reason}</Text>

                  {leave.approvalNote && (
                    <View style={styles.approvalNote}>
                      <Text style={styles.approvalNoteLabel}>Catatan:</Text>
                      <Text style={styles.approvalNoteText}>{leave.approvalNote}</Text>
                    </View>
                  )}

                  {leave.status === 'PENDING' && (
                    <TouchableOpacity
                      style={styles.cancelRequestButton}
                      onPress={() => handleCancelLeave(leave.id)}
                    >
                      <Text style={styles.cancelRequestButtonText}>Batalkan</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
                  Menampilkan {displayedLeaveRequests.length} dari {allLeaveRequests.length} pengajuan
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4DB8B8',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  balanceSubLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  pendingInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  pendingInfoText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4DB8B8',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 55,
    width: '100%',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  attachButton: {
    borderWidth: 1,
    borderColor: '#4DB8B8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  attachButtonText: {
    color: '#4DB8B8',
    fontSize: 14,
  },
  attachmentName: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4DB8B8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  requestDays: {
    fontSize: 14,
    color: '#4DB8B8',
    fontWeight: '600',
  },
  requestReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  approvalNote: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB8B8',
  },
  approvalNoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  approvalNoteText: {
    fontSize: 12,
    color: '#666',
  },
  cancelRequestButton: {
    marginTop: 12,
    backgroundColor: '#fee',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  cancelRequestButtonText: {
    color: '#c00',
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
