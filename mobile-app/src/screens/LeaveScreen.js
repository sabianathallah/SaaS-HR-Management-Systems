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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { leaveService, overtimeService } from '../services';
import { formatDate, calculateDaysBetween } from '../utils/dateFormatter';
import { getLeaveTypeLabel, getStatusLabel, getStatusColor } from '../utils/helpers';

export default function LeaveScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('leave'); // 'leave' or 'overtime'

  // Leave State
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'ANNUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
  });

  // Overtime State
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [overtimeHistory, setOvertimeHistory] = useState([]);
  const [showOvertimeForm, setShowOvertimeForm] = useState(false);
  const [showOvertimeHistory, setShowOvertimeHistory] = useState(false);
  const [overtimeForm, setOvertimeForm] = useState({
    overtimeDate: '',
    requestedHours: '',
    reason: '',
  });

  useEffect(() => {
    if (activeSection === 'leave') {
      fetchLeaveData();
    } else {
      fetchOvertimeData();
    }
  }, [activeSection]);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [requestsRes, balanceRes] = await Promise.all([
        leaveService.getLeaveRequests(),
        leaveService.getLeaveBalance(),
      ]);

      if (requestsRes.success) {
        setLeaveRequests(requestsRes.data || []);
      }
      if (balanceRes.success) {
        setLeaveBalance(balanceRes.data);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeData = async () => {
    setLoading(true);
    try {
      const response = await overtimeService.getOvertimeRequests();
      if (response.success) {
        setOvertimeRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching overtime data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeHistory = async () => {
    try {
      const response = await overtimeService.getOvertimeHistory();
      if (response.success) {
        setOvertimeHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching overtime history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeSection === 'leave') {
      await fetchLeaveData();
    } else {
      await fetchOvertimeData();
      if (showOvertimeHistory) {
        await fetchOvertimeHistory();
      }
    }
    setRefreshing(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setLeaveForm({ ...leaveForm, attachment: result });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleLeaveSubmit = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (leaveForm.reason.trim().length < 10) {
      Alert.alert('Error', 'Alasan minimal 10 karakter');
      return;
    }

    setLoading(true);
    try {
      const response = await leaveService.createLeaveRequest(
        leaveForm.leaveType,
        leaveForm.startDate,
        leaveForm.endDate,
        leaveForm.reason,
        leaveForm.attachment
      );

      if (response.success) {
        Alert.alert('Berhasil', 'Pengajuan cuti/izin berhasil dikirim');
        setShowLeaveForm(false);
        setLeaveForm({
          leaveType: 'ANNUAL_LEAVE',
          startDate: '',
          endDate: '',
          reason: '',
          attachment: null,
        });
        fetchLeaveData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal mengajukan cuti/izin');
    } finally {
      setLoading(false);
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

  const handleOvertimeSubmit = async () => {
    if (!overtimeForm.overtimeDate || !overtimeForm.requestedHours || !overtimeForm.reason) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (overtimeForm.reason.trim().length < 10) {
      Alert.alert('Error', 'Alasan minimal 10 karakter');
      return;
    }

    setLoading(true);
    try {
      const response = await overtimeService.createOvertimeRequest(
        overtimeForm.overtimeDate,
        overtimeForm.requestedHours,
        overtimeForm.reason
      );

      if (response.success) {
        Alert.alert('Berhasil', 'Pengajuan overtime berhasil dikirim');
        setShowOvertimeForm(false);
        setOvertimeForm({
          overtimeDate: '',
          requestedHours: '',
          reason: '',
        });
        fetchOvertimeData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal mengajukan overtime');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOvertime = async (id) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin membatalkan overtime ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              await overtimeService.cancelOvertimeRequest(id);
              Alert.alert('Berhasil', 'Overtime berhasil dibatalkan');
              fetchOvertimeData();
            } catch (error) {
              Alert.alert('Error', 'Gagal membatalkan overtime');
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
        <Text style={styles.headerTitle}>Cuti & Overtime</Text>
      </View>

      {/* Section Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'leave' && styles.tabActive]}
          onPress={() => setActiveSection('leave')}
        >
          <Text style={[styles.tabText, activeSection === 'leave' && styles.tabTextActive]}>
            Cuti & Izin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'overtime' && styles.tabActive]}
          onPress={() => setActiveSection('overtime')}
        >
          <Text style={[styles.tabText, activeSection === 'overtime' && styles.tabTextActive]}>
            Overtime
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeSection === 'leave' ? (
          <>
            {/* Leave Balance */}
            {leaveBalance && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Saldo Cuti</Text>
                <View style={styles.balanceGrid}>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Total Jatah</Text>
                    <Text style={[styles.balanceValue, { color: '#2563eb' }]}>
                      {leaveBalance.annualLeaveQuota || 0}
                    </Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Terpakai</Text>
                    <Text style={[styles.balanceValue, { color: '#dc2626' }]}>
                      {leaveBalance.usedLeaveQuota || 0}
                    </Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Sisa</Text>
                    <Text style={[styles.balanceValue, { color: '#16a34a' }]}>
                      {leaveBalance.remainingLeaveQuota || 0}
                    </Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Pending</Text>
                    <Text style={[styles.balanceValue, { color: '#ca8a04' }]}>
                      {leaveBalance.pendingLeaveDays || 0}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Leave Form */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.formToggle}
                onPress={() => setShowLeaveForm(!showLeaveForm)}
              >
                <Text style={styles.formToggleText}>
                  {showLeaveForm ? '❌ Tutup Form' : '➕ Ajukan Cuti/Izin'}
                </Text>
              </TouchableOpacity>

              {showLeaveForm && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Form Pengajuan</Text>

                  <Text style={styles.label}>Jenis Cuti/Izin</Text>
                  <Picker
                    selectedValue={leaveForm.leaveType}
                    onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="🏖️ Cuti Tahunan" value="ANNUAL_LEAVE" />
                    <Picker.Item label="🤒 Sakit" value="SICK_LEAVE" />
                    <Picker.Item label="📝 Izin" value="PERMISSION" />
                  </Picker>

                  <Text style={styles.label}>Tanggal Mulai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={leaveForm.startDate}
                    onChangeText={(value) => setLeaveForm({ ...leaveForm, startDate: value })}
                  />

                  <Text style={styles.label}>Tanggal Selesai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={leaveForm.endDate}
                    onChangeText={(value) => setLeaveForm({ ...leaveForm, endDate: value })}
                  />

                  {leaveForm.startDate && leaveForm.endDate && (
                    <View style={styles.durationInfo}>
                      <Text style={styles.durationText}>
                        📅 Durasi: {calculateDaysBetween(leaveForm.startDate, leaveForm.endDate)} hari
                      </Text>
                    </View>
                  )}

                  <Text style={styles.label}>Alasan (Min. 10 karakter)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Jelaskan alasan..."
                    value={leaveForm.reason}
                    onChangeText={(value) => setLeaveForm({ ...leaveForm, reason: value })}
                    multiline
                    numberOfLines={4}
                  />
                  <Text style={styles.charCount}>
                    {leaveForm.reason.length}/10 karakter
                  </Text>

                  <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
                    <Text style={styles.attachButtonText}>
                      📎 {leaveForm.attachment ? leaveForm.attachment.name : 'Lampirkan File (Opsional)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleLeaveSubmit}
                    disabled={loading}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Leave History */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Riwayat Pengajuan</Text>
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <View key={leave.id} style={styles.leaveItem}>
                    <View style={styles.leaveHeader}>
                      <Text style={styles.leaveType}>{getLeaveTypeLabel(leave.leaveType)}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(leave.status).bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(leave.status).text },
                          ]}
                        >
                          {getStatusLabel(leave.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.leaveDate}>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </Text>
                    <Text style={styles.leaveDuration}>{leave.totalDays} hari</Text>
                    {leave.status === 'PENDING' && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelLeave(leave.id)}
                      >
                        <Text style={styles.cancelButtonText}>Batalkan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Belum ada pengajuan</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Overtime Form */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.formToggle}
                onPress={() => setShowOvertimeForm(!showOvertimeForm)}
              >
                <Text style={styles.formToggleText}>
                  {showOvertimeForm ? '❌ Tutup Form' : '➕ Request Overtime'}
                </Text>
              </TouchableOpacity>

              {showOvertimeForm && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Form Overtime</Text>

                  <Text style={styles.label}>Tanggal Overtime</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={overtimeForm.overtimeDate}
                    onChangeText={(value) => setOvertimeForm({ ...overtimeForm, overtimeDate: value })}
                  />

                  <Text style={styles.label}>Jam Overtime (0.5 - 12)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2.5"
                    value={overtimeForm.requestedHours}
                    onChangeText={(value) => setOvertimeForm({ ...overtimeForm, requestedHours: value })}
                    keyboardType="decimal-pad"
                  />

                  <Text style={styles.label}>Alasan (Min. 10 karakter)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Jelaskan alasan..."
                    value={overtimeForm.reason}
                    onChangeText={(value) => setOvertimeForm({ ...overtimeForm, reason: value })}
                    multiline
                    numberOfLines={4}
                  />

                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleOvertimeSubmit}
                    disabled={loading}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Mengirim...' : 'Kirim Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Overtime Requests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pengajuan Overtime</Text>
              {overtimeRequests.length > 0 ? (
                overtimeRequests.map((ot) => (
                  <View key={ot.id} style={styles.overtimeItem}>
                    <View style={styles.overtimeHeader}>
                      <Text style={styles.overtimeDate}>{formatDate(ot.overtimeDate)}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(ot.status).bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(ot.status).text },
                          ]}
                        >
                          {ot.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.overtimeHours}>
                      Requested: {ot.requestedHours} jam | Approved: {ot.actualHours || '-'} jam
                    </Text>
                    {ot.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelOvertime(ot.id)}
                      >
                        <Text style={styles.cancelButtonText}>Batalkan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Belum ada pengajuan overtime</Text>
              )}
            </View>

            {/* Overtime History Toggle */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.formToggle}
                onPress={() => {
                  const newValue = !showOvertimeHistory;
                  setShowOvertimeHistory(newValue);
                  if (newValue && overtimeHistory.length === 0) {
                    fetchOvertimeHistory();
                  }
                }}
              >
                <Text style={styles.formToggleText}>
                  {showOvertimeHistory ? '📋 Sembunyikan Riwayat' : '📋 Lihat Riwayat Overtime'}
                </Text>
              </TouchableOpacity>

              {showOvertimeHistory && (
                <View style={styles.historyContainer}>
                  {overtimeHistory.length > 0 ? (
                    overtimeHistory.map((ot) => (
                      <View key={ot.id} style={styles.historyItem}>
                        <Text style={styles.historyDate}>{formatDate(ot.overtimeDate)}</Text>
                        <Text style={styles.historyHours}>
                          {ot.actualHours || ot.requestedHours} jam disetujui
                        </Text>
                        <Text style={styles.historyReason}>{ot.reason}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Belum ada riwayat overtime</Text>
                  )}
                </View>
              )}
            </View>
          </>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
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
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  balanceItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formToggle: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  formToggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    marginTop: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  charCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  durationInfo: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#92400e',
  },
  attachButton: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  attachButtonText: {
    color: '#1e293b',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  leaveDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  leaveDuration: {
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
  cancelButton: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  overtimeItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  overtimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overtimeDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  overtimeHours: {
    fontSize: 13,
    color: '#64748b',
  },
  historyContainer: {
    marginTop: 12,
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyHours: {
    fontSize: 13,
    color: '#16a34a',
    marginBottom: 4,
  },
  historyReason: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 16,
  },
});
