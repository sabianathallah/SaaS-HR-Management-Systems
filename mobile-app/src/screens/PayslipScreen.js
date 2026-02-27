import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { payrollService } from '../services';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency, getPayslipStatusColor, getPayslipStatusLabel } from '../utils/helpers';

export default function PayslipScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allPayslips, setAllPayslips] = useState([]);
  const [displayedPayslips, setDisplayedPayslips] = useState([]);
  const [payslipSummary, setPayslipSummary] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchPayslipsData();
  }, []);

  useEffect(() => {
    applyPagination();
  }, [currentPage, allPayslips]);

  const applyPagination = () => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = allPayslips.slice(0, endIndex);
    setDisplayedPayslips(paginated);
    setHasMore(endIndex < allPayslips.length);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchPayslipsData = async () => {
    setLoading(true);
    try {
      const [payslipsRes, summaryRes] = await Promise.all([
        payrollService.getPayslips(),
        payrollService.getPayslipSummary(),
      ]);

      // Backend returns {data, message}
      if (payslipsRes.data) {
        setAllPayslips(payslipsRes.data || []);
        setCurrentPage(1);
      }
      if (summaryRes.data) {
        setPayslipSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching payslip data:', error);
      Alert.alert('Error', 'Gagal memuat data payslip');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayslipsData();
    setRefreshing(false);
  };

  const viewPayslipDetail = async (payrollId) => {
    try {
      setLoading(true);
      const response = await payrollService.getPayslipDetail(payrollId);
      
      if (response.data) {
        setSelectedPayslip(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching payslip detail:', error);
      Alert.alert('Error', 'Gagal memuat detail payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payrollId, periodName) => {
    try {
      Alert.alert(
        'Download Payslip',
        'Fitur download PDF akan segera tersedia di versi berikutnya.',
        [{ text: 'OK' }]
      );
      
      // TODO: Implement PDF download
      // const response = await payrollService.downloadPayslip(payrollId);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      Alert.alert('Error', 'Gagal mendownload payslip');
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
            <Text style={styles.headerSubtitle}>Payslip Management</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4DB8B8']} />
        }
      >
        {/* Summary Card */}
        {payslipSummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Payroll</Text>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Payslip</Text>
                <Text style={styles.summaryValue}>
                  {payslipSummary.yearToDate?.totalMonths || 0}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Gaji (YTD)</Text>
                <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                  {formatCurrency(payslipSummary.yearToDate?.totalGross || 0)}
                </Text>
              </View>
            </View>

            {payslipSummary.latestPayslip && (
              <View style={styles.latestPayslip}>
                <Text style={styles.latestLabel}>Payslip Terakhir:</Text>
                <Text style={styles.latestPeriod}>
                  {payslipSummary.latestPayslip.periodName}
                </Text>
                <Text style={styles.latestAmount}>
                  {formatCurrency(payslipSummary.latestPayslip.netSalary)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payslips List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riwayat Payslip</Text>
          
          {loading && displayedPayslips.length === 0 ? (
            <Text style={styles.emptyText}>Memuat...</Text>
          ) : displayedPayslips.length > 0 ? (
            <>
              {displayedPayslips.map((payslip) => (
                <View key={payslip.id} style={styles.payslipCard}>
                  <View style={styles.payslipHeader}>
                    <View style={styles.payslipInfo}>
                      <Text style={styles.payslipPeriod}>{payslip.period?.periodName}</Text>
                      <Text style={styles.payslipDate}>
                        {formatDate(payslip.paidAt)}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getPayslipStatusColor(payslip.status).bg }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getPayslipStatusColor(payslip.status).text }
                      ]}>
                        {getPayslipStatusLabel(payslip.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.payslipBody}>
                    <View style={styles.payslipRow}>
                      <Text style={styles.payslipLabel}>Gaji Kotor:</Text>
                      <Text style={styles.payslipValue}>
                        {formatCurrency(payslip.totalEarnings)}
                      </Text>
                    </View>
                    <View style={styles.payslipRow}>
                      <Text style={styles.payslipLabel}>Potongan:</Text>
                      <Text style={[styles.payslipValue, { color: '#ef4444' }]}>
                        - {formatCurrency(payslip.totalDeductions)}
                      </Text>
                    </View>
                    <View style={[styles.payslipRow, styles.netPayRow]}>
                      <Text style={styles.netPayLabel}>Gaji Bersih:</Text>
                      <Text style={styles.netPayValue}>
                        {formatCurrency(payslip.netSalary)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.payslipActions}>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => viewPayslipDetail(payslip.id)}
                    >
                      <Text style={styles.detailButtonText}>Detail</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadPayslip(payslip.id, payslip.period?.periodName)}
                    >
                      <Text style={styles.downloadButtonText}>📥 Download</Text>
                    </TouchableOpacity>
                  </View>
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
                  Menampilkan {displayedPayslips.length} dari {allPayslips.length} payslip
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>Belum ada payslip</Text>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedPayslip && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detail Payslip</Text>
                    <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Informasi Periode</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Periode:</Text>
                      <Text style={styles.detailValue}>{selectedPayslip.period?.periodName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tanggal Bayar:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedPayslip.paidAt)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailValue}>
                        {getPayslipStatusLabel(selectedPayslip.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Earnings */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>💰 Pendapatan</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gaji Pokok:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedPayslip.baseSalary)}
                      </Text>
                    </View>
                    {selectedPayslip.groupedDetails?.earnings && selectedPayslip.groupedDetails.earnings.length > 0 && (
                      <>
                        <Text style={styles.subSectionTitle}>Tunjangan & Komponen:</Text>
                        {selectedPayslip.groupedDetails.earnings.map((allowance, index) => (
                          <View key={index} style={styles.detailRow}>
                            <Text style={styles.detailLabel}>• {allowance.componentName}:</Text>
                            <Text style={styles.detailValue}>
                              {formatCurrency(allowance.amount)}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                    <View style={[styles.detailRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Pendapatan:</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(selectedPayslip.totalEarnings)}
                      </Text>
                    </View>
                  </View>

                  {/* Deductions */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>💸 Potongan</Text>
                    {selectedPayslip.groupedDetails?.deductions && selectedPayslip.groupedDetails.deductions.length > 0 ? (
                      selectedPayslip.groupedDetails.deductions.map((deduction, index) => (
                        <View key={index} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>• {deduction.componentName}:</Text>
                          <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                            - {formatCurrency(deduction.amount)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>Tidak ada potongan</Text>
                    )}
                    <View style={[styles.detailRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Potongan:</Text>
                      <Text style={[styles.totalValue, { color: '#ef4444' }]}>
                        - {formatCurrency(selectedPayslip.totalDeductions)}
                      </Text>
                    </View>
                  </View>

                  {/* Net Pay */}
                  <View style={[styles.detailSection, styles.netPaySection]}>
                    <View style={styles.detailRow}>
                      <Text style={styles.netPayLabelLarge}>Gaji Bersih:</Text>
                      <Text style={styles.netPayValueLarge}>
                        {formatCurrency(selectedPayslip.netSalary)}
                      </Text>
                    </View>
                  </View>

                  {/* Notes */}
                  {selectedPayslip.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>📝 Catatan</Text>
                      <Text style={styles.notesText}>{selectedPayslip.notes}</Text>
                    </View>
                  )}
                </>
              )}
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  latestPayslip: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  latestLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  latestPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  latestAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
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
  payslipCard: {
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
  payslipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  payslipInfo: {
    flex: 1,
  },
  payslipPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  payslipDate: {
    fontSize: 12,
    color: '#6b7280',
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
  payslipBody: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 12,
  },
  payslipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payslipLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  payslipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  netPayRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 4,
  },
  netPayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  netPayValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  payslipActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#4DB8B8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 20,
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
    maxHeight: '90%',
    paddingBottom: 20,
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
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  netPaySection: {
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 0,
  },
  netPayLabelLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  netPayValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
