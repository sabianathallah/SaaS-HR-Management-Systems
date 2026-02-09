const { Payroll, PayrollPeriod, PayrollHistory } = require('../models');
const MidtransService = require('../helpers/midtransService');
const NotificationHelper = require('../helpers/notificationHelper');

class WebhookController {
  /**
   * Handle Midtrans webhook for payment status updates
   */
  static async handleMidtransWebhook(req, res, next) {
    try {
      const webhookData = req.body;

      console.log('[Webhook] Received Midtrans webhook:', webhookData);

      // Process webhook data
      const processedData = MidtransService.handleWebhook(webhookData);

      const {
        referenceId,
        status,
        amount,
        beneficiaryName,
        beneficiaryAccount,
        completedAt,
        failureReason
      } = processedData;

      // Find payroll by reference ID
      const payroll = await Payroll.findOne({
        where: { midtransReferenceId: referenceId },
        include: [{ model: PayrollPeriod, as: 'period' }]
      });

      if (!payroll) {
        console.warn('[Webhook] Payroll not found for reference:', referenceId);
        return res.status(404).json({
          success: false,
          message: 'Payroll not found'
        });
      }

      // Update payroll based on status
      let newStatus = payroll.status;
      let updateData = {};

      switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
        case 'paid':
          newStatus = 'paid';
          updateData = {
            status: newStatus,
            paidAt: completedAt || new Date(),
            paymentProofUrl: webhookData.receipt_url || null
          };

          // Send notification to employee
          await NotificationHelper.sendPayrollNotification(
            payroll.UserId,
            'Gaji Sudah Ditransfer! 💰',
            `Gaji untuk periode ${payroll.period?.periodName} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditransfer ke rekening Anda.`,
            'payroll',
            { payrollId: payroll.id, periodId: payroll.PayrollPeriodId }
          );
          break;

        case 'failed':
        case 'rejected':
          newStatus = 'failed';
          updateData = {
            status: newStatus,
            notes: failureReason || 'Payment failed'
          };

          // Notify admin about failure
          console.error('[Webhook] Payment failed:', {
            payrollId: payroll.id,
            employee: payroll.employeeName,
            reason: failureReason
          });
          break;

        case 'processing':
        case 'pending':
          newStatus = 'processing';
          updateData = { status: newStatus };
          break;

        default:
          console.warn('[Webhook] Unknown status:', status);
      }

      // Update payroll
      await payroll.update(updateData);

      // Log history
      await PayrollHistory.create({
        PayrollId: payroll.id,
        PayrollPeriodId: payroll.PayrollPeriodId,
        action: newStatus === 'paid' ? 'payment_success' : 
                newStatus === 'failed' ? 'payment_failed' : 'payment_processing',
        performedBy: 1, // System user
        performedByName: 'System',
        performedByRole: 'SYSTEM',
        notes: `Payment status updated to ${newStatus}. ${failureReason || ''}`,
        metadata: processedData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Check if all payrolls in period are completed
      if (newStatus === 'paid') {
        await this.checkPeriodCompletion(payroll.PayrollPeriodId);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('[Webhook] Error processing webhook:', error);
      
      // Still return 200 to prevent Midtrans from retrying
      res.status(200).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check if all payrolls in a period are completed
   */
  static async checkPeriodCompletion(periodId) {
    try {
      const period = await PayrollPeriod.findByPk(periodId);
      if (!period) return;

      const payrolls = await Payroll.findAll({
        where: { PayrollPeriodId: periodId }
      });

      const allPaid = payrolls.every(p => p.status === 'paid');
      const anyFailed = payrolls.some(p => p.status === 'failed');

      if (allPaid) {
        await period.update({ status: 'paid' });
        
        await PayrollHistory.create({
          PayrollPeriodId: periodId,
          action: 'payment_success',
          performedBy: 1,
          performedByName: 'System',
          performedByRole: 'SYSTEM',
          notes: 'All payrolls in this period have been paid successfully'
        });

        console.log('[Webhook] Period completed:', period.periodName);
      } else if (anyFailed) {
        console.warn('[Webhook] Some payrolls failed in period:', period.periodName);
      }
    } catch (error) {
      console.error('[Webhook] Error checking period completion:', error);
    }
  }

  /**
   * Test webhook endpoint (for development)
   */
  static async testWebhook(req, res, next) {
    try {
      const { referenceId, status } = req.body;

      const mockWebhookData = {
        reference_id: referenceId,
        status: status || 'completed',
        amount: 5000000,
        beneficiary_name: 'Test Employee',
        beneficiary_account: '1234567890',
        created_at: new Date(),
        completed_at: new Date(),
        receipt_url: 'https://example.com/receipt.pdf'
      };

      // Call the webhook handler
      req.body = mockWebhookData;
      await this.handleMidtransWebhook(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WebhookController;
