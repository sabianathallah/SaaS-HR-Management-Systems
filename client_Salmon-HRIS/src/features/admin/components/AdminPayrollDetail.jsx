import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../../../shared/config/axios';

const AdminPayrollDetail = () => {
  const { payrollId } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [payrollId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/payroll_isAdmin/payrolls/${payrollId}`);
      setPayroll(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll detail');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!payroll && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {!error && <Alert severity="info">Payroll not found</Alert>}
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Payroll Detail — {payroll?.employeeName}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Employee</Typography>
              <Typography variant="h6">{payroll?.employeeName}</Typography>
              <Typography variant="caption" color="text.secondary">{payroll?.employeeEmail}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Position / Department</Typography>
              <Typography variant="body1">{payroll?.employeePosition || '-'}</Typography>
              <Typography variant="caption" color="text.secondary">{payroll?.employeeDepartment || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Period</Typography>
              <Typography variant="body1">{payroll?.period?.periodName || '-'}</Typography>
              {payroll?.period?.paymentDate && (
                <Typography variant="caption" color="text.secondary">
                  Payment: {format(new Date(payroll.period.paymentDate), 'MMM dd, yyyy')}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip
                label={payroll?.status?.toUpperCase()}
                color={getStatusColor(payroll?.status)}
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Base Salary</Typography>
              <Typography variant="h6">{formatCurrency(payroll?.baseSalary)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Working Days</Typography>
              <Typography variant="h6">{payroll?.workingDays} / {payroll?.totalDaysInPeriod} days</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Pro-rated Salary</Typography>
              <Typography variant="h6">{formatCurrency(payroll?.proratedSalary)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Earnings & Deductions */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
              EARNINGS
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Base Salary (Pro-rated)</TableCell>
                    <TableCell align="right">{formatCurrency(payroll?.proratedSalary)}</TableCell>
                  </TableRow>
                  {payroll?.overtimeHours > 0 && (
                    <TableRow>
                      <TableCell>Overtime ({payroll.overtimeHours} hrs)</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.overtimePay)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.totalAllowances > 0 && (
                    <TableRow>
                      <TableCell>Allowances</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.totalAllowances)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.totalBonuses > 0 && (
                    <TableRow>
                      <TableCell>Bonuses</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.totalBonuses)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.thr > 0 && (
                    <TableRow>
                      <TableCell>THR</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.thr)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={2}><Divider /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>TOTAL EARNINGS</strong></TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="success.main">
                        {formatCurrency(payroll?.totalEarnings)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="error.main" gutterBottom>
              DEDUCTIONS
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {payroll?.bpjsHealthEmployee > 0 && (
                    <TableRow>
                      <TableCell>BPJS Kesehatan (Karyawan)</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.bpjsHealthEmployee)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.bpjsEmploymentEmployee > 0 && (
                    <TableRow>
                      <TableCell>BPJS Ketenagakerjaan (Karyawan)</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.bpjsEmploymentEmployee)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.incomeTax > 0 && (
                    <TableRow>
                      <TableCell>PPh21</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.incomeTax)}</TableCell>
                    </TableRow>
                  )}
                  {payroll?.otherDeductions > 0 && (
                    <TableRow>
                      <TableCell>Other Deductions</TableCell>
                      <TableCell align="right">{formatCurrency(payroll?.otherDeductions)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={2}><Divider /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>TOTAL DEDUCTIONS</strong></TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="error.main">
                        {formatCurrency(payroll?.totalDeductions)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Adjustments */}
      {payroll?.adjustments?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Adjustments</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payroll.adjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell>
                        <Chip
                          label={adj.adjustmentType}
                          color={adj.adjustmentType?.toLowerCase() === 'earning' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {adj.reason}
                        {adj.isBackpay && <Chip label="Backpay" size="small" sx={{ ml: 1 }} />}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(adj.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Net Salary */}
      <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h5" fontWeight="bold">NET SALARY</Typography>
            <Typography variant="body2" color="text.secondary">Take-home pay</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="h3" fontWeight="bold" color="success.main">
              {formatCurrency(payroll?.netSalary)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminPayrollDetail;
