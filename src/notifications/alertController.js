const alertService = require('./alertService');
const { asyncHandler } = require('../utils/errorHandler');

const generateAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertService.generateAlerts();
  
  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
});

const getAlerts = asyncHandler(async (req, res) => {
  const filters = {
    severity: req.query.severity,
    type: req.query.type,
    unreadOnly: req.query.unreadOnly,
    activOnly: req.query.activOnly,
  };

  const alerts = await alertService.getAlerts(filters);
  
  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const alert = await alertService.markAsRead(req.params.id);
  
  res.status(200).json({
    success: true,
    data: alert,
  });
});

const dismissAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.dismissAlert(req.params.id);
  
  res.status(200).json({
    success: true,
    data: alert,
  });
});

const getAlertStats = asyncHandler(async (req, res) => {
  const stats = await alertService.getAlertStats();
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

module.exports = {
  generateAlerts,
  getAlerts,
  markAsRead,
  dismissAlert,
  getAlertStats,
};
