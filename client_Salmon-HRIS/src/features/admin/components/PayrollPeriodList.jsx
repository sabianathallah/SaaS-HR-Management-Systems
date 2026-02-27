import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PlayArrow as GenerateIcon,
  CheckCircle as ApproveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '../../../shared/config/axios';

const PayrollPeriodList = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('');

  // Create period dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    periodName: '',
    periodStart: '',
    periodEnd: '',
    cutoffDate: '',
    paymentDate: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Generate confirmation modal
  const [generateConfirm, setGenerateConfirm] = useState(null); // holds period object

  // Submit confirmation modal
  const [submitConfirm, setSubmitConfirm] = useState(null); // holds period object

  useEffect(() => {
    fetchPeriods();
  }, [currentPage, statusFilter]);

  const fetchPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/payroll_isAdmin/periods?page=${currentPage}&limit=10`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const response = await axiosInstance.get(url);
      const d = response.data.data;
      const list = Array.isArray(d) ? d : (d?.periods ?? d?.rows ?? []);
      setPeriods(list);
      if (d?.pagination) {
        setTotalPages(d.pagination.totalPages ?? 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll periods');
    } finally {
      setLoading(false);
    }
  };

  // --- Create Period ---

  const handleOpenDialog = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName = format(nextMonth, 'MMMM yyyy');

    const periodStart = format(new Date(nextMonth.getFullYear(), nextMonth.getMonth() - 1, 21), 'yyyy-MM-dd');
    const periodEnd = format(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20), 'yyyy-MM-dd');
    const cutoffDate = format(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20), 'yyyy-MM-dd');
    const paymentDate = format(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 25), 'yyyy-MM-dd');

    setFormData({
      periodName: monthName,
      periodStart,
      periodEnd,
      cutoffDate,
      paymentDate,
      notes: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      periodName: '',
      periodStart: '',
      periodEnd: '',
      cutoffDate: '',
      paymentDate: '',
      notes: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.periodName.trim()) errors.periodName = 'Period name is required';
    if (!formData.periodStart) errors.periodStart = 'Period start date is required';
    if (!formData.periodEnd) errors.periodEnd = 'Period end date is required';
    if (!formData.cutoffDate) errors.cutoffDate = 'Cutoff date is required';
    if (!formData.paymentDate) errors.paymentDate = 'Payment date is required';

    if (formData.periodStart && formData.periodEnd) {
      if (new Date(formData.periodStart) >= new Date(formData.periodEnd)) {
        errors.periodEnd = 'Period end must be after period start';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePeriod = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axiosInstance.post('/payroll_isAdmin/periods', formData);
      handleCloseDialog();
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create period');
    } finally {
      setLoading(false);
    }
  };

  // --- Generate Payrolls ---

  const handleGenerate = (period) => setGenerateConfirm(period);

  const confirmGenerate = async () => {
    const period = generateConfirm;
    setGenerateConfirm(null);
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/payroll_isAdmin/periods/${period.id}/generate`);
      const total = response.data?.data?.totalGenerated ?? 0;
      toast.success(`Successfully generated ${total} payrolls!`);
      fetchPeriods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payrolls');
    } finally {
      setLoading(false);
    }
  };

  // --- Submit for Approval ---

  const handleSubmit = (period) => setSubmitConfirm(period);

  const confirmSubmit = async () => {
    const period = submitConfirm;
    setSubmitConfirm(null);
    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${period.id}/submit`);
      toast.success('Payroll submitted for approval!');
      fetchPeriods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit for approval');
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending_review: 'warning',
      approved: 'success',
      processing: 'info',
      paid: 'success',
      failed: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      approved: 'Approved',
      processing: 'Processing Payment',
      paid: 'Paid',
      failed: 'Payment Failed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DollarSign size={28} /> Payroll Periods
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPeriods}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Create Period
          </Button>
        </Stack>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending_review">Pending Review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Periods Table */}
      <Card>
        <CardContent>
          {loading && !periods.length ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : periods.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No payroll periods found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Create your first payroll period to get started
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Period</strong></TableCell>
                    <TableCell><strong>Period Dates</strong></TableCell>
                    <TableCell><strong>Cutoff Date</strong></TableCell>
                    <TableCell><strong>Payment Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Total Employees</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{period.periodName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(period.periodStart), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(period.periodEnd), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(period.cutoffDate), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(period.paymentDate), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(period.status)}
                          color={getStatusColor(period.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {period.totalEmployees || 0} employees
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/admin/payroll/periods/${period.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(period.status === 'draft' || period.status === 'DRAFT') && (
                            <Tooltip title="Generate Payrolls">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleGenerate(period)}
                                disabled={loading}
                              >
                                <GenerateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {period.status === 'pending_review' && (
                            <Tooltip title="Submit for Approval">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleSubmit(period)}
                                disabled={loading}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={2}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Sebelumnya
              </Button>
              <Typography variant="body2">
                Halaman {currentPage} dari {totalPages}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Berikutnya
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Create Period Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Payroll Period</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Period Name"
              value={formData.periodName}
              onChange={(e) => setFormData({ ...formData, periodName: e.target.value })}
              error={!!formErrors.periodName}
              helperText={formErrors.periodName || 'e.g., January 2026'}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Period Start Date"
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              error={!!formErrors.periodStart}
              helperText={formErrors.periodStart || 'Usually 21st of previous month'}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Period End Date"
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              error={!!formErrors.periodEnd}
              helperText={formErrors.periodEnd || 'Usually 20th of current month'}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Cutoff Date"
              type="date"
              value={formData.cutoffDate}
              onChange={(e) => setFormData({ ...formData, cutoffDate: e.target.value })}
              error={!!formErrors.cutoffDate}
              helperText={formErrors.cutoffDate || 'Data cutoff date (usually 20th)'}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              error={!!formErrors.paymentDate}
              helperText={formErrors.paymentDate || 'Salary transfer date (usually 25th)'}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              helperText="Optional notes for this period"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePeriod}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Period'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Confirmation Dialog */}
      <Dialog open={Boolean(generateConfirm)} onClose={() => setGenerateConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Payrolls</DialogTitle>
        <DialogContent>
          <Typography>
            Generate payrolls for all active employees in period{' '}
            <strong>{generateConfirm?.periodName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateConfirm(null)} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmGenerate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Konfirmasi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit for Approval Confirmation Dialog */}
      <Dialog open={Boolean(submitConfirm)} onClose={() => setSubmitConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Submit for Approval</DialogTitle>
        <DialogContent>
          <Typography>
            Submit period <strong>{submitConfirm?.periodName}</strong> for approval?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitConfirm(null)} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Konfirmasi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPeriodList;
