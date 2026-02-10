import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
  IconButton
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../config/axios';

const MyPayslips = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayslips();
    fetchSummary();
  }, []);

  const fetchPayslips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/payroll/my-payslips');
      setPayslips(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axiosInstance.get('/payroll/summary');
      setSummary(response.data.data || null);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const handleDownloadPayslip = async (payrollId, periodName) => {
    try {
      const response = await axiosInstance.get(`/payroll/payslips/${payrollId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${periodName.replace(/\s+/g, '_')}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download payslip');
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
      approved: 'info',
      processing: 'warning',
      paid: 'success',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      processing: 'Processing',
      paid: '✅ Paid',
      failed: 'Failed'
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        💰 My Payslips
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      p: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <ReceiptIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Latest Salary
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {formatCurrency(summary.latestSalary)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      p: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <TrendingUpIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      YTD Earnings
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(summary.ytdEarnings)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'warning.light',
                      color: 'warning.dark',
                      p: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <BankIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      YTD Tax Paid
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(summary.ytdTax)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: 'info.light',
                      color: 'info.dark',
                      p: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <ReceiptIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Payslips
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {summary.totalPayslips}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payslips List */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Payslip History</Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : payslips.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No payslips available yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Your payslips will appear here after payroll processing
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {payslips.map((payslip) => (
                <Grid item xs={12} key={payslip.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography variant="h6" fontWeight="bold">
                          {payslip.period?.periodName || 'Unknown Period'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Payment Date: {payslip.period?.paymentDate ? format(new Date(payslip.period.paymentDate), 'MMM dd, yyyy') : '-'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">
                          Gross Salary
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(payslip.totalEarnings)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">
                          Deductions
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="error.main">
                          -{formatCurrency(payslip.totalDeductions)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">
                          Net Salary
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {formatCurrency(payslip.netSalary)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={1}>
                        <Chip
                          label={getStatusLabel(payslip.status)}
                          color={getStatusColor(payslip.status)}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                          {payslip.status === 'paid' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleDownloadPayslip(payslip.id, payslip.period?.periodName)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>

                    {payslip.status === 'paid' && payslip.paidAt && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" spacing={2} alignItems="center">
                          <BankIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Transferred to {payslip.bankName} - {payslip.bankAccountNumber} on{' '}
                            {format(new Date(payslip.paidAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card sx={{ mt: 3, bgcolor: 'info.lighter' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Tip:</strong> Download your payslips every month for your records. 
            You can use them for loan applications, visa applications, or annual tax reporting (SPT).
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyPayslips;
