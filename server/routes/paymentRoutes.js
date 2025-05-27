const express = require('express');
const {
  initiateStkPush,
  createCheckout,
  checkPaymentStatus,
  handleWebhook,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/stk', initiateStkPush);
router.post('/checkout', createCheckout);
router.get('/status/:trackingId', checkPaymentStatus);
router.post('/webhook', handleWebhook);

module.exports = router;