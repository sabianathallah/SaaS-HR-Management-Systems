/**
 * Midtrans Iris Service
 * For disbursement/payout to employee bank accounts
 * 
 * Note: This is a mock implementation. 
 * To use real Midtrans Iris API, install: npm install midtrans-client
 * and configure with your Midtrans credentials.
 */

class MidtransService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'your-server-key';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'your-client-key';
    
    // In production, initialize real Midtrans client
    // const midtransClient = require('midtrans-client');
    // this.iris = new midtransClient.Iris({
    //   isProduction: this.isProduction,
    //   serverKey: this.serverKey
    // });
  }

  /**
   * Create beneficiary (register employee bank account)
   * @param {Object} beneficiaryData - Beneficiary information
   * @returns {Promise<Object>} Created beneficiary
   */
  async createBeneficiary(beneficiaryData) {
    try {
      const { name, accountNumber, bankCode, email } = beneficiaryData;

      // Mock implementation
      console.log('[Midtrans] Creating beneficiary:', beneficiaryData);

      // In production, use real API:
      // const result = await this.iris.createBeneficiaries({
      //   name,
      //   account: accountNumber,
      //   bank: bankCode,
      //   alias_name: name.substring(0, 20),
      //   email
      // });

      // Mock response
      return {
        status: 'created',
        beneficiaryId: `BEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        accountNumber,
        bankCode,
        email
      };
    } catch (error) {
      console.error('[Midtrans] Error creating beneficiary:', error);
      throw new Error(`Failed to create beneficiary: ${error.message}`);
    }
  }

  /**
   * Create payout/disbursement to beneficiary
   * @param {Object} payoutData - Payout information
   * @returns {Promise<Object>} Payout result
   */
  async createPayout(payoutData) {
    try {
      const { 
        beneficiaryId, 
        amount, 
        notes, 
        referenceId 
      } = payoutData;

      console.log('[Midtrans] Creating payout:', payoutData);

      // In production, use real API:
      // const result = await this.iris.createPayouts({
      //   payouts: [{
      //     beneficiary_name: beneficiaryId,
      //     beneficiary_account: accountNumber,
      //     beneficiary_bank: bankCode,
      //     amount: amount,
      //     notes: notes
      //   }]
      // });

      // Mock response
      const mockReferenceId = referenceId || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        status: 'processing',
        referenceId: mockReferenceId,
        amount,
        createdAt: new Date(),
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
        message: 'Payout is being processed'
      };
    } catch (error) {
      console.error('[Midtrans] Error creating payout:', error);
      throw new Error(`Failed to create payout: ${error.message}`);
    }
  }

  /**
   * Create batch disbursement for multiple employees
   * @param {Array} payouts - Array of payout data
   * @param {string} batchName - Batch name/identifier
   * @returns {Promise<Object>} Batch payout result
   */
  async createBatchPayout(payouts, batchName = 'Payroll Disbursement') {
    try {
      console.log(`[Midtrans] Creating batch payout: ${batchName}`, {
        totalPayouts: payouts.length,
        totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0)
      });

      // In production, use real API:
      // const irisPayouts = payouts.map(p => ({
      //   beneficiary_name: p.beneficiaryName,
      //   beneficiary_account: p.accountNumber,
      //   beneficiary_bank: p.bankCode,
      //   beneficiary_email: p.email,
      //   amount: p.amount,
      //   notes: p.notes || batchName
      // }));
      // 
      // const result = await this.iris.createPayouts({
      //   payouts: irisPayouts
      // });

      // Mock response
      const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const results = payouts.map((payout, index) => ({
        employeeId: payout.employeeId,
        employeeName: payout.employeeName,
        referenceId: `${batchId}-${index + 1}`,
        amount: payout.amount,
        status: 'processing',
        accountNumber: payout.accountNumber,
        bankName: payout.bankName
      }));

      return {
        success: true,
        batchId,
        batchName,
        totalPayouts: payouts.length,
        totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
        results,
        createdAt: new Date(),
        message: 'Batch payout created successfully'
      };
    } catch (error) {
      console.error('[Midtrans] Error creating batch payout:', error);
      throw new Error(`Failed to create batch payout: ${error.message}`);
    }
  }

  /**
   * Get payout status
   * @param {string} referenceId - Payout reference ID
   * @returns {Promise<Object>} Payout status
   */
  async getPayoutStatus(referenceId) {
    try {
      console.log('[Midtrans] Getting payout status:', referenceId);

      // In production, use real API:
      // const result = await this.iris.getPayoutDetails(referenceId);

      // Mock response (random status for demo)
      const statuses = ['processing', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        referenceId,
        status: randomStatus,
        amount: 5000000,
        completedAt: randomStatus === 'completed' ? new Date() : null,
        failureReason: randomStatus === 'failed' ? 'Invalid bank account' : null
      };
    } catch (error) {
      console.error('[Midtrans] Error getting payout status:', error);
      throw new Error(`Failed to get payout status: ${error.message}`);
    }
  }

  /**
   * Handle webhook callback from Midtrans
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} Processed webhook data
   */
  handleWebhook(webhookData) {
    try {
      console.log('[Midtrans] Webhook received:', webhookData);

      // In production, verify webhook signature:
      // const crypto = require('crypto');
      // const hash = crypto.createHash('sha512')
      //   .update(webhookData.order_id + webhookData.status_code + webhookData.gross_amount + this.serverKey)
      //   .digest('hex');
      // 
      // if (hash !== webhookData.signature_key) {
      //   throw new Error('Invalid signature');
      // }

      const {
        reference_id,
        status,
        amount,
        beneficiary_name,
        beneficiary_account,
        created_at,
        completed_at,
        failure_reason
      } = webhookData;

      return {
        referenceId: reference_id,
        status,
        amount: parseFloat(amount),
        beneficiaryName: beneficiary_name,
        beneficiaryAccount: beneficiary_account,
        createdAt: created_at,
        completedAt: completed_at,
        failureReason: failure_reason
      };
    } catch (error) {
      console.error('[Midtrans] Error handling webhook:', error);
      throw new Error(`Failed to handle webhook: ${error.message}`);
    }
  }

  /**
   * Get list of supported banks
   * @returns {Promise<Array>} List of banks
   */
  async getBankList() {
    try {
      // In production, use real API:
      // const result = await this.iris.getBeneficiaryBanks();

      // Mock bank list (common Indonesian banks)
      return [
        { code: 'bca', name: 'Bank Central Asia (BCA)' },
        { code: 'mandiri', name: 'Bank Mandiri' },
        { code: 'bni', name: 'Bank Negara Indonesia (BNI)' },
        { code: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
        { code: 'cimb', name: 'CIMB Niaga' },
        { code: 'permata', name: 'Bank Permata' },
        { code: 'danamon', name: 'Bank Danamon' },
        { code: 'btn', name: 'Bank Tabungan Negara (BTN)' },
        { code: 'mega', name: 'Bank Mega' },
        { code: 'bsi', name: 'Bank Syariah Indonesia (BSI)' }
      ];
    } catch (error) {
      console.error('[Midtrans] Error getting bank list:', error);
      throw error;
    }
  }

  /**
   * Validate bank account
   * @param {string} bankCode - Bank code
   * @param {string} accountNumber - Account number
   * @returns {Promise<Object>} Validation result
   */
  async validateBankAccount(bankCode, accountNumber) {
    try {
      console.log('[Midtrans] Validating bank account:', { bankCode, accountNumber });

      // In production, use real API:
      // const result = await this.iris.validateBankAccount({
      //   bank: bankCode,
      //   account: accountNumber
      // });

      // Mock validation
      return {
        isValid: true,
        accountName: 'JOHN DOE',
        bankCode,
        accountNumber
      };
    } catch (error) {
      console.error('[Midtrans] Error validating bank account:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }
}

module.exports = new MidtransService();
