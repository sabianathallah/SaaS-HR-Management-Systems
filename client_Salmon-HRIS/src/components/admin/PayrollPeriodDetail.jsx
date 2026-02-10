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
  Refresh as RefreshIcon,
  PlayArrow as GenerateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../../config/axios';

const PayrollPeriodDetail = () => {
  const { periodId } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAdjustmentDialog, setOpenAdjustmentDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'earning',
    reason: '',
    amount: '',
    description: '',
    isBackpay: false,
    referenceMonth: ''
  });

  useEffect(() => {
    fetchPeriodDetail();
  }, [periodId]);

  const fetchPeriodDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/payroll_isAdmin/periods/${periodId}/payrolls`);
      setPeriod(response.data.period);
      setPayrolls(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustment = (payroll) => {
    setSelectedPayroll(payroll);
    setAdjustmentData({
      type: 'earning',
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
      alert('Please fill in reason and amount');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/payrolls/${selectedPayroll.id}/adjustments`, {
        ...adjustmentData,
        amount: parseFloat(adjustmentData.amount)
      });
      alert('Adjustment added successfully!');
      handleCloseAdjustment();
      fetchPeriodDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add adjustment');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    if (!confirm('Approve this payroll?')) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/payrolls/${payrollId}/approve`);
      alert('Payroll approved!');
      fetchPeriodDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!confirm(`Process payment for ${payrolls.length} employees?`)) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/process-payment`);
      alert('Payment processing initiated!');
      fetchPeriodDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    if (!confirm('Generate payslips for all employees?')) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/payroll_isAdmin/periods/${periodId}/generate-payslips`);
      alert('Payslips generated successfully!');
      fetchPeriodDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payslips');
    } finally {
      setLoading(false);
    }
  };

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
      failed: 'error'
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
        <IconButton onClick={() => navigate('/payroll/periods')}>
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
              onClick={fetchPeriodDetail}
              disabled={loading}
            >
              Refresh
            </Button>

            {period?.status === 'approved' && (
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
                              onClick={() => navigate(`/payroll/detail/${payroll.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(payroll.status === 'draft' || payroll.status === 'pending') && (
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

                          {payroll.status === 'pending' && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprovePayroll(payroll.id)}
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
                value={adjustmentData.type}
                label="Type"
                onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value })}
              >
                <MenuItem value="earning">Earning (Bonus/Allowance)</MenuItem>
                <MenuItem value="deduction">Deduction (Cut/Penalty)</MenuItem>
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
            Cancel
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
    </Box>
  );
};

export default PayrollPeriodDetail;
