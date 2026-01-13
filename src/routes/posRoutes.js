const express = require('express');
const router = express.Router();
const posController = require('../pos/posController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.post('/scan', posController.scanBarcode);
router.get('/search', posController.searchItems);
router.post('/cart-summary', posController.getCartSummary);
router.post('/checkout', posController.processTransaction);

module.exports = router;
