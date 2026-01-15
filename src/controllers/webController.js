const inventoryService = require('../inventory/inventoryService');
const transactionService = require('../transactions/transactionService');
const alertService = require('../notifications/alertService');
const { config } = require('../config');
const { asyncHandler } = require('../utils/errorHandler');

const renderInventory = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    search: req.query.search,
    lowStock: req.query.lowStock,
    expired: req.query.expired,
  };

  const items = await inventoryService.getAllItems(filters);
  const alertStats = await alertService.getAlertStats();
  
  res.render('inventory', {
    appName: config.appName,
    items,
    filters,
    user: req.session.username,
    alertCount: alertStats.total,
    page: 'inventory',
    title: 'Inventory Management',
  });
});

const renderPOS = asyncHandler(async (req, res) => {
  res.render('pos', {
    appName: config.appName,
    user: req.session.username,
  });
});

const renderTransactions = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: 50,
  };

  const transactions = await transactionService.getAllTransactions(filters);
  const alertStats = await alertService.getAlertStats();
  
  res.render('transactions', {
    appName: config.appName,
    transactions,
    filters,
    user: req.session.username,
    alertCount: alertStats.total,
    page: 'transactions',
    title: 'Transaction History',
  });
});

const renderAlerts = asyncHandler(async (req, res) => {
  const filters = {
    severity: req.query.severity,
    unreadOnly: req.query.unreadOnly || 'true',
    activOnly: 'true',
  };

  const alerts = await alertService.getAlerts(filters);
  
  res.render('alerts', {
    appName: config.appName,
    alerts,
    filters,
    user: req.session.username,
  });
});

const renderReports = asyncHandler(async (req, res) => {
  res.render('reports', {
    appName: config.appName,
    user: req.session.username,
  });
});

const renderDashboard = asyncHandler(async (req, res) => {
  const stats = await inventoryService.getInventoryStats();
  const alertStats = await alertService.getAlertStats();
  const transactionStats = await transactionService.getTransactionStats();
  
  res.render('dashboard', {
    appName: config.appName,
    user: req.session.username,
    stats,
    alertStats,
    transactionStats,
  });
});

const renderBillingCards = asyncHandler(async (req, res) => {
  const { billId } = req.query;
  let bill = null;
  
  if (billId) {
    const billingService = require('../services/billingService');
    bill = await billingService.getBillById(billId);
  }
  
  res.render('billing/cards', {
    appName: config.appName,
    user: req.session.username,
    bill,
  });
});

const renderBillingConsultation = asyncHandler(async (req, res) => {
  const { billId } = req.query;
  let bill = null;
  
  if (billId) {
    const billingService = require('../services/billingService');
    bill = await billingService.getBillById(billId);
  }
  
  res.render('billing/consultation', {
    appName: config.appName,
    user: req.session.username,
    bill,
  });
});

const renderBillingDrugs = asyncHandler(async (req, res) => {
  const { billId } = req.query;
  let bill = null;
  
  if (billId) {
    const billingService = require('../services/billingService');
    bill = await billingService.getBillById(billId);
  }
  
  res.render('billing/drugs', {
    appName: config.appName,
    user: req.session.username,
    bill,
  });
});

const renderBillingProcedure = asyncHandler(async (req, res) => {
  const { billId } = req.query;
  let bill = null;
  
  if (billId) {
    const billingService = require('../services/billingService');
    bill = await billingService.getBillById(billId);
  }
  
  res.render('billing/procedure', {
    appName: config.appName,
    user: req.session.username,
    bill,
  });
});

const renderBillingAdmission = asyncHandler(async (req, res) => {
  const { billId } = req.query;
  let bill = null;
  
  if (billId) {
    const billingService = require('../services/billingService');
    bill = await billingService.getBillById(billId);
  }
  
  res.render('billing/admission', {
    appName: config.appName,
    user: req.session.username,
    bill,
  });
});

module.exports = {
  renderInventory,
  renderPOS,
  renderTransactions,
  renderAlerts,
  renderReports,
  renderDashboard,
  renderBillingCards,
  renderBillingConsultation,
  renderBillingDrugs,
  renderBillingProcedure,
  renderBillingAdmission,
};
