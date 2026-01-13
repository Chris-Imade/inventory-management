const transactionService = require('./transactionService');
const printerService = require('../services/printerService');
const { asyncHandler } = require('../utils/errorHandler');
const { config } = require('../config');

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  
  res.status(201).json({
    success: true,
    data: transaction,
  });
});

const cancelTransaction = asyncHandler(async (req, res) => {
  const cancellationData = {
    cancellationReason: req.body.cancellationReason,
    cancelledBy: req.user?.username || 'admin',
  };

  const transaction = await transactionService.cancelTransaction(req.params.id, cancellationData);
  
  res.status(200).json({
    success: true,
    data: transaction,
  });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: transaction,
  });
});

const getAllTransactions = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    patientId: req.query.patientId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: req.query.limit,
  };

  const transactions = await transactionService.getAllTransactions(filters);
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

const getTransactionStats = asyncHandler(async (req, res) => {
  const stats = await transactionService.getTransactionStats(
    req.query.startDate,
    req.query.endDate
  );
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

const getDailySummary = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const summary = await transactionService.getDailySummary(date);
  
  res.status(200).json({
    success: true,
    data: summary,
  });
});

const printReceipt = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  
  // Mark receipt as printed
  transaction.receiptPrinted = true;
  transaction.printedAt = new Date();
  await transaction.save();
  
  // Render HTML receipt page
  res.render('receipt', {
    transaction,
    clinic: config.clinic
  });
});

const printDailySummary = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const summary = await transactionService.getDailySummary(date);
  const result = await printerService.printDailySummary(summary, config.clinic);
  
  res.status(200).json({
    success: result.success,
    message: result.message,
    summary: result.text,
  });
});

module.exports = {
  createTransaction,
  cancelTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionStats,
  getDailySummary,
  printReceipt,
  printDailySummary,
};
