const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// Midtrans webhook (no authentication required - Midtrans calls this)
router.post('/midtrans', WebhookController.handleMidtransWebhook);

// Test webhook (for development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', WebhookController.testWebhook);
}

module.exports = router;
