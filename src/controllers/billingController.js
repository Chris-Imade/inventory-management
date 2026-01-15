const { asyncHandler } = require('../utils/errorHandler');
const billingService = require('../services/billingService');

const createOrUpdateBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const userId = req.session.userId;
  
  const bill = await billingService.createOrUpdateBill(billId || null, req.body, userId);
  
  res.status(billId ? 200 : 201).json({
    success: true,
    data: bill,
  });
});

const getBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  
  const bill = await billingService.getBillById(billId);
  
  res.status(200).json({
    success: true,
    data: bill,
  });
});

const getAllBills = asyncHandler(async (req, res) => {
  const { status, patientId, startDate, endDate } = req.query;
  
  const bills = await billingService.getAllBills({
    status,
    patientId,
    startDate,
    endDate,
  });
  
  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills,
  });
});

const updateBillStatus = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { status } = req.body;
  const userId = req.session.userId;
  
  const bill = await billingService.updateBillStatus(billId, status, userId);
  
  res.status(200).json({
    success: true,
    data: bill,
  });
});

const deleteBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  
  const result = await billingService.deleteBill(billId);
  
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const getProcedures = asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  const procedures = await billingService.getAllProcedures(search);
  
  res.status(200).json({
    success: true,
    count: procedures.length,
    data: procedures,
  });
});

const createProcedure = asyncHandler(async (req, res) => {
  const procedure = await billingService.createProcedure(req.body);
  
  res.status(201).json({
    success: true,
    data: procedure,
  });
});

const searchDrugs = asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  const drugs = await billingService.searchDrugs(search);
  
  res.status(200).json({
    success: true,
    count: drugs.length,
    data: drugs,
  });
});

const printBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { section } = req.query;
  
  const bill = await billingService.getBillById(billId);
  const billData = billingService.getCumulativeBillData(bill, section);
  
  res.status(200).json({
    success: true,
    data: billData,
  });
});

module.exports = {
  createOrUpdateBill,
  getBill,
  getAllBills,
  updateBillStatus,
  deleteBill,
  getProcedures,
  createProcedure,
  searchDrugs,
  printBill,
};
