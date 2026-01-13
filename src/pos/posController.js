const inventoryService = require('../inventory/inventoryService');
const transactionService = require('../transactions/transactionService');
const { asyncHandler } = require('../utils/errorHandler');

const scanBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.body;
  
  const item = await inventoryService.getItemByBarcode(barcode);
  
  res.status(200).json({
    success: true,
    data: item,
  });
});

const searchItems = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  const items = await inventoryService.getAllItems({ search: query });
  
  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const processTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  
  res.status(201).json({
    success: true,
    data: transaction,
  });
});

const getCartSummary = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  let totalAmount = 0;
  const lineItems = [];
  
  for (const cartItem of items) {
    const item = await inventoryService.getItemById(cartItem.inventoryItem);
    
    const subtotal = item.sellingPrice * cartItem.quantity;
    totalAmount += subtotal;
    
    lineItems.push({
      inventoryItem: item._id,
      itemName: item.itemName,
      sku: item.sku,
      barcode: item.barcode,
      quantity: cartItem.quantity,
      unitPrice: item.sellingPrice,
      subtotal,
      availableQuantity: item.quantity,
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      lineItems,
      totalAmount,
    },
  });
});

module.exports = {
  scanBarcode,
  searchItems,
  processTransaction,
  getCartSummary,
};
