const { InventoryItem } = require('../models');
const { generateBarcodeForItem, validateBarcodeFormat } = require('../barcode/barcodeService');
const { AppError } = require('../utils/errorHandler');
const alertService = require('../notifications/alertService');

class InventoryService {
  async createItem(itemData) {
    if (itemData.barcode && !validateBarcodeFormat(itemData.barcode)) {
      throw new AppError('Invalid barcode format', 400);
    }

    const existingSKU = await InventoryItem.findOne({ sku: itemData.sku });
    if (existingSKU) {
      throw new AppError('SKU already exists', 400);
    }

    if (itemData.barcode) {
      const existingBarcode = await InventoryItem.findOne({ barcode: itemData.barcode });
      if (existingBarcode) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    if (!itemData.barcode) {
      const barcodeData = await generateBarcodeForItem(itemData);
      itemData.barcode = barcodeData.value;
    }

    const item = await InventoryItem.create(itemData);
    
    // Auto-generate alerts for new item if needed
    await alertService.generateAlerts().catch(err => console.error('Alert generation failed:', err));
    
    return item;
  }

  async getAllItems(filters = {}) {
    const query = { isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { itemName: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } },
        { barcode: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    }

    if (filters.expired === 'true') {
      query.expirationDate = { $lt: new Date() };
    }

    const items = await InventoryItem.find(query).sort({ createdAt: -1 });
    return items;
  }

  async getItemById(id) {
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }
    return item;
  }

  async getItemByBarcode(barcode) {
    const item = await InventoryItem.findOne({ barcode, isActive: true });
    if (!item) {
      throw new AppError('Item not found with this barcode', 404);
    }
    return item;
  }

  async getItemBySKU(sku) {
    const item = await InventoryItem.findOne({ sku, isActive: true });
    if (!item) {
      throw new AppError('Item not found with this SKU', 404);
    }
    return item;
  }

  async updateItem(id, updateData) {
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    if (updateData.sku && updateData.sku !== item.sku) {
      const existingSKU = await InventoryItem.findOne({ sku: updateData.sku });
      if (existingSKU) {
        throw new AppError('SKU already exists', 400);
      }
    }

    if (updateData.barcode && updateData.barcode !== item.barcode) {
      if (!validateBarcodeFormat(updateData.barcode)) {
        throw new AppError('Invalid barcode format', 400);
      }
      const existingBarcode = await InventoryItem.findOne({ barcode: updateData.barcode });
      if (existingBarcode) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    Object.assign(item, updateData);
    await item.save();
    
    // Auto-generate alerts after update
    await alertService.generateAlerts().catch(err => console.error('Alert generation failed:', err));
    
    return item;
  }

  async adjustQuantity(id, adjustment, reason = '') {
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    const newQuantity = item.quantity + adjustment;
    if (newQuantity < 0) {
      throw new AppError('Insufficient quantity', 400);
    }

    item.quantity = newQuantity;
    await item.save();

    // Auto-generate alerts after quantity adjustment
    await alertService.generateAlerts().catch(err => console.error('Alert generation failed:', err));

    return item;
  }

  async deactivateItem(id) {
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    item.isActive = false;
    await item.save();
    return item;
  }

  async getLowStockItems() {
    const items = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).sort({ quantity: 1 });
    return items;
  }

  async getExpiringItems(days = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const items = await InventoryItem.find({
      isActive: true,
      expirationDate: {
        $gte: new Date(),
        $lte: futureDate,
      },
    }).sort({ expirationDate: 1 });
    return items;
  }

  async getExpiredItems() {
    const items = await InventoryItem.find({
      isActive: true,
      expirationDate: { $lt: new Date() },
    }).sort({ expirationDate: 1 });
    return items;
  }

  async getInventoryStats() {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockItems = await InventoryItem.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    });
    const expiredItems = await InventoryItem.countDocuments({
      isActive: true,
      expirationDate: { $lt: new Date() },
    });

    const totalValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
        },
      },
    ]);

    return {
      totalItems,
      lowStockItems,
      expiredItems,
      totalValue: totalValue[0]?.totalValue || 0,
    };
  }
}

module.exports = new InventoryService();
