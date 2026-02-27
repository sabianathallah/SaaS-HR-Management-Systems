import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '../../../shared/config/axios';

const PayrollPeriodDetail = () => {
  const { periodId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Adjustment dialog
  const [openAdjustmentDialog, setOpenAdjustmentDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'EARNING',
    reason: '',
    amount: '',
    description: '',
    isBackpay: false,
    referenceMonth: ''
  });

  // Approve confirmation
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [approvePayrollId, setApprovePayrollId] = useState(null);

  // Process payment confirmation
  const [paymentConfirm, setPaymentConfirm] = useState(false);

  // Generate payslips confirmation
  const [payslipConfirm, setPayslipConfirm] = useState(false);

  useEffect(() => {
    fetchPayrollDetail();
  }, [periodId]);

  const fetchPayrollDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/payroll_isAdmin/periods/${periodId}/payrolls`);
      const d = response.data.data;
      setPeriod(d?.period ?? null);
      setPayrolls(d?.payrolls ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll details');
    } finally {
      setLoading(false);
    }
  };

  // --- Adjustment ---

  const handleOpenAdjustment = (payroll) => {
    setSelectedPayroll(payroll);
    setAdjustmentData({
      adjustmentType: 'EARNING',
      reason: '',
      amount: '',
      description: '',
      isBackpay: false,
      referenceMonth: ''
    });
    setOpenAdjustmentDialog(true);
  };

  const handleCloseAdjustment = () => {
    setOpenAdjustmentDialog(false);
    setSelectedPayroll(null);
  };

  const handleAddAdjustment = async () => {
    if (!adjustmentData.reason || !adjustmentData.amount) {
      toast.error('Please fill in reason and amount');
      return;
    }

    const amt = parseFloat(adjustmentData.amount);
    if (isNaN(amt) || amt === 0) {
      toast.error('Amount harus berupa angka yang tidak nol');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/payrolls/${selectedPayroll.id}/adjustments`, {
        adjustmentType: adjustmentData.adjustmentType,
        reason: adjustmentData.reason,
        amount: amt,
        description: adjustmentData.description,
        isBackpay: adjustmentData.isBackpay,
        referenceMonth: adjustmentData.referenceMonth
      });
      toast.success('Adjustment added successfully!');
      handleCloseAdjustment();
      fetchPayrollDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add adjustment');
    } finally {
      setLoading(false);
    }
  };

  // --- Approve Payroll ---

  const handleApprove = (payrollId) => {
    setApprovePayrollId(payrollId);
    setApproveConfirm(true);
  };

  const confirmApprove = async () => {
    setApproveConfirm(false);
    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/payrolls/${approvePayrollId}/approve`);
      toast.success('Payroll approved successfully');
      setApprovePayrollId(null);
      fetchPayrollDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payroll');
      setApprovePayrollId(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Process Payment ---

  const handleProcessPayment = () => setPaymentConfirm(true);

  const confirmProcessPayment = async () => {
    setPaymentConfirm(false);
    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/process-payment`);
      toast.success('Payment processing initiated!');
      fetchPayrollDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // --- Generate Payslips ---

  const handleGeneratePayslips = () => setPayslipConfirm(true);

  const confirmGeneratePayslips = async () => {
    setPayslipConfirm(false);
    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/generate-payslips`);
      toast.success('Payslips generated successfully!');
      fetchPayrollDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payslips');
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
      approved: 'success',
      processing: 'info',
      paid: 'success',
      failed: 'error',
      DRAFT: 'default',
      SUBMITTED: 'warning',
      APPROVED: 'success',
      PAID: 'success'
    };
    return colors[status] || 'default';
  };

  if (loading && !period) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate('/admin/payroll/periods')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {period?.periodName || 'Payroll Period'}
        </Typography>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Period Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Period</Typography>
              <Typography variant="h6">{period?.periodName}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip
                label={period?.status?.toUpperCase()}
                color={getStatusColor(period?.status)}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Total Employees</Typography>
              <Typography variant="h6">{payrolls.length}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Total Payout</Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(payrolls.reduce((sum, p) => sum + parseFloat(p.netSalary || 0), 0))}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchPayrollDetail}
              disabled={loading}
            >
              Refresh
            </Button>

            {(period?.status === 'approved' || period?.status === 'APPROVED') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PaymentIcon />}
                  onClick={handleProcessPayment}
                  disabled={loading}
                >
                  Process Payment
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  onClick={handleGeneratePayslips}
                  disabled={loading}
                >
                  Generate Payslips
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Payrolls Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Employee Payrolls</Typography>

          {payrolls.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No payrolls generated yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Click "Generate Payrolls" to create payrolls for all employees
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Position</strong></TableCell>
                    <TableCell align="right"><strong>Gross Salary</strong></TableCell>
                    <TableCell align="right"><strong>Deductions</strong></TableCell>
                    <TableCell align="right"><strong>Net Salary</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payroll.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payroll.employeeEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payroll.employeePosition || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(payroll.totalEarnings)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(payroll.totalDeductions)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(payroll.netSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payroll.status}
                          color={getStatusColor(payroll.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/admin/payroll/detail/${payroll.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(payroll.status === 'draft' || payroll.status === 'pending' ||
                            payroll.status === 'DRAFT' || payroll.status === 'SUBMITTED') && (
                            <Tooltip title="Add Adjustment">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleOpenAdjustment(payroll)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(payroll.status === 'pending' || payroll.status === 'SUBMITTED') && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(payroll.id)}
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

      {/* Add Adjustment Dialog */}
      <Dialog open={openAdjustmentDialog} onClose={handleCloseAdjustment} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Adjustment - {selectedPayroll?.employeeName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={adjustmentData.adjustmentType}
                label="Type"
                onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value })}
              >
                <MenuItem value="EARNING">Earning (Bonus/Allowance)</MenuItem>
                <MenuItem value="DEDUCTION">Deduction (Cut/Penalty)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Reason"
              value={adjustmentData.reason}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
              placeholder="e.g., Performance Bonus Q1"
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={adjustmentData.amount}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
              placeholder="e.g., 2000000"
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={adjustmentData.description}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, description: e.target.value })}
              placeholder="Additional details..."
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Is Backpay?</InputLabel>
              <Select
                value={adjustmentData.isBackpay}
                label="Is Backpay?"
                onChange={(e) => setAdjustmentData({ ...adjustmentData, isBackpay: e.target.value })}
              >
                <MenuItem value={false}>No - Current Month</MenuItem>
                <MenuItem value={true}>Yes - Correction from Previous Month</MenuItem>
              </Select>
            </FormControl>

            {adjustmentData.isBackpay && (
              <TextField
                fullWidth
                label="Reference Month"
                type="month"
                value={adjustmentData.referenceMonth}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, referenceMonth: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Which month is this correction for?"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdjustment} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            onClick={handleAddAdjustment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveConfirm} onClose={() => setApproveConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Approve Payroll</DialogTitle>
        <DialogContent>
          <Typography>Approve this payroll record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveConfirm(false)} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmApprove}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Setujui'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Payment Confirmation Dialog */}
      <Dialog open={paymentConfirm} onClose={() => setPaymentConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Process payment for <strong>{payrolls.length}</strong> employees?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentConfirm(false)} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmProcessPayment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Konfirmasi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Payslips Confirmation Dialog */}
      <Dialog open={payslipConfirm} onClose={() => setPayslipConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Payslips</DialogTitle>
        <DialogContent>
          <Typography>Generate payslips for all employees in this period?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayslipConfirm(false)} disabled={loading}>
            Batalkan
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={confirmGeneratePayslips}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Konfirmasi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPeriodDetail;
