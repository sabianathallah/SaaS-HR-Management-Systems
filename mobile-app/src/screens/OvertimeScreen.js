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
  Modal,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { overtimeService } from '../services';
import { formatDate } from '../utils/dateFormatter';
import { getStatusLabel, getStatusColor } from '../utils/helpers';

export default function OvertimeScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allOvertimeRequests, setAllOvertimeRequests] = useState([]);
  const [displayedOvertimeRequests, setDisplayedOvertimeRequests] = useState([]);
  const [overtimeHistory, setOvertimeHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const [form, setForm] = useState({
    overtimeDate: '',
    requestedHours: '',
    reason: '',
  });

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  useEffect(() => {
    applyPagination();
  }, [currentPage, allOvertimeRequests]);

  const applyPagination = () => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = allOvertimeRequests.slice(0, endIndex);
    setDisplayedOvertimeRequests(paginated);
    setHasMore(endIndex < allOvertimeRequests.length);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchOvertimeData = async () => {
    setLoading(true);
    try {
      const response = await overtimeService.getOvertimeRequests();
      if (response.data) {
        setAllOvertimeRequests(response.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching overtime data:', error);
      Alert.alert('Error', 'Gagal memuat data overtime');
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeHistory = async () => {
    try {
      const response = await overtimeService.getOvertimeHistory();
      if (response.data) {
        setOvertimeHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching overtime history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOvertimeData();
    if (showHistory) {
      await fetchOvertimeHistory();
    }
    setRefreshing(false);
  };

  const toggleHistory = () => {
    const newValue = !showHistory;
    setShowHistory(newValue);
    if (newValue && overtimeHistory.length === 0) {
      fetchOvertimeHistory();
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.overtimeDate || !form.requestedHours || !form.reason) {
      Alert.alert('Validasi', 'Semua field harus diisi');
      return;
    }

    const hours = parseFloat(form.requestedHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Validasi', 'Jam overtime harus lebih dari 0');
      return;
    }

    setLoading(true);
    try {
      await overtimeService.createOvertimeRequest(
        form.overtimeDate,
        form.requestedHours,
        form.reason
      );

      Alert.alert(
        'Berhasil!',
        'Request overtime berhasil diajukan',
        [{ text: 'OK' }]
      );

      // Reset form
      setForm({
        overtimeDate: '',
        requestedHours: '',
        reason: '',
      });
      setShowForm(false);
      
      // Refresh data
      await fetchOvertimeData();
    } catch (error) {
      console.error('Error submitting overtime:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengajukan request overtime';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (overtimeId) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin membatalkan request overtime ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await overtimeService.cancelOvertimeRequest(overtimeId);
              Alert.alert('Berhasil', 'Request overtime berhasil dibatalkan');
              await fetchOvertimeData();
            } catch (error) {
              console.error('Error canceling overtime:', error);
              Alert.alert('Error', 'Gagal membatalkan request overtime');
            }
          },
        },
      ]
    );
  };

  const renderOvertimeCard = (overtime) => (
    <View key={overtime.id} style={styles.overtimeCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDate}>{formatDate(overtime.overtimeDate)}</Text>
          <Text style={styles.cardHours}>{overtime.requestedHours} jam</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(overtime.status).bg }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(overtime.status).text }
          ]}>
            {getStatusLabel(overtime.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.reasonLabel}>Alasan:</Text>
        <Text style={styles.reasonText}>{overtime.reason}</Text>

        {overtime.actualHours && (
          <View style={styles.actualHoursRow}>
            <Text style={styles.actualLabel}>Jam Aktual:</Text>
            <Text style={styles.actualValue}>{overtime.actualHours} jam</Text>
          </View>
        )}

        {overtime.adminNotes && (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Catatan Admin:</Text>
            <Text style={styles.notesText}>{overtime.adminNotes}</Text>
          </View>
        )}
      </View>

      {overtime.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(overtime.id)}
        >
          <Text style={styles.cancelButtonText}>❌ Batalkan</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
            <Text style={styles.headerSubtitle}>Overtime Management</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4DB8B8']} />
        }
      >
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.primaryButtonText}>➕ Request Overtime</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleHistory}
          >
            <Text style={styles.secondaryButtonText}>
              {showHistory ? '📋 Sembunyikan Riwayat' : '📋 Lihat Riwayat'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Overtime</Text>
          
          {loading && displayedOvertimeRequests.length === 0 ? (
            <Text style={styles.emptyText}>Memuat...</Text>
          ) : displayedOvertimeRequests.length > 0 ? (
            <>
              {displayedOvertimeRequests.map(renderOvertimeCard)}
              
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
                  Menampilkan {displayedOvertimeRequests.length} dari {allOvertimeRequests.length} request
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Tidak ada request overtime</Text>
            </View>
          )}
        </View>

        {/* History */}
        {showHistory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Overtime</Text>
            
            {overtimeHistory.length > 0 ? (
              overtimeHistory.map(renderOvertimeCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Belum ada riwayat overtime</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Overtime</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tanggal Overtime *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (contoh: 2026-02-15)"
                  value={form.overtimeDate}
                  onChangeText={(text) => setForm({ ...form, overtimeDate: text })}
                />
                <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Jumlah Jam *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 2.5"
                  keyboardType="decimal-pad"
                  value={form.requestedHours}
                  onChangeText={(text) => setForm({ ...form, requestedHours: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Alasan *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Jelaskan alasan overtime..."
                  multiline
                  numberOfLines={4}
                  value={form.reason}
                  onChangeText={(text) => setForm({ ...form, reason: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Mengirim...' : '✅ Submit Request'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4DB8B8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4DB8B8',
  },
  secondaryButtonText: {
    color: '#4DB8B8',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  overtimeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardHours: {
    fontSize: 14,
    color: '#4DB8B8',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  actualHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actualLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  actualValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  notesRow: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#92400e',
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  formContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4DB8B8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
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
