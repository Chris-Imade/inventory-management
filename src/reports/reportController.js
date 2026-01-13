const reportService = require('./reportService');
const { asyncHandler } = require('../utils/errorHandler');

const getInventoryReport = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    lowStock: req.query.lowStock,
  };

  const report = await reportService.generateInventoryReport(filters);
  
  if (req.query.format === 'pdf') {
    const pdf = await reportService.generatePDFReport(report, 'Inventory');
    res.contentType('application/pdf');
    res.send(pdf);
  } else if (req.query.format === 'csv') {
    const csv = reportService.generateCSV(report, 'inventory');
    res.contentType('text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
    res.send(csv);
  } else {
    res.status(200).json({
      success: true,
      data: report,
    });
  }
});

const getTransactionReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateTransactionReport(
    req.query.startDate,
    req.query.endDate
  );
  
  if (req.query.format === 'pdf') {
    const pdf = await reportService.generatePDFReport(report, 'Transaction');
    res.contentType('application/pdf');
    res.send(pdf);
  } else if (req.query.format === 'csv') {
    const csv = reportService.generateCSV(report, 'transaction');
    res.contentType('text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transaction-report.csv');
    res.send(csv);
  } else {
    res.status(200).json({
      success: true,
      data: report,
    });
  }
});

const getLowStockReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateLowStockReport();
  
  if (req.query.format === 'pdf') {
    const pdf = await reportService.generatePDFReport(report, 'Low Stock');
    res.contentType('application/pdf');
    res.send(pdf);
  } else {
    res.status(200).json({
      success: true,
      data: report,
    });
  }
});

const getExpiryReport = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 90;
  const report = await reportService.generateExpiryReport(days);
  
  if (req.query.format === 'pdf') {
    const pdf = await reportService.generatePDFReport(report, 'Expiry');
    res.contentType('application/pdf');
    res.send(pdf);
  } else {
    res.status(200).json({
      success: true,
      data: report,
    });
  }
});

module.exports = {
  getInventoryReport,
  getTransactionReport,
  getLowStockReport,
  getExpiryReport,
};
