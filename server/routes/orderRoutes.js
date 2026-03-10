const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/adminAuth');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmOrder);
router.get('/mine', protect, getMyOrders);

module.exports = router;
