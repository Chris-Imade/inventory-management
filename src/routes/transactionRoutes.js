const express = require('express');
const router = express.Router();
const transactionController = require('../transactions/transactionController');
const { isAuthenticated } = require('../middleware/auth');
const { transactionValidation } = require('../utils/validators');

router.use(isAuthenticated);

router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/daily-summary', transactionController.getDailySummary);
router.get('/:id', transactionController.getTransactionById);
router.get('/:id/print', transactionController.printReceipt);

router.post('/', transactionValidation.create, transactionController.createTransaction);
router.post('/:id/cancel', transactionValidation.cancel, transactionController.cancelTransaction);
router.post('/print-summary', transactionController.printDailySummary);

module.exports = router;
