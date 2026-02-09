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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PlayArrow as GenerateIcon,
  CheckCircle as ApproveIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../config/axios';

const PayrollPeriodList = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/payroll_isAdmin/periods');
      setPeriods(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll periods');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    // Auto-generate dates for next month
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

    // Validate date logic
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

  const handleGeneratePayrolls = async (periodId) => {
    if (!confirm('Generate payrolls for all active employees?')) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/generate`);
      alert(`Successfully generated ${response.data.data.totalGenerated} payrolls!`);
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payrolls');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (periodId) => {
    if (!confirm('Submit this period for approval?')) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/submit`);
      alert('Payroll submitted for approval!');
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit for approval');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
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
      pending: 'Pending Review',
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
        <Typography variant="h4" fontWeight="bold">
          💰 Payroll Periods
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
                          {format(new Date(period.periodStart), 'MMM dd, yyyy')} - {format(new Date(period.periodEnd), 'MMM dd, yyyy')}
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
                              onClick={() => navigate(`/payroll/periods/${period.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {period.status === 'draft' && (
                            <Tooltip title="Generate Payrolls">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleGeneratePayrolls(period.id)}
                                disabled={loading}
                              >
                                <GenerateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {period.status === 'pending' && (
                            <Tooltip title="Submit for Approval">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleSubmitForApproval(period.id)}
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
            Cancel
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
    </Box>
  );
};

export default PayrollPeriodList;
