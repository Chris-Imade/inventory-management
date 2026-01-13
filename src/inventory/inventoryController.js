const inventoryService = require('./inventoryService');
const { asyncHandler } = require('../utils/errorHandler');
const { generateBarcodeForItem } = require('../barcode/barcodeService');

const getAllItems = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    search: req.query.search,
    lowStock: req.query.lowStock,
    expired: req.query.expired,
  };

  const items = await inventoryService.getAllItems(filters);
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const getItemById = asyncHandler(async (req, res) => {
  const item = await inventoryService.getItemById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const getItemByBarcode = asyncHandler(async (req, res) => {
  const item = await inventoryService.getItemByBarcode(req.params.barcode);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const createItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.createItem(req.body);
  
  res.status(201).json({
    success: true,
    data: item,
  });
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.updateItem(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const adjustQuantity = asyncHandler(async (req, res) => {
  const { adjustment, reason } = req.body;
  const item = await inventoryService.adjustQuantity(req.params.id, adjustment, reason);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const deactivateItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.deactivateItem(req.params.id);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await inventoryService.getLowStockItems();
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const getExpiringItems = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 90;
  const items = await inventoryService.getExpiringItems(days);
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const getExpiredItems = asyncHandler(async (req, res) => {
  const items = await inventoryService.getExpiredItems();
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const getInventoryStats = asyncHandler(async (req, res) => {
  const stats = await inventoryService.getInventoryStats();
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

const generateBarcode = asyncHandler(async (req, res) => {
  const item = await inventoryService.getItemById(req.params.id);
  const barcodeData = await generateBarcodeForItem(item);
  
  res.status(200).json({
    success: true,
    data: barcodeData,
  });
});

module.exports = {
  getAllItems,
  getItemById,
  getItemByBarcode,
  createItem,
  updateItem,
  adjustQuantity,
  deactivateItem,
  getLowStockItems,
  getExpiringItems,
  getExpiredItems,
  getInventoryStats,
  generateBarcode,
};
