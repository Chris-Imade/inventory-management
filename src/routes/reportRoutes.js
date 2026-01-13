const express = require('express');
const router = express.Router();
const reportController = require('../reports/reportController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/inventory', reportController.getInventoryReport);
router.get('/transactions', reportController.getTransactionReport);
router.get('/low-stock', reportController.getLowStockReport);
router.get('/expiry', reportController.getExpiryReport);

module.exports = router;
