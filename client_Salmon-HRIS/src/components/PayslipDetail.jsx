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
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../config/axios';

const PayslipDetail = () => {
  const { payrollId } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayslipDetail();
  }, [payrollId]);

  const fetchPayslipDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/payroll/payslips/${payrollId}`);
      setPayslip(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payslip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/payroll/payslips/${payrollId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${payslip.period?.periodName.replace(/\s+/g, '_')}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download payslip');
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!payslip) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Payslip not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} className="no-print">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate('/payroll/my-payslips')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Payslip Detail
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Stack>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Payslip Content */}
      <Card>
        <CardContent>
          {/* Header Info */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                SALARY SLIP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Period: <strong>{payslip.period?.periodName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment Date: <strong>{payslip.period?.paymentDate ? format(new Date(payslip.period.paymentDate), 'MMMM dd, yyyy') : '-'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Chip
                label={payslip.status?.toUpperCase()}
                color={getStatusColor(payslip.status)}
                size="medium"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Employee Info */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Employee Name</Typography>
              <Typography variant="h6" fontWeight="bold">{payslip.employeeName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Position</Typography>
              <Typography variant="h6">{payslip.employeePosition || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Department</Typography>
              <Typography variant="body1">{payslip.employeeDepartment || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Employment Status</Typography>
              <Typography variant="body1">{payslip.employmentStatus || '-'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Working Days Info */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Base Salary</Typography>
              <Typography variant="h6">{formatCurrency(payslip.baseSalary)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Working Days</Typography>
              <Typography variant="h6">{payslip.workingDays} / {payslip.totalDaysInPeriod} days</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Pro-rated Salary</Typography>
              <Typography variant="h6">{formatCurrency(payslip.proratedSalary)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Earnings & Deductions Table */}
          <Grid container spacing={3}>
            {/* EARNINGS */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="success.main">
                  💰 EARNINGS
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Base Salary (Pro-rated)</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.proratedSalary)}</TableCell>
                      </TableRow>
                      
                      {payslip.overtimeHours > 0 && (
                        <TableRow>
                          <TableCell>
                            Overtime ({payslip.overtimeHours} hours)
                          </TableCell>
                          <TableCell align="right">{formatCurrency(payslip.overtimePay)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.totalAllowances > 0 && (
                        <TableRow>
                          <TableCell>Allowances</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.totalAllowances)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.totalBonuses > 0 && (
                        <TableRow>
                          <TableCell>Bonuses</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.totalBonuses)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.thr > 0 && (
                        <TableRow>
                          <TableCell>THR (Tunjangan Hari Raya)</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.thr)}</TableCell>
                        </TableRow>
                      )}

                      {/* Component Details */}
                      {payslip.details?.filter(d => d.component?.type === 'earning').map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            <Typography variant="caption">{detail.component.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">{formatCurrency(detail.amount)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell colSpan={2}><Divider /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>TOTAL EARNINGS</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {formatCurrency(payslip.totalEarnings)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* DEDUCTIONS */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="error.main">
                  📉 DEDUCTIONS
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {payslip.bpjsHealthEmployee > 0 && (
                        <TableRow>
                          <TableCell>BPJS Kesehatan (1%)</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.bpjsHealthEmployee)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.bpjsEmploymentEmployee > 0 && (
                        <TableRow>
                          <TableCell>BPJS Ketenagakerjaan</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.bpjsEmploymentEmployee)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.incomeTax > 0 && (
                        <TableRow>
                          <TableCell>PPh21 (Income Tax)</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.incomeTax)}</TableCell>
                        </TableRow>
                      )}

                      {payslip.otherDeductions > 0 && (
                        <TableRow>
                          <TableCell>Other Deductions</TableCell>
                          <TableCell align="right">{formatCurrency(payslip.otherDeductions)}</TableCell>
                        </TableRow>
                      )}

                      {/* Component Details */}
                      {payslip.details?.filter(d => d.component?.type === 'deduction').map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            <Typography variant="caption">{detail.component.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">{formatCurrency(detail.amount)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell colSpan={2}><Divider /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>TOTAL DEDUCTIONS</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="error.main" fontWeight="bold">
                            {formatCurrency(payslip.totalDeductions)}
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
          {payslip.adjustments && payslip.adjustments.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📝 Adjustments
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payslip.adjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell>
                          <Chip
                            label={adj.type}
                            color={adj.type === 'earning' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {adj.reason}
                          {adj.isBackpay && (
                            <Chip label="Backpay" size="small" sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(adj.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* NET SALARY */}
          <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight="bold">
                  NET SALARY
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount to be transferred
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {formatCurrency(payslip.netSalary)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Bank Info */}
          {payslip.status === 'paid' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Transferred to:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {payslip.bankName} - {payslip.bankAccountNumber}
                </Typography>
                <Typography variant="body2">
                  a.n. {payslip.bankAccountHolderName}
                </Typography>
                {payslip.paidAt && (
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Payment Date: {format(new Date(payslip.paidAt), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                )}
              </Paper>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PayslipDetail;
